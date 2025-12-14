import { BaseAdapter } from './base.adapter';
import type { EmployeeDTO } from '../../../domain/dto/employee.dto';
import { DB_CONFIG } from '../migrations';

/**
 * Адаптер для источника данных A
 * Имитирует внешний API с задержками и ошибками для тестов
 */
export class SourceAAdapter extends BaseAdapter<EmployeeDTO> {
	constructor(client: any) {
		super(client, DB_CONFIG.stores.sourceA);
	}

	/**
   * Инициализировать тестовые данные
   */
	async seed(): Promise<void> {
		const seedData: EmployeeDTO[] = [
			{
				id: 'emp-001',
				first_name: 'Иван',
				last_name: 'Петров',
				email: 'ivan.petrov@example.com',
				department: { code: 'IT', name: 'Информационные технологии' },
				position: { code: 'DEV', name: 'Разработчик' },
				is_active: 'true',
				start_date: '2020-01-15T00:00:00Z',
				last_seen: '2025-01-10T14:30:00Z',
				is_remote: 'false',
			},
			{
				id: 'emp-002',
				first_name: 'Мария',
				last_name: 'Сидорова',
				email: 'maria.sidorova@example.com',
				department_code: 'HR',
				position: { code: 'HR_MGR', name: 'Менеджер по персоналу' },
				is_active: 'true',
				start_date: '2019-06-01T00:00:00Z',
				is_remote: 'true',
			},
			{
				id: 'emp-003',
				first_name: 'Алексей',
				last_name: 'Козлов',
				email: 'alex.kozlov@example.com',
				department: { code: 'IT', name: 'Информационные технологии' },
				position: { code: 'QA', name: 'Тестировщик' },
				is_active: 'false',
				start_date: '2021-03-20T00:00:00Z',
				last_seen: '2024-12-01T10:00:00Z',
				is_remote: 'false',
			},
		];

		await this.saveAll(seedData);
	}

	/**
   * Имитация задержки API
   */
	private async simulateDelay(ms: number = 100): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
   * Получить все записи с имитацией задержки
   */
	async getAll(): Promise<EmployeeDTO[]> {
		await this.simulateDelay(50);
		return await super.getAll();
	}
}

