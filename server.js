// =============================================================================
// Входная точка приложения
//
// В этом модуле регистрируется и запускается Koa-приложение.
// Само приложение настраивается в файле ./src/app.js
// =============================================================================

import { PORT } from './environment.js';
import app from './src/app.js';
import { logger } from './src/utils/logger.js';

app.listen(PORT, () => {
  logger.info(`Server is listening on port ${PORT}`);
});
