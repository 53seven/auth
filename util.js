const passport = require('passport');
const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

// need to run tests against local db, no prod testing
/* istanbul ignore else */
if (process.env.DYNAMODB_URL) {
  AWS.config.update({
    region: 'us-west-2',
    endpoint: process.env.DYNAMODB_URL
  });
}

const docClient = new AWS.DynamoDB.DocumentClient();

let require_auth = (req, res, next) => {
  passport.authenticate('localapikey', (err, user) => {
    /* istanbul ignore if */
    if (err) {
      return next(err);
    } else if (!user) {
      let err = new Error('unauthorized');
      err.status = 401;
      return next(err);
    } else {
      req.user = user;
      return next();
    }
  })(req, res, next);
};

let put_token = async (token, refreshToken, profile, done) => {
  try {

    // instead of putting the token in by service id, we should
    // 1. see if a entry already exists for the id of the service
    // 2. if no, generate a new uuid and put the object.
    // 3. if yes, keep old uuid, put puth with new profile.

    let item_to_save;
    let current_profile = await find_by_service_id(profile.id);

    if (!current_profile) {
      item_to_save = {
        id: uuid(),
        service_id: profile.id,
        profile
      };
    } else {
      item_to_save = {
        id: current_profile.id,
        service_id: profile.id,
        profile
      };
    }

    await docClient.put({
      TableName: 'auth',
      Item: item_to_save
    }).promise();

    done(null, item_to_save);
  } catch (err) {
    // lets just *assume* try-catch works
    /* istanbul ignore next */
    done(err);
  }
};

let find_by_service_id = async (service_id) => {
  let query = {
    TableName: 'auth',
    FilterExpression: 'service_id = :sid',
    ExpressionAttributeValues: {
      ':sid': service_id
    }
  };

  let res = await docClient.scan(query).promise();

  return res.Items[0];
};

let get_token = async (id, done) => {
  try {
    let user = await docClient.get({
      TableName: 'auth',
      Key: {
        id
      }
    }).promise();
    if (!user) {
      done(null, false);
    } else {
      done(null, user.Item);
    }
  } catch (err) {
    // lets just *assume* try-catch works
    /* istanbul ignore next */
    done(err);
  }
};

let authorized_redirect = (req, res) => {
  res.redirect(`/authorized?apikey=${req.user.id}`);
};

module.exports = {
  require_auth,
  put_token,
  get_token,
  authorized_redirect
};
