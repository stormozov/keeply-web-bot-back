// =============================================================================
// API для получения конфигурации возможностей бота
// =============================================================================

import Router from '@koa/router';
import { capabilities } from '../../configs/capabilities.js';

const router = new Router();

router.get('/api/capabilities', (ctx) => {
  ctx.status = 200;
  ctx.body = capabilities;
});

export default router;
