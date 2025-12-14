/**
 * Конфигурация правил маппинга
 */

/**
 * Поля, которые должны преобразовываться в строки 'true'/'false' при сохранении в API
 */
export const FIELDS_TO_BOOL_STRING: string[] = ['is_active', 'is_remote'];

/**
 * Проверить, нужно ли преобразовывать поле в строку boolean
 */
export function shouldConvertToBoolString(fieldName: string): boolean {
	return FIELDS_TO_BOOL_STRING.includes(fieldName);
}

