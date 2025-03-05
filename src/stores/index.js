import { defineStore } from 'pinia';

export const useStubStore = defineStore('responseData', {
  state: () => ({
    response: {},
    error: {},
    loading: false,
  }),

  actions: {
    toggleStatus(uuid) {
      const item = this.response.list.find(item => item.uuid === uuid);

      if (item) {
        const supplement = item.supplements.find(
          s => s.status.name === 'Действующее' || s.status.name === 'Недействующее',
        );

        if (supplement) {
          supplement.status.name = supplement.status.name === 'Действующее' ? 'Недействующее' : 'Действующее';
        }
      }
    },
    setData(data) {
      this.response = { ...data };
    },
  },
});
