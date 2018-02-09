// auth/app.js
const passport = require('passport');
const routes = require('./routes');
const {require_auth} = require('./util');

module.exports = {
  routes,
  passport,
  require_auth
};

