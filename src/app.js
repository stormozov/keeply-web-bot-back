// =============================================================================
// Конфигурация Koa-приложения
// =============================================================================

import Koa from 'koa';
import {
  corsMiddleware,
  fileValidationMiddleware,
  koaBodyMiddleware,
  loggerMiddleware
} from './middleware/index.js';
import apiRoutes from './routes/api/index.js';

const app = new Koa();

// Middleware
app.use(loggerMiddleware);
app.use(corsMiddleware);
app.use(koaBodyMiddleware);
app.use(fileValidationMiddleware);

// API routes
app.use(apiRoutes.routes());

export default app;
