import { IDBClient } from '../indexeddb/idb.client';
import { initDB } from '../indexeddb/migrations';
import { EmployeeRepository } from '../../domain/repositories/employee.repository';
import { DepartmentRepository } from '../../domain/repositories/department.repository';
import { EmployeeService } from '../../domain/services/employee.service';
import { DepartmentService } from '../../domain/services/department.service';
import { SourceAAdapter } from '../indexeddb/adapters/source-a.adapter';
import { SourceBAdapter } from '../indexeddb/adapters/source-b.adapter';

/**
 * Контейнер зависимостей (Dependency Injection)
 * Упрощенная реализация для демонстрации паттерна
 */
class DIContainer {
	private dbClient: IDBClient | null = null;
	private employeeRepository: EmployeeRepository | null = null;
	private departmentRepository: DepartmentRepository | null = null;
	private employeeService: EmployeeService | null = null;
	private departmentService: DepartmentService | null = null;
	private initialized = false;

	/**
   * Инициализировать контейнер (открыть БД, создать зависимости)
   */
	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}

		try {
			console.log('Initializing DI container...');
			// Инициализация IndexedDB
			this.dbClient = new IDBClient();
			console.log('Opening IndexedDB...');
			await initDB(this.dbClient);
			console.log('IndexedDB opened successfully');
		} catch (e) {
			console.error('Failed to initialize IndexedDB:', e);
			throw new Error(`Failed to initialize database: ${e instanceof Error ? e.message : String(e)}`);
		}

		// Инициализация репозиториев
		this.departmentRepository = new DepartmentRepository(this.dbClient);
		this.employeeRepository = new EmployeeRepository(this.dbClient, this.departmentRepository);

		// Инициализация сервисов
		this.employeeService = new EmployeeService(
			this.employeeRepository,
			this.departmentRepository
		);
		this.departmentService = new DepartmentService(this.departmentRepository);

		// Seed данных для демонстрации
		const sourceA = new SourceAAdapter(this.dbClient);
		const sourceB = new SourceBAdapter(this.dbClient);

		// Очищаем и заполняем тестовыми данными
		// await Promise.all([
		// 	sourceA.clear(),
		// 	sourceB.clear(),
		// ]);

		// await Promise.all([
		// 	sourceA.seed(),
		// 	sourceB.seed(),
		// ]);

		// Seed отделов
		const departments = [
			{ code: 'IT', name: 'Информационные технологии' },
			{ code: 'HR', name: 'Отдел кадров' },
			{ code: 'FIN', name: 'Финансовый отдел' },
		];

		for (const dept of departments) {
			try {
				await this.departmentService.createDepartment(dept);
			} catch (e) {
				// Игнорируем ошибки если отдел уже существует
			}
		}

		this.initialized = true;
	}

	/**
   * Получить сервис сотрудников
   */
	getEmployeeService(): EmployeeService {
		if (!this.employeeService) {
			throw new Error('DIContainer not initialized. Call initialize() first.');
		}
		return this.employeeService;
	}

	/**
   * Получить сервис отделов
   */
	getDepartmentService(): DepartmentService {
		if (!this.departmentService) {
			throw new Error('DIContainer not initialized. Call initialize() first.');
		}
		return this.departmentService;
	}

	/**
   * Получить репозиторий сотрудников
   */
	getEmployeeRepository(): EmployeeRepository {
		if (!this.employeeRepository) {
			throw new Error('DIContainer not initialized. Call initialize() first.');
		}
		return this.employeeRepository;
	}

	/**
   * Получить репозиторий отделов
   */
	getDepartmentRepository(): DepartmentRepository {
		if (!this.departmentRepository) {
			throw new Error('DIContainer not initialized. Call initialize() first.');
		}
		return this.departmentRepository;
	}
}

// Singleton instance
export const container = new DIContainer();

