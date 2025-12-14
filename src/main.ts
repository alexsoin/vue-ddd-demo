import 'reflect-metadata';
import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

console.log('Main.ts: Starting app...');

try {
	const app = createApp(App);
	app.mount('#app');
	console.log('Main.ts: App mounted successfully');
} catch (e) {
	console.error('Main.ts: Failed to mount app:', e);
	document.body.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>Ошибка запуска приложения</h1>
      <pre>${e instanceof Error ? e.stack : String(e)}</pre>
    </div>
  `;
}
