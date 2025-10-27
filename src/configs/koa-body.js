// =============================================================================
// Конфигурация koa-body
// =============================================================================

import { MAX_FILE_SIZE } from './constants.js';

/**
 * Конфигурация koa-body
 *
 * @see {@link https://www.npmjs.com/package/koa-body}
 * @see {@link https://www.npmjs.com/package/koa-body#some-options-for-formidable}
 */
export const KOA_BODY_CONFIG = {
  /**
   * Разрешить загрузку множества файлов
   */
  multipart: true,
  /**
   * Настройки для formidable
   */
  formidable: {
    /**
     * Сохранять расширение загруженных файлов
     */
    keepExtensions: true,
    /**
     * Максимальный размер файла (в байтах)
     */
    maxFileSize: MAX_FILE_SIZE,
  },
};
