import { ref, computed, type Ref } from 'vue';
import { Department } from '../../domain/entities/department.entity';
import { DepartmentService } from '../../domain/services/department.service';
import { container } from '../../infrastructure/di/container';

/**
 * Composable для работы с отделами
 */
export function useDepartments() {
	const departments: Ref<Department[]> = ref([]);
	const loading = ref(false);
	const error: Ref<Error | null> = ref(null);

	let departmentService: DepartmentService | null = null;

	/**
   * Инициализировать сервис
   */
	async function init() {
		if (!departmentService) {
			await container.initialize();
			departmentService = container.getDepartmentService();
		}
	}

	/**
   * Загрузить все отделы
   */
	async function loadDepartments(): Promise<void> {
		try {
			loading.value = true;
			error.value = null;
			await init();

			departments.value = await departmentService!.listDepartments();
		} catch (e) {
			error.value = e instanceof Error ? e : new Error('Failed to load departments');
			console.error('Failed to load departments:', e);
		} finally {
			loading.value = false;
		}
	}

	/**
   * Найти отдел по ID
   */
	async function getDepartmentById(id: string): Promise<Department | null> {
		try {
			await init();
			return await departmentService!.getDepartment(id);
		} catch (e) {
			console.error('Failed to get department:', e);
			return null;
		}
	}

	/**
   * Найти отдел по коду
   */
	async function getDepartmentByCode(code: string): Promise<Department | null> {
		try {
			await init();
			return await departmentService!.findByCode(code);
		} catch (e) {
			console.error('Failed to get department by code:', e);
			return null;
		}
	}

	/**
   * Вычисляемое свойство для опций select
   */
	const departmentOptions = computed(() => {
		return departments.value.map((dept) => ({
			value: dept.id,
			label: dept.name,
			code: dept.code,
		}));
	});

	return {
		departments,
		loading,
		error,
		departmentOptions,
		loadDepartments,
		getDepartmentById,
		getDepartmentByCode,
	};
}

