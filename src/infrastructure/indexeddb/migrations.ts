import { IDBClient } from './idb.client';

/**
 * Миграции для IndexedDB
 */

const DB_NAME = 'vue3-ddd-db';
const DB_VERSION = 1;

export const DB_CONFIG = {
	name: DB_NAME,
	version: DB_VERSION,
	stores: {
		employees: 'employees',
		departments: 'departments',
		sourceA: 'sourceA',
		sourceB: 'sourceB',
	},
};

/**
 * Применить миграции при создании/обновлении БД
 */
export function applyMigrations(
	db: IDBDatabase,
	oldVersion: number,
	newVersion: number | null
): void {
	// Создание stores
	if (oldVersion < 1) {
		// Store для сотрудников
		if (!db.objectStoreNames.contains(DB_CONFIG.stores.employees)) {
			const employeeStore = db.createObjectStore(DB_CONFIG.stores.employees, {
				keyPath: 'id',
			});
			employeeStore.createIndex('departmentId', 'departmentId', { unique: false });
			employeeStore.createIndex('isActive', 'isActive', { unique: false });
		}

		// Store для отделов
		if (!db.objectStoreNames.contains(DB_CONFIG.stores.departments)) {
			const departmentStore = db.createObjectStore(DB_CONFIG.stores.departments, {
				keyPath: 'id',
			});
			departmentStore.createIndex('code', 'code', { unique: true });
			departmentStore.createIndex('parentId', 'parentId', { unique: false });
		}

		// Store для источника A
		if (!db.objectStoreNames.contains(DB_CONFIG.stores.sourceA)) {
			db.createObjectStore(DB_CONFIG.stores.sourceA, { keyPath: 'id' });
		}

		// Store для источника B
		if (!db.objectStoreNames.contains(DB_CONFIG.stores.sourceB)) {
			db.createObjectStore(DB_CONFIG.stores.sourceB, { keyPath: 'id' });
		}
	}
}

/**
 * Инициализировать базу данных
 */
export async function initDB(client: IDBClient): Promise<IDBDatabase> {
	return await client.openDB(DB_CONFIG.name, DB_CONFIG.version, applyMigrations);
}

