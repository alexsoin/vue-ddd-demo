import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeService } from '../employee.service';
import { EmployeeRepository } from '../../repositories/employee.repository';
import { DepartmentRepository } from '../../repositories/department.repository';
import { IDBClient } from '../../../infrastructure/indexeddb/idb.client';
import { initDB } from '../../../infrastructure/indexeddb/migrations';

describe('EmployeeService', () => {
	let service: EmployeeService;
	let employeeRepository: EmployeeRepository;
	let departmentRepository: DepartmentRepository;
	let dbClient: IDBClient;

	beforeEach(async () => {
		dbClient = IDBClient.getInstance();
		await initDB(dbClient);
		departmentRepository = new DepartmentRepository(dbClient);
		employeeRepository = new EmployeeRepository(dbClient);
		service = new EmployeeService(employeeRepository, departmentRepository);
	});

	describe('createEmployee', () => {
		it('должен создать нового сотрудника', async () => {
			// Сначала создаем отдел
			const department = await departmentRepository.save({
				id: 'dept-001',
				code: 'IT',
				name: 'IT отдел',
				parentId: null,
				meta: {},
			} as any);

			const input = {
				firstName: 'Иван',
				lastName: 'Петров',
				email: 'ivan@example.com',
				departmentId: department.id,
				position: { code: 'DEV', name: 'Разработчик' },
				isActive: true,
				isRemote: false,
			};

			const employee = await service.createEmployee(input);

			expect(employee).toBeDefined();
			expect(employee.firstName).toBe('Иван');
			expect(employee.lastName).toBe('Петров');
			expect(employee.email).toBe('ivan@example.com');
			expect(employee.departmentId).toBe(department.id);
		});

		it('должен выбросить ошибку если не указано имя', async () => {
			const input = {
				firstName: '',
				lastName: 'Петров',
			};

			await expect(service.createEmployee(input)).rejects.toThrow('firstName is required');
		});

		it('должен выбросить ошибку если отдел не существует', async () => {
			const input = {
				firstName: 'Иван',
				lastName: 'Петров',
				departmentId: 'non-existent-dept',
			};

			await expect(service.createEmployee(input)).rejects.toThrow('Department with id');
		});
	});

	describe('deactivateEmployee', () => {
		it('должен деактивировать сотрудника', async () => {
			// Создаем сотрудника
			const department = await departmentRepository.save({
				id: 'dept-001',
				code: 'IT',
				name: 'IT отдел',
				parentId: null,
				meta: {},
			} as any);

			const employee = await service.createEmployee({
				firstName: 'Иван',
				lastName: 'Петров',
				departmentId: department.id,
			});

			expect(employee.isActive).toBe(true);

			// Деактивируем
			await service.deactivateEmployee(employee.id);

			// Проверяем
			const deactivated = await service.getEmployee(employee.id);
			expect(deactivated.isActive).toBe(false);
		});

		it('должен выбросить ошибку если сотрудник не найден', async () => {
			await expect(service.deactivateEmployee('non-existent')).rejects.toThrow('not found');
		});
	});

	describe('reassignDepartment', () => {
		it('должен переназначить сотрудника в другой отдел', async () => {
			// Создаем отделы
			const dept1 = await departmentRepository.save({
				id: 'dept-001',
				code: 'IT',
				name: 'IT отдел',
				parentId: null,
				meta: {},
			} as any);

			const dept2 = await departmentRepository.save({
				id: 'dept-002',
				code: 'HR',
				name: 'HR отдел',
				parentId: null,
				meta: {},
			} as any);

			// Создаем сотрудника
			const employee = await service.createEmployee({
				firstName: 'Иван',
				lastName: 'Петров',
				departmentId: dept1.id,
			});

			expect(employee.departmentId).toBe(dept1.id);

			// Переназначаем
			const updated = await service.reassignDepartment(employee.id, dept2.id);

			expect(updated.departmentId).toBe(dept2.id);
		});

		it('должен выбросить ошибку если отдел не существует', async () => {
			const department = await departmentRepository.save({
				id: 'dept-001',
				code: 'IT',
				name: 'IT отдел',
				parentId: null,
				meta: {},
			} as any);

			const employee = await service.createEmployee({
				firstName: 'Иван',
				lastName: 'Петров',
				departmentId: department.id,
			});

			await expect(
				service.reassignDepartment(employee.id, 'non-existent-dept')
			).rejects.toThrow('Department with id');
		});
	});
});

