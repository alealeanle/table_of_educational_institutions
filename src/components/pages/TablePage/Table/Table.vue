<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '@/stores';
import { fetchList } from '@api/fetchList';
import TableContent from './TableContent';
import Pagination from '@TablePage/Pagination';
import Loading from '@commons/Loading';
import s from './Table.module.scss';

const props = defineProps({
  searchQuery: String,
  dateRange: Array,
  selectedType: String,
  selectedStatus: String,
});

const route = useRoute();
const router = useRouter();
const store = useStore();

const sortColumn = ref(null);
const sortOrder = ref(1);
const currentPage = ref(Number(route.query.page) || 1);
const recordsPerPage = ref(Number(route.query.limit) || 10);
const list = computed(() => store.response.list);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

const updateURLParams = () => {
  router.replace({
    query: {
      ...route.query,
      page: currentPage.value,
      limit: recordsPerPage.value,
    },
  });
};

onMounted(() => {
  if (!route.query.page || !route.query.limit) {
    updateURLParams();
  }

  fetchList({ count: recordsPerPage.value, page: currentPage.value });
});

watch(
  () => route.query,
  newQuery => {
    if (newQuery.page) {
      currentPage.value = Number(newQuery.page);
    }
    if (newQuery.limit) {
      recordsPerPage.value = Number(newQuery.limit);
    }

    fetchList({ count: recordsPerPage.value, page: currentPage.value });
  },
  { immediate: true },
);

watch([currentPage, recordsPerPage], () => {
  updateURLParams();
});

const filteredList = computed(() => {
  if (!list.value || !Array.isArray(list.value)) return [];

  return list.value.filter(item => {
    if (!item.updated_at) return false;

    const itemDate = new Date(item.updated_at);
    const query = props.searchQuery ? props.searchQuery.toLowerCase() : '';

    const isWithinDateRange =
      props.dateRange.length === 2
        ? itemDate >= new Date(props.dateRange[0]) && itemDate <= new Date(props.dateRange[1])
        : true;

    const matchesSearchQuery =
      query === '' ||
      item.edu_org?.region?.name?.toLowerCase().includes(query) ||
      item.edu_org?.short_name?.toLowerCase().includes(query) ||
      item.edu_org?.contact_info?.post_address?.toLowerCase().includes(query);

    const matchesStatus =
      props.selectedStatus === 'Все' ||
      item.supplements.some(supplement => supplement.status.name === props.selectedStatus);

    const matchesType = props.selectedType === 'Все' || item.type.name === props.selectedType;

    return isWithinDateRange && matchesSearchQuery && matchesStatus && matchesType;
  });
});

const sortedList = computed(() => {
  if (!filteredList.value || filteredList.value.length === 0) return [];

  return [...filteredList.value].sort((a, b) => {
    let valA, valB;

    switch (sortColumn.value) {
      case 'date':
        valA = new Date(a.updated_at);
        valB = new Date(b.updated_at);
        break;
      case 'region':
        valA = a.edu_org?.region?.name || '';
        valB = b.edu_org?.region?.name || '';
        break;
      case 'name':
        valA = a.edu_org?.short_name || a.edu_org?.full_name || '';
        valB = b.edu_org?.short_name || b.edu_org?.full_name || '';
        break;
      case 'address':
        valA = a.edu_org?.contact_info?.post_address || '';
        valB = b.edu_org?.contact_info?.post_address || '';
        break;
      case 'level':
        valA = getUniqueEduLevels(a.supplements).join(', ');
        valB = getUniqueEduLevels(b.supplements).join(', ');
        break;
      default:
        return 0;
    }

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    return valA > valB ? sortOrder.value : valA < valB ? -sortOrder.value : 0;
  });
});

const highlightMatch = text => {
  if (!text || !props.searchQuery) return text;
  const query = props.searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, `<span class="${s.highlight}">$1</span>`);
};

const totalRecords = computed(() => filteredList.value.length || 0);

const updatePage = page => {
  if (!isNaN(page) && page >= 1) {
    currentPage.value = page;
  }
};

const updateRecordsPerPage = value => {
  const newValue = Number(value);
  if (!isNaN(newValue) && newValue > 0) {
    recordsPerPage.value = newValue;
    currentPage.value = 1;
  }
};

const getUniqueEduLevels = supplements => {
  if (!supplements || !Array.isArray(supplements)) return [];

  const uniqueLevels = new Set();

  supplements.forEach(supplement => {
    if (supplement.educational_programs && Array.isArray(supplement.educational_programs)) {
      supplement.educational_programs.forEach(program => {
        const firstWord = program.edu_level?.name?.split(' ')[0];
        if (firstWord && firstWord !== 'Не') {
          uniqueLevels.add(firstWord);
        }
      });
    }
  });

  return [...uniqueLevels];
};

const formatDate = dateStr => {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (isNaN(date)) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
</script>

<template>
  <transition name="fade">
    <Loading v-if="loading" key="111" />
  </transition>
  <p v-if="error" :class="[s.error, s.fade]">{{ error }}</p>

  <transition-group name="fade">
    <TableContent
      key="222"
      v-if="!loading && !error && list.length > 0"
      :sortedList="sortedList"
      v-model:sortColumn="sortColumn"
      v-model:sortOrder="sortOrder"
      :highlightMatch="highlightMatch"
      :getUniqueEduLevels="getUniqueEduLevels"
      :formatDate="formatDate"
    />
    <Pagination
      key="333"
      :totalRecords="totalRecords"
      :currentPage="currentPage"
      :recordsPerPage="recordsPerPage"
      :isFiltered="
        !!props.searchQuery ||
        !!props.dateRange.length ||
        props.selectedType !== 'Все' ||
        props.selectedStatus !== 'Все'
      "
      @updatePage="updatePage"
      @updateRecordsPerPage="updateRecordsPerPage"
    />
  </transition-group>
</template>

<style lang="scss" scoped>
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-active {
  position: absolute;
}
</style>
