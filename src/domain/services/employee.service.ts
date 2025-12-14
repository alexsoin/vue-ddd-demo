import { Employee } from '../entities/employee.entity';
import type { IEmployeeRepository } from '../repositories/employee.repository';
import type { IDepartmentRepository } from '../repositories/department.repository';
import { DictionaryVO } from '../value-objects/dictionary.vo';

/**
 * Входные данные для создания сотрудника
 */
export interface EmployeeCreateInput {
	firstName: string;
	lastName: string;
	email?: string | null;
	departmentId?: string | null;
	position?: { code: string; name: string } | null;
	isActive?: boolean;
	startDate?: Date | null;
	isRemote?: boolean;
	meta?: Record<string, any>;
}

/**
 * Входные данные для обновления сотрудника
 */
export interface EmployeePatchInput extends Partial<EmployeeCreateInput> {}

/**
 * Фильтр для списка сотрудников
 */
export interface EmployeeFilter {
	departmentId?: string;
	isActive?: boolean;
}

export interface AggregatedEmployee {
	id?: string;
	firstName: string;
	lastName: string;
	email?: string | null;
	departmentId?: string | null;
	position?: { code: string; name: string } | null;
	isActive?: boolean;
	startDate?: Date | null;
	lastSeen?: Date | null;
	isRemote?: boolean;
	phone?: string | null;
	address?: string | null;
	comment?: string | null;
	hobbies?: string | null;
	meta?: Record<string, any>;
}

/**
 * Сервис для работы с сотрудниками
 * Содержит бизнес-логику и оркестрирует репозитории
 */
export class EmployeeService {
	constructor(
		private employeeRepository: IEmployeeRepository,
		private departmentRepository: IDepartmentRepository
	) {}

	/**
   * Создать нового сотрудника
   */
	async createEmployee(input: AggregatedEmployee): Promise<Employee> {
		if (!input.firstName) throw new Error('EmployeeService: firstName is required');
		if (!input.lastName) throw new Error('EmployeeService: lastName is required');
		if (input.departmentId) {
			const department = await this.departmentRepository.findById(input.departmentId);
			if (!department) throw new Error(`EmployeeService: Department with id ${input.departmentId} not found`);
		}
		const id = `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		return await this.employeeRepository.save(new Employee(
			id,
			input.firstName,
			input.lastName,
			input.email ?? null,
			input.departmentId ?? null,
			input.position ? DictionaryVO.fromObject(input.position) : null,
			input.isActive ?? true,
			input.startDate ?? null,
			input.lastSeen ?? null,
			input.isRemote ?? false,
			input.meta ?? {}
		));
	}

	/**
   * Обновить сотрудника
   */
	async updateEmployee(id: string, patch: Partial<AggregatedEmployee>): Promise<Employee> {
		const old = await this.employeeRepository.findById(id);
		if (!old) throw new Error(`EmployeeService: Employee with id ${id} not found`);
		if (patch.departmentId) {
			const department = await this.departmentRepository.findById(patch.departmentId);
			if (!department) throw new Error(`EmployeeService: Department with id ${patch.departmentId} not found`);
		}
		// Обновляем только поля, что пришли
		const merged = { ...old, ...patch };
		// Создаем новый экземпляр Employee с объединенными данными
		const updatedEmployee = new Employee(
			merged.id,
			merged.firstName,
			merged.lastName,
			merged.email ?? null,
			merged.departmentId ?? null,
			merged.position instanceof DictionaryVO ? merged.position :
				(merged.position && typeof merged.position === 'object' && 'code' in merged.position && 'name' in merged.position) ?
					DictionaryVO.fromObject(merged.position) : null,
			merged.isActive ?? true,
			merged.startDate ?? null,
			merged.lastSeen ?? null,
			merged.isRemote ?? false,
			merged.meta ?? {}
		);
		return await this.employeeRepository.update(updatedEmployee);
	}

	/**
   * Получить сотрудника по ID
   */
	async getEmployee(id: string): Promise<Employee> {
		const emp = await this.employeeRepository.findById(id);
		if (!emp) throw new Error(`EmployeeService: Employee with id ${id} not found`);
		return emp;
	}

	/**
   * Получить список сотрудников с фильтром
   */
	async listEmployees(filter?: EmployeeFilter): Promise<Employee[]> {
		return await this.employeeRepository.findAll(filter);
	}

	/**
   * Деактивировать сотрудника (мягкое удаление)
   */
	async deactivateEmployee(id: string): Promise<void> {
		const emp = await this.employeeRepository.findById(id);
		if (!emp) throw new Error(`EmployeeService: Employee with id ${id} not found`);
		await this.employeeRepository.deactivate(id);
	}

	/**
   * Переназначить сотрудника в другой отдел
   */
	async reassignDepartment(employeeId: string, departmentId: string | null): Promise<Employee> {
		const emp = await this.employeeRepository.findById(employeeId);
		if (!emp) throw new Error(`EmployeeService: Employee with id ${employeeId} not found`);
		if (departmentId !== null) {
			const department = await this.departmentRepository.findById(departmentId);
			if (!department) throw new Error(`EmployeeService: Department with id ${departmentId} not found`);
		}
		// Создаем новый экземпляр Employee с обновленным departmentId
		const updatedEmployee = new Employee(
			emp.id,
			emp.firstName,
			emp.lastName,
			emp.email,
			departmentId,
			emp.position instanceof DictionaryVO ? emp.position :
				(emp.position && typeof emp.position === 'object' && 'code' in emp.position && 'name' in emp.position) ?
					DictionaryVO.fromObject(emp.position) : null,
			emp.isActive,
			emp.startDate,
			emp.lastSeen,
			emp.isRemote,
			emp.meta
		);
		return await this.employeeRepository.update(updatedEmployee);
	}
}

