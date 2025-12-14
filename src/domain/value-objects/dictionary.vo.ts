/**
 * Value Object для словарных значений
 * Представляет пару code/name для справочных данных
 */
export class DictionaryVO {
	constructor(
		public readonly code: string,
		public readonly name: string
	) {
		if (!code) {
			throw new Error('DictionaryVO: code is required');
		}
		if (!name) {
			throw new Error('DictionaryVO: name is required');
		}
	}

	/**
   * Создать из объекта { code, name }
   */
	static fromObject(obj: { code: string; name: string }): DictionaryVO {
		return new DictionaryVO(obj.code, obj.name);
	}

	/**
   * Создать из строки (используется как code и name)
   */
	static fromString(value: string): DictionaryVO {
		return new DictionaryVO(value, value);
	}

	/**
   * Преобразовать в объект
   */
	toObject(): { code: string; name: string } {
		return {
			code: this.code,
			name: this.name,
		};
	}

	/**
   * Проверка равенства
   */
	equals(other: DictionaryVO | null | undefined): boolean {
		if (!other) return false;
		return this.code === other.code && this.name === other.name;
	}

	/**
   * Строковое представление
   */
	toString(): string {
		return this.name;
	}
}

