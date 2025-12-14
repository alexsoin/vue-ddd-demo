import { ref, computed, type Ref } from 'vue';
import { Employee } from '../../domain/entities/employee.entity';
import type { EmployeeService, EmployeeFilter } from '../../domain/services/employee.service';
import { container } from '../../infrastructure/di/container';

/**
 * Composable для работы с сотрудниками
 */
export function useEmployees() {
	const employees: Ref<Employee[]> = ref([]);
	const loading = ref(false);
	const error: Ref<Error | null> = ref(null);
	const filter: Ref<EmployeeFilter> = ref({});

	let employeeService: EmployeeService | null = null;

	// Состояние модального окна
	const modalOpen = ref(false);
	const modalMode = ref<'create' | 'edit'>('create');
	const modalEmployee = ref<Employee | null>(null);

	/**
   * Инициализировать сервис
   */
	async function init() {
		if (!employeeService) {
			await container.initialize();
			employeeService = container.getEmployeeService();
		}
	}

	/**
   * Загрузить сотрудников с применением фильтров
   */
	async function loadEmployees(customFilter?: EmployeeFilter): Promise<void> {
		try {
			loading.value = true;
			error.value = null;
			await init();

			const appliedFilter = customFilter || filter.value;
			employees.value = await employeeService!.listEmployees(appliedFilter);
		} catch (e) {
			error.value = e instanceof Error ? e : new Error('Failed to load employees');
			console.error('Failed to load employees:', e);
		} finally {
			loading.value = false;
		}
	}

	/**
   * Открыть модальное окно создания сотрудника
   */
	function openCreateModal(): void {
		modalMode.value = 'create';
		modalEmployee.value = null;
		modalOpen.value = true;
	}

	/**
   * Открыть модальное окно редактирования сотрудника
   */
	async function openEditModal(employeeId: string): Promise<void> {
		try {
			await init();
			const employee = await employeeService!.getEmployee(employeeId);
			modalMode.value = 'edit';
			modalEmployee.value = employee;
			modalOpen.value = true;
		} catch (e) {
			error.value = e instanceof Error ? e : new Error('Failed to open edit modal');
			console.error('Failed to open edit modal:', e);
		}
	}

	/**
   * Закрыть модальное окно
   */
	function closeModal(): void {
		modalOpen.value = false;
		modalEmployee.value = null;
	}

	/**
   * Сохранить сотрудника (создать или обновить)
   */
	async function saveEmployee(payload: {
		id?: string;
		firstName: string;
		lastName: string;
		email?: string | null;
		departmentId?: string | null;
		position?: { code: string; name: string } | null;
		startDate?: Date | null;
		isRemote?: boolean;
		phone?: string | null;
		address?: string | null;
		comment?: string | null;
		hobbies?: string | null;
	}): Promise<any> {
		await init();

		if (payload.id) {
			// Обновление
			return await employeeService!.updateEmployee(payload.id, payload);
		} else {
			// Создание
			return await employeeService!.createEmployee(payload);
		}
	}

	/**
   * Деактивировать сотрудника
   */
	async function deactivateEmployee(employeeId: string): Promise<void> {
		try {
			await init();
			await employeeService!.deactivateEmployee(employeeId);
			await loadEmployees();
		} catch (e) {
			error.value = e instanceof Error ? e : new Error('Failed to deactivate employee');
			console.error('Failed to deactivate employee:', e);
			throw e;
		}
	}

	/**
   * Применить фильтр
   */
	function applyFilter(newFilter: EmployeeFilter): void {
		filter.value = { ...filter.value, ...newFilter };
		loadEmployees();
	}

	/**
   * Сбросить фильтр
   */
	function resetFilter(): void {
		filter.value = {};
		loadEmployees();
	}

	/**
   * Вычисляемое свойство для активных сотрудников
   */
	const activeEmployees = computed(() => {
		return employees.value.filter((emp) => emp.isActive);
	});

	/**
   * Вычисляемое свойство для неактивных сотрудников
   */
	const inactiveEmployees = computed(() => {
		return employees.value.filter((emp) => !emp.isActive);
	});

	return {
		employees,
		loading,
		error,
		filter,
		activeEmployees,
		inactiveEmployees,
		modalOpen,
		modalMode,
		modalEmployee,
		loadEmployees,
		openCreateModal,
		openEditModal,
		closeModal,
		saveEmployee,
		deactivateEmployee,
		applyFilter,
		resetFilter,
	};
}

