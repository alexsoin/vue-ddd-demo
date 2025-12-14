import { Required, Alias, Transform, Dictionary } from '../../infrastructure/decorators';

export class EmployeeDTO {
	@Required()
	@Alias('id')
	id!: string;

	@Alias('firstName')
	first_name?: string;

	@Alias('lastName')
	last_name?: string;

	@Alias('email')
	email?: string | null;

	@Alias('departmentId', 'department_id')
	department_code?: string | null;

	@Dictionary()
	@Alias('position')
	position?: { code: string; name: string } | null;

	@Transform({ from: 'boolString' })
	@Alias('isActive')
	is_active?: 'true' | 'false' | boolean | null;

	@Transform({ from: 'isoDate' })
	start_date?: string | null;

	@Transform({ from: 'isoDate' })
	last_seen?: string | null;

	@Transform({ from: 'boolString' })
	@Alias('isRemote')
	is_remote?: 'true' | 'false' | boolean | null;

	[key: string]: any;
}

/**
 * DTO для создания сотрудника
 */
export class EmployeeCreateDTOClass {
	/** @Required */
	@Required()
	first_name!: string;
	/** @Required */
	@Required()
	last_name!: string;
	email?: string | null;
	department_code?: string | null;
	position?: { code: string; name: string } | null;
	is_active?: 'true' | 'false' | boolean;
	start_date?: string | null;
	is_remote?: 'true' | 'false' | boolean;
	[key: string]: any;
}

/**
 * DTO для обновления сотрудника
 */
export interface EmployeeUpdateDTO extends Partial<EmployeeCreateDTOClass> {
	id: string;
}

