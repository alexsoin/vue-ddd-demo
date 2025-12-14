import 'reflect-metadata';

// Mock IndexedDB для тестов
class MockIDBRequest {
	result: any = null;
	error: any = null;
	onsuccess: ((event: any) => void) | null = null;
	onerror: ((event: any) => void) | null = null;

	constructor() {
		// Симулируем успешный запрос
		setTimeout(() => {
			if (this.onsuccess) {
				this.onsuccess({ target: this });
			}
		}, 0);
	}
}

class MockIDBObjectStore {
	private data: Map<any, any> = new Map();

	get(key: any): MockIDBRequest {
		const request = new MockIDBRequest();
		request.result = this.data.get(key);
		return request;
	}

	getAll(): MockIDBRequest {
		const request = new MockIDBRequest();
		request.result = Array.from(this.data.values());
		return request;
	}

	put(item: any): MockIDBRequest {
		const request = new MockIDBRequest();
		const key = item.id || item.key;
		this.data.set(key, item);
		request.result = key;
		return request;
	}

	delete(key: any): MockIDBRequest {
		const request = new MockIDBRequest();
		this.data.delete(key);
		return request;
	}

	clear(): MockIDBRequest {
		const request = new MockIDBRequest();
		this.data.clear();
		return request;
	}

	index(_name: string): any {
		return {
			getAll: (_range?: any) => {
				const request = new MockIDBRequest();
				request.result = Array.from(this.data.values());
				return request;
			},
		};
	}
}

class MockIDBDatabase {
	objectStoreNames = {
		contains: () => true,
	};
	private stores: Map<string, MockIDBObjectStore> = new Map();

	transaction(storeNames: string[], _mode: string = 'readonly'): any {
		const stores = storeNames.map((name) => {
			if (!this.stores.has(name)) {
				this.stores.set(name, new MockIDBObjectStore());
			}
			return this.stores.get(name)!;
		});

		return {
			objectStore: (name: string) => stores.find((s) => stores.indexOf(s) === storeNames.indexOf(name)),
			onerror: null,
			oncomplete: null,
		};
	}
}

// Глобальный mock для indexedDB
(global as any).indexedDB = {
	open: (_name: string, _version: number) => {
		const request = new MockIDBRequest();
		request.result = new MockIDBDatabase();
		return request;
	},
};

