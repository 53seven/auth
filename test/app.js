/* global describe, it, before, after */
// mock AWS before loading up the routes
const AWS = require('aws-sdk-mock');

const id = 'this_is_an_alnum_id_1234567890';
let dynamo_db = {
  [id]: {
    Item: {
      id,
      name: '53seven'
    }
  }
};

AWS.mock('DynamoDB.DocumentClient', 'put', function(params, callback) {
  dynamo_db[params.Item.id] = params.Item;
  callback();
});

AWS.mock('DynamoDB.DocumentClient', 'get', function(params, callback) {
  callback(null, dynamo_db[params.Key.id]);
});

describe('auth', () => {

  // move bootstrapping code inside describe so we can mock dynamodb
  const request = require('supertest');
  const expect = require('chai').expect;
  const path = require('path');
  const service = require('@537/service');
  const package = require('../package.json');
  const test_routes = require('./test_routes.js');
  const {routes, passport} = require('../auth');
  const {put_token, authorized_redirect} = require('../util');

  let app, agent;

  // global before and afters
  before(async () => {
    app = service.bootstrap(package, {
      routes: {
        '/': [routes, test_routes],
      },
      passport,
      view_path: path.join(__dirname, 'views'),
    });

    agent = request.agent(app);
  });

  after(() => {
    AWS.restore('DynamoDB.DocumentClient');
  });

  describe('GET', () => {

    it('should 401 if no auth tokens provided', () => {
      return agent.get('/authorized').expect(401);
    });
    it('should 401 if bad auth token provided', () => {
      return agent.get('/authorized?apikey=not_a_real_id').expect(401);
    });
    it('should 200 if valid auth token provided', () => {
      return agent.get(`/authorized?apikey=${id}`).expect(200);
    });
  });

  describe('Unit Tests', () => {
    describe('put_token', () => {
      it('should pass errors through to middleware', (done) => {
        let user = {id: 'hi', name: 'bye'};
        put_token('token', 'refresh_token', user, (err, profile) => {
          expect(user).to.deep.equal(profile);
          done();
        });
      });
    });

    describe('authorized_redirect', () => {
      it('should redirect to /authorized', (done) => {
        let req = {
          user: {
            id: 'foo'
          }
        };
        let res = {
          redirect: (val) => {
            expect(val).to.have.string('/authorized');
            expect(val).to.have.string(req.user.id);
            done();
          }
        };
        authorized_redirect(req, res);
      });
    });
  });
});
