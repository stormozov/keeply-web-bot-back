// =============================================================================
// Конфигурация Koa-приложения
// =============================================================================

import Koa from 'koa';
import mount from 'koa-mount';
import serve from 'koa-static';
import {
  corsMiddleware,
  koaBodyMiddleware,
  loggerMiddleware
} from './middleware/index.js';
import apiRoutes from './routes/api/index.js';
import { UPLOADS_DIR } from './utils/paths.js';

const app = new Koa();

// Middleware
app.use(loggerMiddleware);
app.use(corsMiddleware);
app.use(koaBodyMiddleware);

// Static files
app.use(mount('/uploads', serve(UPLOADS_DIR)));

// API routes
app.use(apiRoutes.routes());

export default app;
