<template>
	<div
		v-if="isOpen"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		@click.self="handleCancel"
	>
		<div
			class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
			@click.stop
		>
			<div class="p-6">
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-2xl font-bold text-gray-800">
						{{ mode === 'create' ? 'Создать сотрудника' : 'Редактировать сотрудника' }}
					</h2>
					<button
						@click="handleCancel"
						class="text-gray-500 hover:text-gray-700 text-2xl"
					>
						×
					</button>
				</div>

				<form @submit.prevent="handleSubmit" class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								Имя <span class="text-red-500">*</span>
							</label>
							<input
								v-model="form.firstName"
								type="text"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Введите имя"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								Фамилия <span class="text-red-500">*</span>
							</label>
							<input
								v-model="form.lastName"
								type="text"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Введите фамилию"
							/>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							v-model="form.email"
							type="email"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="email@example.com"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Отдел
						</label>
						<DepartmentSelect v-model="form.departmentId" />
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								Должность (код)
							</label>
							<input
								v-model="form.positionCode"
								type="text"
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="DEV"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								Должность (название)
							</label>
							<input
								v-model="form.positionName"
								type="text"
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Разработчик"
							/>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Дата начала работы
						</label>
						<input
							v-model="form.startDate"
							type="date"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div class="flex items-center">
						<input
							v-model="form.isRemote"
							type="checkbox"
							id="isRemote"
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label for="isRemote" class="ml-2 block text-sm text-gray-700">
							Удаленная работа
						</label>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Телефон
						</label>
						<input
							v-model="form.phone"
							type="text"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="8 (999) 123-45-67"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Адрес
						</label>
						<input
							v-model="form.address"
							type="text"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="г. Москва, ул. Ленина, д. 1"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Комментарий
						</label>
						<textarea
							v-model="form.comment"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Особые пожелания или замечания"
						></textarea>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Хобби
						</label>
						<input
							v-model="form.hobbies"
							type="text"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Например: футбол, чтение, путешествия"
						/>
					</div>

					<div v-if="localError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
						{{ localError }}
					</div>

					<div v-if="props.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
						{{ props.error }}
					</div>

					<div class="flex justify-end gap-3 pt-4">
						<button
							type="button"
							@click="handleCancel"
							class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
						>
							Отмена
						</button>
						<button
							type="submit"
							:disabled="props.saving"
							class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{{ props.saving ? 'Сохранение...' : 'Сохранить' }}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { Employee } from '../../domain/entities/employee.entity';
import DepartmentSelect from './DepartmentSelect.vue';

const props = withDefaults(defineProps<{
	isOpen: boolean;
	mode?: 'create' | 'edit';
	employee?: Employee | null;
	saving?: boolean;
	error?: string | null;
}>(), {
	mode: 'create',
	saving: false,
	error: null,
});

const emit = defineEmits<{
	(e: 'save', payload: any): void;
	(e: 'cancel'): void;
}>();

const localError = ref<string | null>(null);

const form = reactive({
	firstName: '',
	lastName: '',
	email: '',
	departmentId: null as string | null,
	positionCode: '',
	positionName: '',
	startDate: '',
	isRemote: false,
	// добавим вспомогательные поля:
	phone: '',
	address: '',
	comment: '',
	hobbies: '',
});

// Заполнить форму данными сотрудника при редактировании
watch(
	() => props.employee,
	(employee) => {
		if (employee && props.mode === 'edit') {
			form.firstName = employee.firstName;
			form.lastName = employee.lastName;
			form.email = employee.email || '';
			form.departmentId = employee.departmentId;
			form.positionCode = employee.position?.code || '';
			form.positionName = employee.position?.name || '';
			form.startDate = employee.startDate?.toISOString().split('T')[0] || '';
			form.isRemote = employee.isRemote;
			// вспомогательные
			form.phone = employee['phone'] || '';
			form.address = employee['address'] || '';
			form.comment = employee['comment'] || '';
			form.hobbies = employee['hobbies'] || '';
		} else {
			// Сброс формы для создания
			form.firstName = '';
			form.lastName = '';
			form.email = '';
			form.departmentId = null;
			form.positionCode = '';
			form.positionName = '';
			form.startDate = '';
			form.isRemote = false;
			// вспомогательные
			form.phone = '';
			form.address = '';
			form.comment = '';
			form.hobbies = '';
		}
		localError.value = null;
	},
	{ immediate: true }
);

function handleSubmit() {
	const position =
		form.positionCode && form.positionName
			? { code: form.positionCode, name: form.positionName }
			: null;

	const startDate = form.startDate ? new Date(form.startDate) : null;

	emit('save', {
		id: props.employee?.id,
		firstName: form.firstName,
		lastName: form.lastName,
		email: form.email || null,
		departmentId: form.departmentId,
		position,
		startDate,
		isRemote: form.isRemote,
		// вспомогательные
		phone: form.phone || null,
		address: form.address || null,
		comment: form.comment || null,
		hobbies: form.hobbies || null,
	});
}

function handleCancel() {
	emit('cancel');
}
</script>

