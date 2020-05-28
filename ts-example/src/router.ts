import multer from 'multer';
import { Route } from '../../src';
import type { ExpressiveRouter } from '../../src';
import { helloRouter } from './routers/helloRouter';
import { Joi } from 'celebrate';

const uploadFile = multer();

export const router: ExpressiveRouter = {
  routes: [
    Route.get('/health', {
      controller: (_, res) => res.json({ hello: 'world' })
    }),
    Route.put('/file-upload', {
      validationSchema: {
        fileUpload: {
          file: Joi.any().required()
        }
      },
      middleware: [
        uploadFile.single('file')
      ],
      controller: (req, res) => {
        const file = req.file;
        const filename = file.originalname
        const content = file.buffer.toString()
        res.json({
          filename,
          content
        })
      }
    })
  ],
  subroutes: [
    {
      path: '/v1',
      router: helloRouter
    }
  ]
};
