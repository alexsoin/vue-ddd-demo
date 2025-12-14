/**
 * Хранилище метаданных для декораторов
 * Используется для хранения информации о полях классов (required, transform, alias и т.д.)
 */

type MetadataKey = string | symbol;
type MetadataValue = Record<string, any>;

const metadataStore = new Map<string, Map<MetadataKey, MetadataValue>>();

/**
 * Получить ключ для класса в хранилище
 */
function getClassKey(target: any): string {
	return target.name || target.constructor?.name || 'Unknown';
}

/**
 * Определить метаданные для свойства класса
 */
export function defineMeta(
	target: any,
	propertyKey: string | symbol,
	metadata: MetadataValue
): void {
	const classKey = getClassKey(target);

	if (!metadataStore.has(classKey)) {
		metadataStore.set(classKey, new Map());
	}

	const classMetadata = metadataStore.get(classKey)!;
	const existingMeta = classMetadata.get(propertyKey) || {};

	classMetadata.set(propertyKey, {
		...existingMeta,
		...metadata,
	});
}

/**
 * Получить метаданные для свойства класса
 */
export function getMeta(
	target: any,
	propertyKey: string | symbol
): MetadataValue | undefined {
	const classKey = getClassKey(target);
	const classMetadata = metadataStore.get(classKey);

	if (!classMetadata) {
		return undefined;
	}

	return classMetadata.get(propertyKey);
}

/**
 * Получить все метаданные для класса
 */
export function getAllMeta(target: any): Map<MetadataKey, MetadataValue> | undefined {
	const classKey = getClassKey(target);
	return metadataStore.get(classKey);
}

/**
 * Очистить метаданные (для тестов)
 */
export function clearMeta(): void {
	metadataStore.clear();
}

