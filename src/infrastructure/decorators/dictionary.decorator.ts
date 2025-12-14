import { defineMeta } from './metadata.store';

/**
 * Декоратор для обозначения полей-словарей
 * Поле должно быть преобразовано в DictionaryVO { code: string, name: string }
 */
export function Dictionary() {
	return function (target: any, propertyKey: string | symbol) {
		defineMeta(target.constructor, propertyKey, {
			dictionary: true,
		});
	};
}

