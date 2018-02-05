const express = require('express');
const router = express.Router();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2',
  endpoint: process.env.DYNAMODB_URL
});

const docClient = new AWS.DynamoDB.DocumentClient();

// used to serialize the user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(async (id, done) => {
  let user = await docClient.get({
    TableName: 'auth',
    Key: {
      id
    }
  }).promise();
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}${process.env.GOOGLE_CALLBACK_PATH}`,
},
async (token, refreshToken, profile, done) => {
  await docClient.put({
    TableName: 'auth',
    Item: profile
  }).promise();
  done(null, profile);
}));

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get(process.env.GOOGLE_CALLBACK_PATH, passport.authenticate('google', {
  successRedirect : '/profile',
  failureRedirect : '/'
}));

module.exports = router;
