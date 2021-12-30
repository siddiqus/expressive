const request = require('supertest');
const { ExpressApp, BaseController, Route } = require('../src');

describe('Express App Tests', () => {
  class GetHello extends BaseController {
    handleRequest() {
      this.ok({
        hello: 'world'
      });
    }
  }
  class PostHello extends BaseController {
    handleRequest() {
      const { body } = this.getData();
      const { firstName, lastName } = body;
      this.ok({
        message: `hello ${firstName} ${lastName}!`
      });
    }
  }
  const router = {
    routes: [
      Route.get('/v1/hello', new GetHello()),
      Route.post('/v1/hello', new PostHello())
    ]
  };
  const app = new ExpressApp(router).express;

  it('should run healthcheck properly', async () => {
    const response = await request(app).get('/v1/hello');
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      hello: 'world'
    });
  });

  it('should send post data properly', async () => {
    const response = await request(app).post('/v1/hello').send({
      firstName: 'Sabbir',
      lastName: 'Siddiqui'
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      message: 'hello Sabbir Siddiqui!'
    });
  });
});
