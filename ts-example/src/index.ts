import { ExpressApp } from '../../src';
import { router } from './router';

const app = new ExpressApp(router, {
  errorHandler(err, req, res) {
    console.log(err);
    res.status(500);
    res.json({
      message: err.message
    });
  }
});

app.listen(3001, () => console.log('Running on port 3001'));
