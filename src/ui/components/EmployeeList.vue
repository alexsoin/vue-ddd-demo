<template>
	<div class="space-y-4">
		<!-- Фильтры -->
		<div class="bg-white p-4 rounded-lg shadow">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Отдел
					</label>
					<DepartmentSelect v-model="selectedDepartmentId" />
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Статус
					</label>
					<select
						v-model="selectedStatus"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Все</option>
						<option value="active">Активные</option>
						<option value="inactive">Неактивные</option>
					</select>
				</div>

				<div class="flex items-end">
					<button
						@click="handleResetFilter"
						class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
					>
						Сбросить
					</button>
				</div>
			</div>
		</div>

		<!-- Кнопка создания -->
		<div class="flex justify-between items-center">
			<h1 class="text-2xl font-bold text-gray-800">Сотрудники</h1>
			<button
				@click="handleCreate"
				class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
			>
				+ Создать сотрудника
			</button>
		</div>

		<!-- Сообщение об ошибке -->
		<div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
			<strong>Ошибка:</strong> {{ error.message || error }}
			<details class="mt-2">
				<summary class="cursor-pointer text-sm">Подробности</summary>
				<pre class="mt-2 text-xs overflow-auto">{{ error.stack || error }}</pre>
			</details>
		</div>

		<!-- Загрузка -->
		<div v-if="loading" class="text-center py-8 text-gray-500">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<p class="mt-2">Загрузка данных...</p>
		</div>

		<!-- Таблица сотрудников -->
		<div v-else-if="!error" class="bg-white rounded-lg shadow overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Имя
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Email
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Отдел
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Должность
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Статус
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Действия
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					<tr v-for="employee in employees" :key="employee.id" class="hover:bg-gray-50">
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="text-sm font-medium text-gray-900">
								<!-- {{ employee.getFullName() }} -->
								{{ `${employee.lastName} ${employee.firstName}` }}
							</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="text-sm text-gray-500">
								{{ employee.email || '-' }}
							</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="text-sm text-gray-500">
								{{ getDepartmentName(employee.departmentId) }}
							</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="text-sm text-gray-500">
								{{ employee.position?.name || '-' }}
							</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span
								:class="[
									'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
									employee.isActive
										? 'bg-green-100 text-green-800'
										: 'bg-red-100 text-red-800',
								]"
							>
								{{ employee.isActive ? 'Активен' : 'Неактивен' }}
							</span>
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
							<button
								@click="handleEdit(employee.id)"
								class="text-blue-600 hover:text-blue-900 mr-3"
							>
								Редактировать
							</button>
							<button
								v-if="employee.isActive"
								@click="handleDeactivate(employee.id)"
								class="text-red-600 hover:text-red-900"
							>
								Деактивировать
							</button>
						</td>
					</tr>
					<tr v-if="employees.length === 0">
						<td colspan="10" class="px-6 py-4 text-center text-gray-500">
							Нет сотрудников
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Модальное окно -->
		<EmployeeModal
			:is-open="modalOpen"
			:mode="modalMode"
			:employee="modalEmployee || null"
			:saving="saving"
			:error="saveError"
			@save="handleModalSave"
			@cancel="handleModalCancel"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useEmployees } from '../composables/useEmployees';
import { useDepartments } from '../composables/useDepartments';
import EmployeeModal from './EmployeeModal.vue';
import DepartmentSelect from './DepartmentSelect.vue';

const {
	employees,
	loading,
	error,
	loadEmployees,
	openCreateModal,
	openEditModal,
	deactivateEmployee,
	applyFilter,
	resetFilter,
	modalOpen,
	modalMode,
	modalEmployee,
	closeModal,
	saveEmployee,
} = useEmployees();

const { departments, loadDepartments } = useDepartments();

const selectedDepartmentId = ref<string | null>(null);
const selectedStatus = ref<string>('');
const saving = ref(false);
const saveError = ref<string | null>(null);

onMounted(async () => {
	console.log('EmployeeList mounted, loading data...');
	try {
		await Promise.all([loadEmployees(), loadDepartments()]);
		console.log('Data loaded successfully');
	} catch (e) {
		console.error('Failed to initialize:', e);
		if (error.value === null) {
			error.value = e instanceof Error ? e : new Error('Failed to initialize');
		}
	}
});

// Применение фильтров
watch([selectedDepartmentId, selectedStatus], () => {
	const filter: any = {};
	if (selectedDepartmentId.value) {
		filter.departmentId = selectedDepartmentId.value;
	}
	if (selectedStatus.value === 'active') {
		filter.isActive = true;
	} else if (selectedStatus.value === 'inactive') {
		filter.isActive = false;
	}
	applyFilter(filter);
}, { immediate: false });

function handleCreate() {
	openCreateModal();
}

async function handleEdit(employeeId: string) {
	await openEditModal(employeeId);
}

async function handleModalSave(payload: any) {
	try {
		saving.value = true;
		saveError.value = null;
		await saveEmployee(payload);
		closeModal();
		await loadEmployees();
	} catch (e) {
		saveError.value = e instanceof Error ? e.message : 'Ошибка при сохранении';
	} finally {
		saving.value = false;
	}
}

function handleModalCancel() {
	closeModal();
	saveError.value = null;
}

async function handleDeactivate(employeeId: string) {
	if (confirm('Вы уверены, что хотите деактивировать этого сотрудника?')) {
		try {
			await deactivateEmployee(employeeId);
		} catch (e) {
			console.error('Failed to deactivate employee:', e);
		}
	}
}

function handleResetFilter() {
	selectedDepartmentId.value = null;
	selectedStatus.value = '';
	resetFilter();
}


function getDepartmentName(departmentId: string | null): string {
	if (!departmentId) return '-';
	const dept = departments.value.find((d) => d.id === departmentId);
	return dept?.name || '-';
}
</script>

