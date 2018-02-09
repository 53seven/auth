const passport = require('passport');
const AWS = require('aws-sdk');

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
      return res.redirect(401, '/unauthorized');
    } else {
      req.user = user;
      return next();
    }
  })(req, res, next);
};

let put_token = async (token, refreshToken, profile, done) => {
  try {
    await docClient.put({
      TableName: 'auth',
      Item: profile
    }).promise();
    done(null, profile);
  } catch (err) {
    // lets just *assume* try-catch works
    /* istanbul ignore next */
    done(err);
  }
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
