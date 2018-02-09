@537/auth
===

[![build status](https://travis-ci.org/53seven/auth.svg)](https://travis-ci.org/53seven/auth)

A quick and dirty way to add authentication to your routes. Only supports google auth right now. Store auth tokens in DynamoDB.

```
const auth = require('@537/service');
const pck = require('./package.json');
const index_routes = require('routes/index');
const auth = require('@537/auth');

// sets up all the routes and middleware
const app = await service.run(package, {
  routes: {
    '/': [auth.routes, index_routes],
  },
  passport: auth.passport,
  view_path: path.join(__dirname, 'views'),
});

// in your routes

router.get('/secret', auth.require_auth, (req, res) => { ... });

```

License
===

MIT
