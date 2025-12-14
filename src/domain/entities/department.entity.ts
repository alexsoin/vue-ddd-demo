/**
 * Domain Entity: Отдел
 */
export class Department {
	constructor(
		public readonly id: string,
		public code: string,
		public name: string,
		public parentId: string | null = null,
		public meta: Record<string, any> = {}
	) {
		if (!id) {
			throw new Error('Department: id is required');
		}
		if (!code) {
			throw new Error('Department: code is required');
		}
		if (!name) {
			throw new Error('Department: name is required');
		}
	}

	/**
   * Обновить данные отдела
   */
	updateFrom(data: Partial<Department>): void {
		if ('code' in data && data.code) {
			this.code = data.code;
		}
		if ('name' in data && data.name) {
			this.name = data.name;
		}
		if ('parentId' in data) {
			this.parentId = data.parentId ?? null;
		}
		if ('meta' in data && data.meta) {
			this.meta = { ...this.meta, ...data.meta };
		}
	}

	/**
   * Проверка, является ли отдел корневым
   */
	isRoot(): boolean {
		return this.parentId === null;
	}
}

