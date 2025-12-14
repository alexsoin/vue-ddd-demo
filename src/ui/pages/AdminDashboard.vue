<template>
	<div class="min-h-screen bg-gray-100">
		<div class="container mx-auto px-4 py-8">
			<div v-if="initError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
				<strong>Ошибка инициализации:</strong> {{ initError }}
			</div>
			<EmployeeList />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import EmployeeList from '../components/EmployeeList.vue';
import { container } from '../../infrastructure/di/container';

const initError = ref<string | null>(null);

onMounted(async () => {
	try {
		console.log('AdminDashboard: Initializing container...');
		await container.initialize();
		console.log('AdminDashboard: Container initialized');
	} catch (e) {
		console.error('AdminDashboard: Failed to initialize:', e);
		initError.value = e instanceof Error ? e.message : 'Unknown error';
	}
});
</script>

