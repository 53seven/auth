const express = require('express');
const router = express.Router();

const {require_auth} = require('../auth');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/unauthorized', (req, res) => {
  res.render('unauthorized');
});

router.get('/authorized',
  require_auth,
  (req, res) => {
    res.render('authorized', {user: req.user});
  });

module.exports = router;
