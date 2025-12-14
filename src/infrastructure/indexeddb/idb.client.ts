/**
 * Простая обёртка над IndexedDB с промисами и типизацией
 */

export interface IDBQuery {
	index?: string;
	range?: IDBKeyRange;
	direction?: IDBCursorDirection;
	limit?: number;
}

export class IDBClient {
	private static instance: IDBClient | null = null;
	private db: IDBDatabase | null = null;
	private openingPromise: Promise<IDBDatabase> | null = null;
	private isInitializing = false;

	/**
	 * Приватный конструктор для реализации Singleton
	 */
	private constructor() {}

	/**
	 * Получить экземпляр IDBClient (Singleton)
	 */
	static getInstance(): IDBClient {
		if (!IDBClient.instance) {
			IDBClient.instance = new IDBClient();
		}
		return IDBClient.instance;
	}

	/**
	 * Открыть базу данных (thread-safe)
	 */
	async openDB(
		name: string,
		version: number,
		migrations?: (db: IDBDatabase, oldVersion: number, newVersion: number | null) => void
	): Promise<IDBDatabase> {
		// Если БД уже открыта, возвращаем её
		if (this.db) {
			return this.db;
		}

		// Если уже идёт процесс открытия, возвращаем существующий промис
		if (this.openingPromise) {
			return this.openingPromise;
		}

		// Создаём новый промис для открытия БД
		this.openingPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(name, version);

			request.onerror = () => {
				this.openingPromise = null;
				this.isInitializing = false;
				reject(request.error);
			};

			request.onsuccess = () => {
				this.db = request.result;
				this.isInitializing = false;
				resolve(this.db);
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				const oldVersion = event.oldVersion;
				const newVersion = event.newVersion;

				if (migrations) {
					migrations(db, oldVersion, newVersion);
				}
			};

			this.isInitializing = true;
		});

		return this.openingPromise;
	}

	/**
	 * Проверить, открыта ли база данных
	 */
	async ensureDB(): Promise<IDBDatabase> {
		if (!this.db && !this.openingPromise) {
			throw new Error('Database not opened. Call openDB() first.');
		}

		if (this.openingPromise) {
			return this.openingPromise;
		}

		return this.db!;
	}

	/**
	 * Получить запись по ключу
	 */
	async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
		const db = await this.ensureDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction([storeName], 'readonly');
			const store = transaction.objectStore(storeName);
			const request = store.get(key);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);
		});
	}

	/**
	 * Получить все записи с опциональным запросом
	 */
	async getAll<T>(storeName: string, query?: IDBQuery): Promise<T[]> {
		const db = await this.ensureDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction([storeName], 'readonly');
			const store = transaction.objectStore(storeName);

			let request: IDBRequest;

			if (query?.index) {
				const index = store.index(query.index);
				request = index.getAll(query.range, query.limit);
			} else {
				request = store.getAll(query?.range, query?.limit);
			}

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result || []);
		});
	}

	/**
	 * Сохранить или обновить запись
	 */
	async put<T>(storeName: string, item: T): Promise<IDBValidKey> {
		const db = await this.ensureDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction([storeName], 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.put(item);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);
		});
	}

	/**
	 * Удалить запись
	 */
	async delete(storeName: string, key: IDBValidKey): Promise<void> {
		const db = await this.ensureDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction([storeName], 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.delete(key);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	/**
	 * Выполнить транзакцию
	 */
	async transaction<T>(
		storeNames: string[],
		mode: IDBTransactionMode,
		callback: (transaction: IDBTransaction) => Promise<T>
	): Promise<T> {
		const db = await this.ensureDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeNames, mode);

			transaction.onerror = () => reject(transaction.error);
			transaction.oncomplete = () => {
				// Транзакция завершена
			};

			callback(transaction)
				.then(resolve)
				.catch(reject);
		});
	}

	/**
	 * Очистить store
	 */
	async clear(storeName: string): Promise<void> {
		const db = await this.ensureDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction([storeName], 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.clear();

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	/**
	 * Получить текущее подключение к БД
	 */
	getDB(): IDBDatabase | null {
		return this.db;
	}

	/**
	 * Проверить, открыта ли база данных
	 */
	isOpen(): boolean {
		return this.db !== null;
	}

	/**
	 * Проверить, идёт ли инициализация
	 */
	isInit(): boolean {
		return this.isInitializing;
	}
}