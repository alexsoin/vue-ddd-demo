/**
 * Конфигурация приоритетов источников данных
 * Источник с более высоким приоритетом побеждает при конфликтах полей
 */

export interface SourcePriority {
	name: string;
	priority: number; // Чем выше число, тем выше приоритет
}

export const SOURCES_PRIORITY: SourcePriority[] = [
	{ name: 'sourceA', priority: 10 },
	{ name: 'sourceB', priority: 5 },
];

/**
 * Получить приоритет источника
 */
export function getSourcePriority(sourceName: string): number {
	const source = SOURCES_PRIORITY.find((s) => s.name === sourceName);
	return source?.priority ?? 0;
}

/**
 * Сравнить приоритеты источников
 * @returns true если source1 имеет больший приоритет чем source2
 */
export function hasHigherPriority(source1: string, source2: string): boolean {
	return getSourcePriority(source1) > getSourcePriority(source2);
}

