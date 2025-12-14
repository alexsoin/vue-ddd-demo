import { defineMeta } from './metadata.store';

export type TransformType = 'isoDate' | 'boolString' | 'dictionary' | 'nullable';

export interface TransformOptions {
	from: TransformType;
	to?: TransformType; // для обратного преобразования
	nullable?: boolean; // разрешить null значения
}

/**
 * Декоратор для указания правил преобразования при маппинге DTO ↔ Domain
 */
export function Transform(options: TransformOptions) {
	return function (target: any, propertyKey: string | symbol) {
		defineMeta(target.constructor, propertyKey, {
			transform: options,
		});
	};
}

