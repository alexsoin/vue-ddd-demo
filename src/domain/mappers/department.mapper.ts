import { BaseMapper } from './base.mapper';
import { Department } from '../entities/department.entity';
import type { DepartmentDTO } from '../dto/department.dto';

/**
 * Маппер для преобразования DepartmentDTO ↔ Department
 */
export class DepartmentMapper extends BaseMapper<DepartmentDTO, Department> {
	/**
   * Преобразовать DTO в Domain Entity
   */
	toDomain(dto: DepartmentDTO): Department {
		return new Department(
			dto.id,
			dto.code,
			dto.name,
			dto.parent_id ?? null,
			dto.meta || {}
		);
	}

	/**
   * Преобразовать Domain Entity в DTO
   */
	toDTO(domain: Department): DepartmentDTO {
		return {
			id: domain.id,
			code: domain.code,
			name: domain.name,
			parent_id: domain.parentId,
			meta: domain.meta,
		};
	}
}

