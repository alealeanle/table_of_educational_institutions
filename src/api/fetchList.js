import api from '@/api';
import { useStubStore } from '@/stores';

export const fetchList = async (params = {}) => {
  const store = useStubStore();

  store.loading = true;
  store.error = null;

  try {
    const response = await api.get('/schools', { params });

    if (response.status === 200 && response.data?.data) {
      store.setData(response.data.data);
    } else {
      console.error('Ошибка сервера:', response);
      store.error = 'Ошибка получения данных';
      store.setData({ list: [], pages_count: 1, total_count: 0 });
    }
  } catch (err) {
    console.error('Ошибка API:', err);

    if (err.response?.status === 500) {
      store.error = 'Ошибка сервера';
    } else if (err.response?.status === 429) {
      store.error = 'Слишком много запросов. Попробуйте позже';
    } else {
      store.error = `Ошибка: ${err.message}` || 'Ошибка загрузки данных';
    }
  } finally {
    store.loading = false;
  }
};
