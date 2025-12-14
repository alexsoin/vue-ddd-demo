import { DictionaryVO } from '../value-objects/dictionary.vo';
import type { EmployeeDTO } from '../dto/employee.dto';
import { Required, Alias } from '../../infrastructure/decorators';

/**
 * Domain Entity: Сотрудник
 * Содержит бизнес-логику и правила валидации
 */
export class Employee {
	/** @Required */
	@Required()
	public readonly id: string;
	/** @Required */
	@Required()
	@Alias('first_name')
	public firstName: string;
	/** @Required */
	@Required()
	@Alias('last_name')
	public lastName: string;
	@Alias('email')
	public email: string | null = null;
	@Alias('departmentId', 'department_id', 'department_code', 'department')
	public departmentId: string | null = null;
	@Alias('position')
	public position: DictionaryVO | null = null;
	@Alias('is_active')
	public isActive: boolean = true;
	@Alias('start_date')
	public startDate: Date | null = null;
	@Alias('last_seen')
	public lastSeen: Date | null = null;
	@Alias('is_remote')
	public isRemote: boolean = false;
	public meta: Record<string, any> = {};

	constructor(
		id: string,
		firstName: string,
		lastName: string,
		email: string | null = null,
		departmentId: string | null = null,
		position: DictionaryVO | null = null,
		isActive: boolean = true,
		startDate: Date | null = null,
		lastSeen: Date | null = null,
		isRemote: boolean = false,
		meta: Record<string, any> = {}
	) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.departmentId = departmentId;
		this.position = position;
		this.isActive = isActive;
		this.startDate = startDate;
		this.lastSeen = lastSeen;
		this.isRemote = isRemote;
		this.meta = meta;
	}

	/**
   * Активировать сотрудника
   */
	activate(): void {
		this.isActive = true;
	}

	/**
   * Деактивировать сотрудника (мягкое удаление)
   */
	deactivate(): void {
		this.isActive = false;
	}

	/**
   * Назначить сотрудника в отдел
   */
	assignToDepartment(departmentId: string | null): void {
		this.departmentId = departmentId;
	}

	/**
   * Обновить данные сотрудника из DTO или частичных данных
   */
	updateFrom(data: Partial<EmployeeDTO> | Partial<Employee>): void {
		if ('firstName' in data || 'first_name' in data) {
			this.firstName = (data as any).firstName || (data as any).first_name || this.firstName;
		}
		if ('lastName' in data || 'last_name' in data) {
			this.lastName = (data as any).lastName || (data as any).last_name || this.lastName;
		}
		if ('email' in data) {
			this.email = data.email ?? null;
		}
		if ('isActive' in data || 'is_active' in data) {
			const activeValue = (data as any).isActive ?? (data as any).is_active;
			this.isActive = activeValue === true || activeValue === 'true';
		}
		if ('isRemote' in data || 'is_remote' in data) {
			const remoteValue = (data as any).isRemote ?? (data as any).is_remote;
			this.isRemote = remoteValue === true || remoteValue === 'true';
		}
		if ('startDate' in data || 'start_date' in data) {
			const dateValue = (data as any).startDate ?? (data as any).start_date;
			this.startDate = dateValue ? (dateValue instanceof Date ? dateValue : new Date(dateValue)) : null;
		}
		if ('lastSeen' in data || 'last_seen' in data) {
			const dateValue = (data as any).lastSeen ?? (data as any).last_seen;
			this.lastSeen = dateValue ? (dateValue instanceof Date ? dateValue : new Date(dateValue)) : null;
		}
		if ('meta' in data && data.meta) {
			this.meta = { ...this.meta, ...data.meta };
		}
	}

	/**
   * Получить полное имя
   */
	getFullName(): string {
		return `${this.firstName} ${this.lastName}`;
	}

	/**
   * Проверка, является ли сотрудник активным
   */
	isCurrentlyActive(): boolean {
		return this.isActive;
	}
}

