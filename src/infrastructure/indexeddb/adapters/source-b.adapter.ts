import { BaseAdapter } from './base.adapter';
import type { EmployeeDTO } from '../../../domain/dto/employee.dto';
import { DB_CONFIG } from '../migrations';

/**
 * Адаптер для источника данных B
 * Имитирует внешний API с другими форматами полей
 */
export class SourceBAdapter extends BaseAdapter<EmployeeDTO> {
	constructor(client: any) {
		super(client, DB_CONFIG.stores.sourceB);
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
				// email отсутствует в источнике B
				department_code: 'IT',
				position: { code: 'SENIOR_DEV', name: 'Старший разработчик' }, // Конфликт с sourceA
				is_active: true, // boolean вместо строки
				start_date: '2020-01-15T00:00:00Z',
				is_remote: false,
				// Дополнительное поле от источника B
				bonus: 50000,
			},
			{
				id: 'emp-002',
				first_name: 'Мария',
				last_name: 'Сидорова',
				email: 'maria.sidorova@example.com',
				department: { code: 'HR', name: 'Отдел кадров' },
				position: { code: 'HR_MGR', name: 'Менеджер по персоналу' },
				is_active: true,
				start_date: '2019-06-01T00:00:00Z',
				is_remote: true,
			},
			{
				id: 'emp-004',
				first_name: 'Елена',
				last_name: 'Волкова',
				email: 'elena.volkova@example.com',
				department_code: 'FIN',
				position: { code: 'ACC', name: 'Бухгалтер' },
				is_active: 'true',
				start_date: '2022-09-10T00:00:00Z',
				is_remote: 'false',
			},
		];

		await this.saveAll(seedData);
	}

	/**
   * Имитация задержки API
   */
	private async simulateDelay(ms: number = 150): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
   * Получить все записи с имитацией задержки
   */
	async getAll(): Promise<EmployeeDTO[]> {
		await this.simulateDelay(100);
		return await super.getAll();
	}
}

