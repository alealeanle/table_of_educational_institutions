import { defineStore } from 'pinia';
import { list } from '@/stubs';

export const useStubStore = defineStore('stub', {
  state: () => ({
    list,
  }),
  actions: {
    toggleCompleted(id) {
      const item = this.list.find(item => item.id === id);
      if (item) {
        item.completed = !item.completed;
      }
    },
  },
});
