import { Department } from '../entities/department.entity';
import type { IDepartmentRepository } from '../repositories/department.repository';

/**
 * Входные данные для создания отдела
 */
export interface DepartmentCreateInput {
	code: string;
	name: string;
	parentId?: string | null;
	meta?: Record<string, any>;
}

/**
 * Входные данные для обновления отдела
 */
export interface DepartmentPatchInput extends Partial<DepartmentCreateInput> {}

/**
 * Сервис для работы с отделами
 */
export class DepartmentService {
	constructor(private departmentRepository: IDepartmentRepository) {}

	/**
   * Создать новый отдел
   */
	async createDepartment(input: DepartmentCreateInput): Promise<Department> {
		if (!input.code) {
			throw new Error('DepartmentService: code is required');
		}
		if (!input.name) {
			throw new Error('DepartmentService: name is required');
		}

		// Проверка уникальности кода
		const existing = await this.departmentRepository.findByCode(input.code);
		if (existing) {
			throw new Error(`DepartmentService: Department with code ${input.code} already exists`);
		}

		// Проверка существования родительского отдела
		if (input.parentId) {
			const parent = await this.departmentRepository.findById(input.parentId);
			if (!parent) {
				throw new Error(`DepartmentService: Parent department with id ${input.parentId} not found`);
			}
		}

		// Генерация ID
		const id = `dept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		const department = new Department(
			id,
			input.code,
			input.name,
			input.parentId ?? null,
			input.meta || {}
		);

		return await this.departmentRepository.save(department);
	}

	/**
   * Обновить отдел
   */
	async updateDepartment(id: string, patch: DepartmentPatchInput): Promise<Department> {
		const department = await this.departmentRepository.findById(id);
		if (!department) {
			throw new Error(`DepartmentService: Department with id ${id} not found`);
		}

		// Проверка уникальности кода, если изменяется
		if (patch.code && patch.code !== department.code) {
			const existing = await this.departmentRepository.findByCode(patch.code);
			if (existing) {
				throw new Error(`DepartmentService: Department with code ${patch.code} already exists`);
			}
		}

		// Проверка родительского отдела
		if (patch.parentId !== undefined) {
			if (patch.parentId !== null) {
				const parent = await this.departmentRepository.findById(patch.parentId);
				if (!parent) {
					throw new Error(`DepartmentService: Parent department with id ${patch.parentId} not found`);
				}
			}
		}

		department.updateFrom(patch);
		return await this.departmentRepository.update(department);
	}

	/**
   * Получить отдел по ID
   */
	async getDepartment(id: string): Promise<Department> {
		const department = await this.departmentRepository.findById(id);
		if (!department) {
			throw new Error(`DepartmentService: Department with id ${id} not found`);
		}
		return department;
	}

	/**
   * Получить все отделы
   */
	async listDepartments(): Promise<Department[]> {
		return await this.departmentRepository.findAll();
	}

	/**
   * Найти отдел по коду
   */
	async findByCode(code: string): Promise<Department | null> {
		return await this.departmentRepository.findByCode(code);
	}
}

