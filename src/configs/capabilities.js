// =============================================================================
// Конфигурация возможностей бота для управления интерфейсом и функциональностью
// =============================================================================

/**
 * Сообщение для отображения в подсказках недоступных функций бота
 * 
 * @type {string}
 * 
 * @description
 * Используется как значение свойства `tooltip` в конфигурации `capabilities`
 * для элементов интерфейса, которые временно недоступны.
 */
const BOT_FUNCTION_NOT_AVAILABLE = 'Функция недоступна';

/**
 * Конфигурация возможностей бота для управления интерфейсом и функциональностью
 * 
 * @module capabilities
 * @description
 * Определяет доступность, ограничения и параметры различных элементов 
 * интерфейса бота:
 * - Форма отправки сообщений
 * - Поле поиска
 * - Кнопки управления (Help, Favorites, Attachments, Settings)
 * 
 * Значение `availableState` определяет видимость/доступность элемента:
 * - 'true' — элемент активен
 * - 'false' — элемент отключен с отображением тултипа
 */
export const capabilities = {
  // Форма отправки сообщений
  messaging: {
    sendText: {
      availableState: 'true',
      limit: 1000,
      hasTooltip: false,
      tooltip: '',
    },
    sendAttachments: {
      availableState: 'true',
      limit: 9,
      types: ['image/*', 'video/*', 'audio/*'],
      hasTooltip: false,
      tooltip: '',
    },
  },

  // Поле поиска
  search: {
    searchMessages: {
      availableState: 'false',
      hasTooltip: true,
      tooltip: BOT_FUNCTION_NOT_AVAILABLE,
    },
  },

  // Остальной интерфейс
  ui: {
    buttonHelp: {
      availableState: 'true',
      hasTooltip: true,
      tooltip: 'Помощь',
    },
    buttonFavorites: {
      availableState: 'false',
      hasTooltip: true,
      tooltip: BOT_FUNCTION_NOT_AVAILABLE,
    },
    buttonAttachments: {
      availableState: 'false',
      hasTooltip: true,
      tooltip: BOT_FUNCTION_NOT_AVAILABLE,
    },
    buttonSettings: {
      availableState: 'true',
      hasTooltip: false,
      tooltip: '',
    },
  },
};
