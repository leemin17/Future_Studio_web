import type { Request, Response } from 'express';

type ExpressApp = ReturnType<(typeof import('../backend/src/app.ts'))['createApp']>;

let appPromise: Promise<ExpressApp> | undefined;

const getApp = () => {
  appPromise ??= import('../backend/src/app.ts').then(({ createApp }) => createApp());
  return appPromise;
};

export default async function handler(request: Request, response: Response) {
  const app = await getApp();
  return app(request, response);
}
