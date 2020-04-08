const { Route, subroute } = require('../../../expressive');

const RootGetController = require('./controllers/RootGetController');

const HelloRouter = require('../../routers/Hello/HelloRouter');

module.exports = {
  routes: [
    Route.get('/', {
      controller: RootGetController
    }),
    Route.get('/hey', '/hello')
  ],
  subroutes: [
    subroute('/hello', HelloRouter, {
      authorizer: (req, res) => {
        console.log('auth from hello subroute');
      }
    })
  ]
};
