import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeMapper } from '../employee.mapper';
import type { EmployeeDTO } from '../../dto/employee.dto';

describe('EmployeeMapper', () => {
	let mapper: EmployeeMapper;

	beforeEach(async () => {
		mapper = new EmployeeMapper();
	});

	describe('toDomain', () => {
		it('должен преобразовать DTO с boolean строками в Domain Entity', async () => {
			const dto: EmployeeDTO = {
				id: 'emp-001',
				first_name: 'Иван',
				last_name: 'Петров',
				is_active: 'true',
				is_remote: 'false',
			};

			const employee = await mapper.toDomain(dto);

			expect(employee.isActive).toBe(true);
			expect(employee.isRemote).toBe(false);
		});

		it('должен преобразовать DTO с boolean значениями в Domain Entity', async () => {
			const dto: EmployeeDTO = {
				id: 'emp-001',
				first_name: 'Иван',
				last_name: 'Петров',
				is_active: true,
				is_remote: false,
			};

			const employee = await mapper.toDomain(dto);

			expect(employee.isActive).toBe(true);
			expect(employee.isRemote).toBe(false);
		});

		it('должен преобразовать ISO даты в Date объекты', async () => {
			const dto: EmployeeDTO = {
				id: 'emp-001',
				first_name: 'Иван',
				last_name: 'Петров',
				start_date: '2020-01-15T00:00:00Z',
				last_seen: '2025-01-10T14:30:00Z',
			};

			const employee = await mapper.toDomain(dto);

			expect(employee.startDate).toBeInstanceOf(Date);
			expect(employee.lastSeen).toBeInstanceOf(Date);
		});

		it('должен обработать null даты', async () => {
			const dto: EmployeeDTO = {
				id: 'emp-001',
				first_name: 'Иван',
				last_name: 'Петров',
				start_date: null,
				last_seen: null,
			};

			const employee = await mapper.toDomain(dto);

			expect(employee.startDate).toBeNull();
			expect(employee.lastSeen).toBeNull();
		});

		it('должен обработать пустые строки как null для дат', async () => {
			const dto: EmployeeDTO = {
				id: 'emp-001',
				first_name: 'Иван',
				last_name: 'Петров',
				start_date: '',
				last_seen: '',
			};

			const employee = await mapper.toDomain(dto);

			expect(employee.startDate).toBeNull();
			expect(employee.lastSeen).toBeNull();
		});

		it('должен преобразовать position словарь в DictionaryVO', async () => {
			const dto: EmployeeDTO = {
				id: 'emp-001',
				first_name: 'Иван',
				last_name: 'Петров',
				position: { code: 'DEV', name: 'Разработчик' },
			};

			const employee = await mapper.toDomain(dto);

			expect(employee.position).not.toBeNull();
			expect(employee.position?.code).toBe('DEV');
			expect(employee.position?.name).toBe('Разработчик');
		});
	});

	describe('toDTO', () => {
		it('должен преобразовать Domain Entity в DTO', () => {
			const employee = {
				id: 'emp-001',
				firstName: 'Иван',
				lastName: 'Петров',
				email: 'ivan@example.com',
				departmentId: null,
				position: null,
				isActive: true,
				startDate: new Date('2020-01-15T00:00:00Z'),
				lastSeen: null,
				isRemote: false,
				meta: {},
			} as any;

			const dto = mapper.toDTO(employee);

			expect(dto.id).toBe('emp-001');
			expect(dto.first_name).toBe('Иван');
			expect(dto.last_name).toBe('Петров');
			expect(dto.email).toBe('ivan@example.com');
			expect(dto.is_active).toBe(true);
			expect(dto.is_remote).toBe(false);
			expect(dto.start_date).toBe('2020-01-15T00:00:00.000Z');
		});

		it('должен преобразовать Date в ISO строку', () => {
			const employee = {
				id: 'emp-001',
				firstName: 'Иван',
				lastName: 'Петров',
				email: null,
				departmentId: null,
				position: null,
				isActive: true,
				startDate: new Date('2020-01-15T00:00:00Z'),
				lastSeen: new Date('2025-01-10T14:30:00Z'),
				isRemote: false,
				meta: {},
			} as any;

			const dto = mapper.toDTO(employee);

			expect(dto.start_date).toMatch(/2020-01-15/);
			expect(dto.last_seen).toMatch(/2025-01-10/);
		});
	});
});

