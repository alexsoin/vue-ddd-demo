import { BaseMapper } from './base.mapper';
import { Employee } from '../entities/employee.entity';
import type { EmployeeDTO } from '../dto/employee.dto';
import { DictionaryVO } from '../value-objects/dictionary.vo';

/**
 * Маппер для преобразования EmployeeDTO ↔ Employee
 */
export class EmployeeMapper extends BaseMapper<EmployeeDTO, Employee> {
	constructor() {
		super();
	}

	/**
	 * Универсальный гидратор: превращает plain DTO/JSON в экземпляр класса с декораторами
	 */
	async hydrate<T>(plain: any, Cls: new (...args: any[]) => T): Promise<T> {
		const metaMap = this.getAllFields(Cls.prototype.constructor);
		if (!metaMap) throw new Error('No metadata defined on class');
		const result: any = new Cls();
		for (const [key, meta] of metaMap.entries()) {
			let value = this.getValueFromDTO(plain, key as string, Cls.prototype.constructor);
			if (meta.transform) {
				value = this.applyTransforms(Cls.prototype.constructor, key as string, value, 'toDomain');
			}
			if (meta.dictionary && value && !(value instanceof DictionaryVO)) {
				value = DictionaryVO.fromObject(value);
			}
			result[key] = value;
		}
		// положить всё лишнее в result.meta (если есть поле meta)
		if ('meta' in result) {
			const used = new Set(Array.from(metaMap.keys()));
			for (const k in plain) {
				if (!used.has(k as any)) {
					result.meta = result.meta || {};
					result.meta[k] = plain[k];
				}
			}
		}
		return result;
	}

	/**
	 * Преобразовать DTO → Domain Entity (используя декораторы)
	 */
	async toDomain(dto: any): Promise<Employee> {
		// support как EmployeeDTO, так и plain
		return await this.hydrate(dto, Employee);
	}

	/**
   * Преобразовать Domain Entity в DTO
   */
	toDTO(domain: Employee): EmployeeDTO {
		const dto: EmployeeDTO = {
			id: domain.id,
			first_name: domain.firstName,
			last_name: domain.lastName,
			email: domain.email,
			is_active: super.transformBoolean(domain.isActive, 'toDTO', 'is_active') as 'true' | 'false' | boolean,
			is_remote: super.transformBoolean(domain.isRemote, 'toDTO', 'is_remote') as 'true' | 'false' | boolean,
			start_date: domain.startDate ? super.transformDate(domain.startDate, 'toDTO') as string : null,
			last_seen: domain.lastSeen ? super.transformDate(domain.lastSeen, 'toDTO') as string : null,
			position: domain.position ? super.transformDictionary(domain.position, 'toDTO') as { code: string; name: string } : null,
			...domain.meta,
		};

		// Добавляем department_code если есть departmentId
		if (domain.departmentId) {
			dto.department_code = domain.departmentId;
		}

		return dto;
	}

}

