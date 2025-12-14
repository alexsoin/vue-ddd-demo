/**
 * DTO для отдела (входные данные из API)
 */
export interface DepartmentDTO {
	id: string;
	code: string;
	name: string;
	parent_id?: string | null;
	parent?: { code: string; name: string } | null;
	meta?: Record<string, any>;
	[key: string]: any;
}

/**
 * DTO для создания отдела
 */
export interface DepartmentCreateDTO {
	code: string;
	name: string;
	parent_id?: string | null;
	meta?: Record<string, any>;
}

/**
 * DTO для обновления отдела
 */
export interface DepartmentUpdateDTO extends Partial<DepartmentCreateDTO> {
	id: string;
}

