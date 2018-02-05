// auth/app.js
const path = require('path');
const service = require('@537/service');
const pck = require('./package.json');
const passport = require('passport');
const routes = require('./routes/index');

service.run(pck, {
  view_path: path.join(__dirname, 'views'),
  passport,
  routes: {
    '/': routes
  }
});
