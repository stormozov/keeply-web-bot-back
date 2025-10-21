// =============================================================================
// API-маршруты
// =============================================================================

import Router from '@koa/router';
import capabilities from './capabilities.js';
import messages from './messages.js';

const router = new Router();
router.use(capabilities.routes());
router.use(messages.routes());

export default router;
