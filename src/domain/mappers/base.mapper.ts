import { getMeta, getAllMeta } from '../../infrastructure/decorators/metadata.store';
import { DictionaryVO } from '../value-objects/dictionary.vo';
import { shouldConvertToBoolString } from '../../config/mapping.config';

/**
 * Базовый класс для мапперов с поддержкой метаданных декораторов
 */
export abstract class BaseMapper<DTO, Domain> {
	/**
   * Применить трансформации на основе метаданных декораторов
   */
	protected applyTransforms(
		targetClass: any,
		propertyKey: string,
		value: any,
		direction: 'toDomain' | 'toDTO'
	): any {
		const meta = getMeta(targetClass, propertyKey);
		if (!meta?.transform) {
			return value;
		}

		const transform = meta.transform;
		const transformType = direction === 'toDomain' ? transform.from : transform.to || transform.from;

		switch (transformType) {
			case 'isoDate':
				return this.transformDate(value, direction);
			case 'boolString':
				return this.transformBoolean(value, direction, propertyKey);
			case 'dictionary':
				return this.transformDictionary(value, direction);
			case 'nullable':
				return this.transformNullable(value);
			default:
				return value;
		}
	}

	/**
   * Преобразование даты ISO ↔ Date
   */
	private transformDate(value: any, direction: 'toDomain' | 'toDTO'): Date | string | null {
		if (value === null || value === undefined || value === '') {
			return null;
		}

		if (direction === 'toDomain') {
			return value instanceof Date ? value : new Date(value);
		} else {
			return value instanceof Date ? value.toISOString() : value;
		}
	}

	/**
   * Преобразование boolean ↔ 'true'/'false'
   */
	private transformBoolean(
		value: any,
		direction: 'toDomain' | 'toDTO',
		fieldName: string
	): boolean | 'true' | 'false' | null {
		if (value === null || value === undefined) {
			return null;
		}

		if (direction === 'toDomain') {
			if (typeof value === 'boolean') {
				return value;
			}
			if (value === 'true' || value === true) {
				return true;
			}
			if (value === 'false' || value === false) {
				return false;
			}
			return null;
		} else {
			// При преобразовании в DTO проверяем конфиг
			if (shouldConvertToBoolString(fieldName)) {
				return value === true ? 'true' : 'false';
			}
			return value === true || value === false ? value : null;
		}
	}

	/**
   * Преобразование словаря
   */
	private transformDictionary(value: any, direction: 'toDomain' | 'toDTO'): DictionaryVO | { code: string; name: string } | null {
		if (!value) {
			return null;
		}

		if (direction === 'toDomain') {
			if (value instanceof DictionaryVO) {
				return value;
			}
			if (typeof value === 'object' && 'code' in value && 'name' in value) {
				return DictionaryVO.fromObject(value as { code: string; name: string });
			}
			if (typeof value === 'string') {
				return DictionaryVO.fromString(value);
			}
			return null;
		} else {
			if (value instanceof DictionaryVO) {
				return value.toObject();
			}
			return value;
		}
	}

	/**
   * Преобразование nullable (пустые строки → null)
   */
	private transformNullable(value: any): any {
		if (value === '' || value === undefined) {
			return null;
		}
		return value;
	}

	/**
   * Получить значение поля из DTO с учетом alias
   */
	protected getValueFromDTO(dto: any, propertyKey: string, targetClass: any): any {
		// Сначала проверяем прямое имя поля
		if (propertyKey in dto) {
			return dto[propertyKey];
		}

		// Проверяем alias из метаданных
		const meta = getMeta(targetClass, propertyKey);
		if (meta?.alias) {
			for (const alias of meta.alias) {
				if (alias in dto) {
					return dto[alias];
				}
			}
		}

		return undefined;
	}

	/**
   * Получить все поля с метаданными для класса
   */
	protected getAllFields(targetClass: any): Map<string | symbol, any> | undefined {
		return getAllMeta(targetClass);
	}

	/**
   * Преобразовать DTO в Domain
   */
	abstract toDomain(dto: DTO): Promise<Domain> | Domain;

	/**
   * Преобразовать Domain в DTO
   */
	abstract toDTO(domain: Domain): DTO;
}

