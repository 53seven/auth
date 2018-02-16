const express = require('express');
const router = express.Router();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalAPIKeyStrategy = require('passport-localapikey-update').Strategy;

const {get_token, put_token, authorized_redirect} = require('./util');

passport.use(new LocalAPIKeyStrategy(get_token));

// Skip this testing, TODO: pull out two functions below for unit testing
/* istanbul ignore if */
if (process.env.GOOGLE_CLIENT_ID) {

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, put_token));

  router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  }));

  router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/unauthorized',
    session: false
  }), authorized_redirect);
}


module.exports = router;
