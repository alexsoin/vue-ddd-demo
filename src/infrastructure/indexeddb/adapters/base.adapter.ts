import { IDBClient } from '../idb.client';
import { DB_CONFIG } from '../migrations';

/**
 * Базовый адаптер для источников данных
 */
export abstract class BaseAdapter<T> {
	constructor(
		protected client: IDBClient,
		protected storeName: string
	) {}

	/**
   * Получить все записи из источника
   */
	async getAll(): Promise<T[]> {
		return await this.client.getAll<T>(this.storeName);
	}

	/**
   * Получить запись по ID
   */
	async getById(id: string): Promise<T | undefined> {
		return await this.client.get<T>(this.storeName, id);
	}

	/**
   * Сохранить запись
   */
	async save(item: T): Promise<void> {
		await this.client.put(this.storeName, item);
	}

	/**
   * Сохранить несколько записей
   */
	async saveAll(items: T[]): Promise<void> {
		await this.client.transaction([this.storeName], 'readwrite', async (transaction) => {
			const store = transaction.objectStore(this.storeName);
			for (const item of items) {
				await new Promise<void>((resolve, reject) => {
					const request = store.put(item);
					request.onsuccess = () => resolve();
					request.onerror = () => reject(request.error);
				});
			}
		});
	}

	/**
   * Очистить все данные источника
   */
	async clear(): Promise<void> {
		await this.client.clear(this.storeName);
	}

	/**
   * Инициализировать тестовые данные (для seed)
   */
	abstract seed(): Promise<void>;
}

