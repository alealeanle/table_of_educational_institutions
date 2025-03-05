import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from '@/router';
import App from './src/components/App.vue';
import './src/styles/global.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

document.addEventListener('DOMContentLoaded', () => {
  app.mount('#app');
});
