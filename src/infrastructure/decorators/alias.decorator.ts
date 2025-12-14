import { defineMeta, getMeta } from './metadata.store';

/**
 * Декоратор для указания альтернативных имен полей в DTO
 * Позволяет мапперам находить поля по разным именам (например, first_name ↔ firstName)
 */
export function Alias(...aliases: string[]) {
	return function (target: any, propertyKey: string | symbol) {
		const existingMeta = getMeta(target.constructor, propertyKey);
		const currentAliases = existingMeta?.alias || [];

		defineMeta(target.constructor, propertyKey, {
			...existingMeta,
			alias: [...currentAliases, ...aliases],
		});
	};
}

