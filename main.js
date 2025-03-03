import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './src/components/App.vue';
import './src/styles/global.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

document.addEventListener('DOMContentLoaded', () => {
  app.mount('#app');
});
