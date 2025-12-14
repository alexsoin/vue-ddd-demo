import { defineMeta } from './metadata.store';

/**
 * Декоратор для обозначения обязательного поля
 * Используется для валидации и генерации UI-форм
 */
export function Required() {
	return function (target: any, propertyKey: string | symbol) {
		defineMeta(target.constructor, propertyKey, { required: true });
	};
}

