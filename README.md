@537/auth
===

[![Greenkeeper badge](https://badges.greenkeeper.io/53seven/auth.svg)](https://greenkeeper.io/)

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

Will assume that you have two routes, specified elsewhere in your app:

`/authorized` - what a user will be redirected to after successful oauth
`/unauthorized` - what a user will be redirected to after unsuccessful authorization (on any route)


License
===

MIT
