import { Employee } from '../entities/employee.entity';
import type { EmployeeDTO } from '../dto/employee.dto';
import { EmployeeMapper } from '../mappers/employee.mapper';
import { IDBClient } from '../../infrastructure/indexeddb/idb.client';
import { DB_CONFIG } from '../../infrastructure/indexeddb/migrations';
import { BaseAdapter } from '../../infrastructure/indexeddb/adapters/base.adapter';
import { SourceAAdapter } from '../../infrastructure/indexeddb/adapters/source-a.adapter';
import { SourceBAdapter } from '../../infrastructure/indexeddb/adapters/source-b.adapter';
import { SOURCES_PRIORITY, hasHigherPriority } from '../../config/sources-priority.config';
import type { IDepartmentRepository } from './department.repository';

/**
 * Интерфейс репозитория сотрудников
 */
export interface IEmployeeRepository {
	findById(id: string): Promise<Employee | null>;
	findAll(filter?: EmployeeFilter): Promise<Employee[]>;
	save(employee: Employee): Promise<Employee>;
	update(employee: Employee): Promise<Employee>;
	deactivate(id: string): Promise<void>;
	findByDepartmentCode(code: string): Promise<Employee[]>;
	bulkUpsert(dtos: EmployeeDTO[]): Promise<Employee[]>;
}

/**
 * Фильтр для поиска сотрудников
 */
export interface EmployeeFilter {
	departmentId?: string;
	isActive?: boolean;
}

/**
 * Репозиторий для работы с сотрудниками и двумя вспомогательными источниками
 */
export class EmployeeRepository implements IEmployeeRepository {
	private mapper: EmployeeMapper;
	private sourceA: SourceAAdapter;
	private sourceB: SourceBAdapter;

	constructor(
		private client: IDBClient,
		private departmentRepository: IDepartmentRepository
	) {
		this.mapper = new EmployeeMapper(departmentRepository);
		this.sourceA = new SourceAAdapter(client);
		this.sourceB = new SourceBAdapter(client);
	}

	/**
   * Собирает агрегированного сотрудника по id
   */
	async findById(id: string): Promise<any | null> {
		// получаем основного сотрудника
		const raw = await this.client.get(DB_CONFIG.stores.employees, id);
		if (!raw) return null;
		// достаём дополняющие поля
		const extA = await this.sourceA.getById(id).catch(() => ({}));
		const extB = await this.sourceB.getById(id).catch(() => ({}));
		return {
			...raw,
			phone: extA?.phone ?? null,
			address: extA?.address ?? null,
			comment: extB?.comment ?? null,
			hobbies: extB?.hobbies ?? null
		};
	}

	/**
   * Получить всех сотрудников (основная и вспомогательная инфа)
   */
	async findAll(filter?: EmployeeFilter): Promise<any[]> {
		// Получаем всех из employees
		const all = await this.client.getAll(DB_CONFIG.stores.employees);
		// Для каждого сотрудника подмешиваем доп.данные
		const withSources = await Promise.all(
			all.map(async raw => {
				const id = raw.id;
				const extA = await this.sourceA.getById(id).catch(() => ({}));
				const extB = await this.sourceB.getById(id).catch(() => ({}));
				return {
					...raw,
					phone: extA?.phone ?? null,
					address: extA?.address ?? null,
					comment: extB?.comment ?? null,
					hobbies: extB?.hobbies ?? null
				};
			})
		);
		// Применяем фильтры
		let filtered = withSources;
		if (filter?.departmentId) {
			filtered = filtered.filter(emp => emp.departmentId === filter.departmentId);
		}
		if (filter?.isActive !== undefined) {
			filtered = filtered.filter(emp => emp.isActive === filter.isActive);
		}
		return filtered;
	}

	/**
   * Сохраняет сотрудника (разносит поля по таблицам, пустые пишет как null)
   */
	async save(employee: any): Promise<any> {
		// основной объект без source-полей
		const { phone, address, comment, hobbies, ...mainFields } = employee;
		// Сохраняем основное
		await this.client.put(DB_CONFIG.stores.employees, mainFields);
		// sourceA
		await this.sourceA.save({
			id: mainFields.id,
			phone: phone ?? null,
			address: address ?? null
		});
		// sourceB
		await this.sourceB.save({
			id: mainFields.id,
			comment: comment ?? null,
			hobbies: hobbies ?? null
		});
		return { ...employee };
	}

	async update(employee: any): Promise<any> {
		return this.save(employee);
	}

	async deactivate(id: string): Promise<void> {
		// Найдём сотрудника и деактивируем
		const raw = await this.client.get(DB_CONFIG.stores.employees, id);
		if (!raw) throw new Error(`Employee with id ${id} not found`);
		raw.isActive = false;
		await this.client.put(DB_CONFIG.stores.employees, raw);
	}

	async findByDepartmentCode(code: string): Promise<any[]> {
		// список id департамента
		const all = await this.findAll();
		return all.filter(emp => emp.departmentCode === code || emp.department_id === code || emp.departmentId === code);
	}

	async bulkUpsert(records: any[]): Promise<any[]> {
		return Promise.all(records.map(item => this.save(item)));
	}
}

