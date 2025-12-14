<template>
	<select
		:value="modelValue"
		@change="handleChange"
		class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
		:disabled="loading"
	>
		<option value="">-- Выберите отдел --</option>
		<option
			v-for="dept in departmentOptions"
			:key="dept.value"
			:value="dept.value"
		>
			{{ dept.label }}
		</option>
	</select>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDepartments } from '../composables/useDepartments';

interface Props {
	modelValue?: string | null;
}

interface Emits {
	(e: 'update:modelValue', value: string | null): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { departmentOptions, loading, loadDepartments } = useDepartments();

onMounted(() => {
	loadDepartments();
});

function handleChange(event: Event) {
	const target = event.target as HTMLSelectElement;
	const value = target.value || null;
	emit('update:modelValue', value);
}
</script>

