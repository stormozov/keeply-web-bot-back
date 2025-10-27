// =============================================================================
// Конфигурация типов файлов, доступных для загрузки
// =============================================================================

/**
 * Конфигурация типов файлов с их MIME-префиксами и поддиректориями
 * 
 * @type {Object[]} FILE_TYPE_CONFIG
 * @property {string} prefix - Префикс MIME-типа (например, 'image/')
 * @property {string[]} specificTypes - Массив конкретных MIME-типов
 * @property {string} subdir - Поддиректория для хранения файлов этого типа
 * 
 * @example
 * // Использование:
 * const isImage = MIME_PREFIXES.includes('image/jpeg');
 * const dir = PREFIX_TO_SUBDIR['image/'];
 */
export const FILE_TYPE_CONFIG = [
  {
    prefix: 'image/',
    specificTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    subdir: 'images',
  },
  {
    prefix: 'video/',
    specificTypes: ['video/mp4'],
    subdir: 'videos',
  },
  {
    prefix: 'audio/',
    specificTypes: ['audio/mpeg', 'audio/wav'],
    subdir: 'audios',
  },
];

/**
 * Список всех разрешенных MIME-типов файлов
 * 
 * @type {string[]}
 * @description
 * Получается путем объединения всех specificTypes из FILE_TYPE_CONFIG
 * 
 * @example
 * // Проверка допустимости типа файла
 * if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
 *   // Разрешено
 * }
 */
export const ALLOWED_FILE_TYPES = FILE_TYPE_CONFIG.flatMap((c) => c.specificTypes);

/**
 * Список MIME-префиксов для категоризации файлов
 * 
 * @type {string[]}
 * @description
 * Получается из всех prefix значений из FILE_TYPE_CONFIG
 * 
 * @example
 * // Определение категории файла
 * const prefix = file.mimetype.split('/')[0] + '/';
 * if (MIME_PREFIXES.includes(prefix)) {
 *   // Известная категория
 * }
 */
export const MIME_PREFIXES = FILE_TYPE_CONFIG.map((c) => c.prefix);

/**
 * Сопоставление MIME-префиксов с поддиректориями
 *
 * @type {Object.<string, string>}
 * @description
 * Объект в формате { [prefix]: subdir }, используемый для определения
 * целевой директории при сохранении файлов
 *
 * @example
 * // Получение пути для сохранения
 * const prefix = 'image/';
 * const targetDir = path.join(UPLOADS_DIR, PREFIX_TO_SUBDIR[prefix]);
 */
export const PREFIX_TO_SUBDIR = Object.fromEntries(
  FILE_TYPE_CONFIG.map((c) => [c.prefix, c.subdir])
);

/**
 * Сопоставление MIME-типов с расширениями файлов
 *
 * @type {Object.<string, string>}
 * @description
 * Объект для определения безопасного расширения файла на основе MIME-типа.
 * Используется для генерации имен файлов, соответствующих их содержимому.
 *
 * @example
 * MIME_TO_EXT['image/jpeg']; // '.jpg'
 * MIME_TO_EXT['video/mp4'];  // '.mp4'
 */
export const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
};

/**
 * Определяет расширение файла на основе MIME-типа
 *
 * @param {string} mimeType - MIME-тип файла (например, 'image/jpeg')
 * @returns {string}
 * - Расширение из сопоставления, если MIME-тип известен
 * - '.bin' как запасной вариант для неизвестных типов
 *
 * @description
 * 1. Проверяет, передан ли MIME-тип
 * 2. Возвращает соответствующее расширение из MIME_TO_EXT
 * 3. Если тип неизвестен, возвращает '.bin'
 *
 * @example
 * getExtensionFromMime('image/jpeg'); // '.jpg'
 * getExtensionFromMime('unknown/type'); // '.bin'
 *
 * @see {@link MIME_TO_EXT} - Сопоставление MIME-типов с расширениями
 */
export const getExtensionFromMime = (mimeType) => {
  return mimeType && MIME_TO_EXT[mimeType] ? MIME_TO_EXT[mimeType] : '.bin';
};

/**
 * Определяет поддиректорию для хранения файла по его реальному MIME-типу
 *
 * @param {string} mimeType - Реальный MIME-тип файла (например, 'image/jpeg')
 * @returns {string|null}
 * - Поддиректория из конфигурации, если MIME-тип соответствует одному из
 * допустимых префиксов
 * - null, если MIME-тип не соответствует ни одному из допустимых префиксов
 *
 * @description
 * 1. Проверяет, передан ли MIME-тип
 * 2. Поиск префикса MIME-типа в списке допустимых префиксов
 * 3. Возвращает соответствующую поддиректорию из конфигурации
 *
 * @example
 * getSubdirByRealMimetype('image/jpeg'); // 'images'
 * getSubdirByRealMimetype('video/mp4');  // 'videos'
 * getSubdirByRealMimetype('application/pdf'); // null
 *
 * @see {@link MIME_PREFIXES} - Список допустимых MIME-префиксов
 * @see {@link PREFIX_TO_SUBDIR} - Сопоставление префиксов с поддиректориями
 */
export const getSubdirByRealMimetype = (mimeType) => {
  if (!mimeType) return null;
  const matchedPrefix = MIME_PREFIXES.find((prefix) => mimeType.startsWith(prefix));
  return matchedPrefix ? PREFIX_TO_SUBDIR[matchedPrefix] : null;
};
