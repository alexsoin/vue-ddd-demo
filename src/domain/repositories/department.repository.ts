import { Department } from '../entities/department.entity';
import type { DepartmentDTO } from '../dto/department.dto';
import { DepartmentMapper } from '../mappers/department.mapper';
import { IDBClient } from '../../infrastructure/indexeddb/idb.client';
import { DB_CONFIG } from '../../infrastructure/indexeddb/migrations';

/**
 * Интерфейс репозитория отделов
 */
export interface IDepartmentRepository {
	findById(id: string): Promise<Department | null>;
	findByCode(code: string): Promise<Department | null>;
	findAll(): Promise<Department[]>;
	save(department: Department): Promise<Department>;
	update(department: Department): Promise<Department>;
}

/**
 * Репозиторий для работы с отделами
 */
export class DepartmentRepository implements IDepartmentRepository {
	private mapper: DepartmentMapper;

	constructor(private client: IDBClient) {
		this.mapper = new DepartmentMapper();
	}

	/**
   * Найти отдел по ID
   */
	async findById(id: string): Promise<Department | null> {
		const dto = await this.client.get<DepartmentDTO>(DB_CONFIG.stores.departments, id);
		if (!dto) {
			return null;
		}
		return this.mapper.toDomain(dto);
	}

	/**
   * Найти отдел по коду
   */
	async findByCode(code: string): Promise<Department | null> {
		const all = await this.client.getAll<DepartmentDTO>(DB_CONFIG.stores.departments, {
			index: 'code',
			range: IDBKeyRange.only(code),
		});

		if (all.length === 0 || !all[0]) {
			return null;
		}

		return this.mapper.toDomain(all[0]);
	}

	/**
   * Получить все отделы
   */
	async findAll(): Promise<Department[]> {
		const dtos = await this.client.getAll<DepartmentDTO>(DB_CONFIG.stores.departments);
		return dtos.map((dto) => this.mapper.toDomain(dto));
	}

	/**
   * Сохранить отдел
   */
	async save(department: Department): Promise<Department> {
		const dto = this.mapper.toDTO(department);
		await this.client.put(DB_CONFIG.stores.departments, dto);
		return department;
	}

	/**
   * Обновить отдел
   */
	async update(department: Department): Promise<Department> {
		return await this.save(department);
	}
}

