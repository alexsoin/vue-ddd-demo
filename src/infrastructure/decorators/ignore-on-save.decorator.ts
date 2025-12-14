import { defineMeta } from './metadata.store';

/**
 * Декоратор для полей, которые не нужно сохранять в API/DB
 * Используется для вычисляемых полей или временных данных
 */
export function IgnoreOnSave() {
	return function (target: any, propertyKey: string | symbol) {
		defineMeta(target.constructor, propertyKey, {
			ignoreOnSave: true,
		});
	};
}

