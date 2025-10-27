// =============================================================================
// Сервис валидации файлов на основе содержимого (магических байт)
// =============================================================================

import { fileTypeFromFile } from 'file-type';
import { ALLOWED_FILE_TYPES } from '../configs/fileTypes.js';
import { logger } from '../utils/logger.js';

/**
 * Валидирует файл по его содержимому (магическим байтам)
 *
 * @param {string} filePath - Полный путь к файлу для валидации
 * @returns {Promise<Object>} Результат валидации
 * @property {boolean} isValid - Файл валиден или нет
 * @property {string|null} detectedMimeType - Обнаруженный MIME-тип по содержимому
 * @property {string|null} error - Сообщение об ошибке, если файл невалиден
 *
 * @description
 * 1. Определяет MIME-тип файла по магическим байтам с помощью file-type
 * 2. Сравнивает с списком разрешенных типов ALLOWED_FILE_TYPES
 * 3. Логирует результат валидации
 * 4. Возвращает объект с результатом
 *
 * @example
 * const result = await validateFile('/path/to/file.jpg');
 * if (result.isValid) {
 *   console.log('File is valid:', result.detectedMimeType);
 * } else {
 *   console.log('File invalid:', result.error);
 * }
 *
 * @see {@link ALLOWED_FILE_TYPES} - Список разрешенных MIME-типов
 * @see {@link fileTypeFromFile} - Функция определения типа файла по содержимому
 */
export const validateFile = async (filePath) => {
  try {
    const fileTypeResult = await fileTypeFromFile(filePath);

    if (!fileTypeResult) {
      logger.warn(`File validation failed: no file type detected for ${filePath}`);
      return {
        isValid: false,
        detectedMimeType: null,
        error: 'Не удалось определить тип файла по содержимому',
      };
    }

    const { mime: detectedMimeType } = fileTypeResult;

    if (!ALLOWED_FILE_TYPES.includes(detectedMimeType)) {
      logger.warn(`File validation failed: detected MIME type ${detectedMimeType} not allowed for ${filePath}`);
      return {
        isValid: false,
        detectedMimeType,
        error: `Тип файла "${detectedMimeType}" не разрешен`,
      };
    }

    logger.info(`File validation passed: ${detectedMimeType} for ${filePath}`);
    return {
      isValid: true,
      detectedMimeType,
      error: null,
    };
  } catch (error) {
    logger.error({ err: error }, `Error during file validation for ${filePath}`);
    return {
      isValid: false,
      detectedMimeType: null,
      error: 'Ошибка при валидации файла',
    };
  }
};
