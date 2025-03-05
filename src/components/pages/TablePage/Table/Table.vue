<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStubStore } from '@/stores';
import { fetchList } from '@api/fetchList';
import Pagination from '@TablePage/Pagination';
import Loading from '@commons/Loading';

const props = defineProps({
  searchQuery: String,
  dateRange: Array,
  selectedType: String,
  selectedStatus: String,
});

const route = useRoute();
const router = useRouter();
const store = useStubStore();

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

const sortByColumn = column => {
  if (sortColumn.value === column) {
    sortOrder.value *= -1;
  } else {
    sortColumn.value = column;
    sortOrder.value = 1;
  }
};

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
  return text.replace(regex, '<span class="highlight">$1</span>');
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
  <Loading v-if="loading" />
  <p v-if="error" class="error">{{ error }}</p>

  <table v-if="!loading && !error && list.length > 0" class="table">
    <thead class="tHeader">
      <tr class="headRow">
        <th class="headCell">
          <div class="thContent"><img :src="require('@/assets/svg/Check.svg')" alt="Check" class="check" /></div>
        </th>
        <th class="headCell _hide992px" @click="sortByColumn('date')">
          <div class="thContent">
            Дата
            <span class="sortWrap" :class="{ active: sortColumn === 'date' }">
              <img
                :src="require('@/assets/svg/Sort.svg')"
                alt="Sort"
                class="sort"
                :class="{ rotated: sortColumn === 'date' && sortOrder === -1 }"
            /></span>
          </div>
        </th>
        <th class="headCell" @click="sortByColumn('region')">
          <div class="thContent">
            Регион
            <span class="sortWrap" :class="{ active: sortColumn === 'region' }">
              <img
                :src="require('@/assets/svg/Sort.svg')"
                alt="Sort"
                class="sort"
                :class="{ rotated: sortColumn === 'region' && sortOrder === -1 }"
            /></span>
          </div>
        </th>
        <th class="headCell" @click="sortByColumn('name')">
          <div class="thContent">
            Название
            <span class="sortWrap" :class="{ active: sortColumn === 'name' }">
              <img
                :src="require('@/assets/svg/Sort.svg')"
                alt="Sort"
                class="sort"
                :class="{ rotated: sortColumn === 'name' && sortOrder === -1 }"
            /></span>
          </div>
        </th>
        <th class="headCell _hide992px" @click="sortByColumn('address')">
          <div class="thContent">
            Адрес
            <span class="sortWrap" :class="{ active: sortColumn === 'address' }">
              <img
                :src="require('@/assets/svg/Sort.svg')"
                alt="Sort"
                class="sort"
                :class="{ rotated: sortColumn === 'address' && sortOrder === -1 }"
            /></span>
          </div>
        </th>
        <th class="headCell _hide480px" @click="sortByColumn('level')">
          <div class="thContent _hide480px">
            Уровень образования
            <span class="sortWrap" :class="{ active: sortColumn === 'level' }">
              <img
                :src="require('@/assets/svg/Sort.svg')"
                alt="Sort"
                class="sort"
                :class="{ rotated: sortColumn === 'level' && sortOrder === -1 }"
            /></span>
          </div>
        </th>
      </tr>
    </thead>
    <tbody class="tBody">
      <tr v-for="item in sortedList || []" :key="item.uuid" class="row">
        <td class="cell">
          <div class="checkboxWrap">
            <input
              type="checkbox"
              name="checkbox"
              :id="'checkbox_' + item.uuid"
              class="checkbox"
              :checked="item.supplements.some(s => s.status.name === 'Действующее') ? true : false"
              @change="store.toggleStatus(item.uuid)"
            />
            <label :for="'checkbox_' + item.uuid" class="checkboxCheckMark"></label>
            <label :for="'checkbox_' + item.uuid" class="checkboxFrame"></label>
          </div>
        </td>
        <td class="cell _hide992px">{{ formatDate(item.updated_at) }}</td>
        <td class="cell" v-html="highlightMatch(item.edu_org.region.name)"></td>
        <td class="cell" v-html="highlightMatch(item.edu_org.short_name ?? item.edu_org.full_name)"></td>
        <td class="cell _hide992px" v-html="highlightMatch(item.edu_org.contact_info.post_address)"></td>
        <td class="cell _hide480px">
          <div v-if="getUniqueEduLevels(item.supplements).length" class="cell">
            <span v-for="(level, index) in getUniqueEduLevels(item.supplements)" :key="index" class="level _hide480px">
              {{ level }}
            </span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <Pagination
    :totalRecords="totalRecords"
    :currentPage="currentPage"
    :recordsPerPage="recordsPerPage"
    :isFiltered="
      !!props.searchQuery || props.dateRange.length || props.selectedType !== 'Все' || props.selectedStatus !== 'all'
    "
    @updatePage="updatePage"
    @updateRecordsPerPage="updateRecordsPerPage"
  />
</template>

<style lang="scss" scoped>
.error {
  width: 100%;
  padding: 20px 0;
  text-align: center;
  color: $errorColor;

  @include respondXLarge {
    font-size: 24px;
  }

  @include respondMedium {
    font-size: 18px;
  }
}

.table {
  margin: 0px 0px 24px 0px;

  @include respondMedium {
    margin: 0px 0px 15px 0px;
  }
}

.tHeader {
  background-color: $lightGray;
}

.thContent {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  color: $gray;
  cursor: pointer;

  @include respondMedium {
    width: 100%;
    padding: 3px;
    font-size: 10px;
  }
}

.sortWrap {
  right: 10px;
  padding: 1px;
  border: 1px solid transparent;
  border-radius: 2px;
  transition: border-color 0.3s ease 0s;

  &.active {
    border-color: $lightGreen;
    background-color: $whiteGreen;
  }
}

.sort {
  transition: transform 0.3s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

.row {
  border-bottom: 1px solid $inputBorderColor;

  @include respondSmall {
    border-bottom: none;
  }
}

.check {
  margin-left: 2px;
  width: 22px;
  height: 22px;
}

.cell {
  padding: 22px 16px;
  font-size: 14px;

  @include respondXXLarge {
    padding: 16px;
  }

  @include respondMedium {
    padding: 3px;
    font-size: 10px;
  }

  @include respondSmall {
    padding: 8px 3px;
  }

  &:last-child {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    max-width: 305px;
    padding: 5px 16px;

    @include respondSmall {
      display: none;
    }
  }
}

._hide992px {
  @include respondMLarge {
    display: none;
  }
}

._hide480px {
  @include respondSmall {
    display: none;
  }
}

.level {
  padding: 4px 6px;
  border: 1px solid #e6e6e7;
  border-radius: 8px;
}

.checkboxWrap {
  position: relative;
}

.checkbox {
  position: absolute;
  top: -8px;
  left: 5px;
  z-index: 1;
  width: 16px;
  height: 16px;
  opacity: 0;
  cursor: pointer;

  &:checked + .checkboxCheckMark {
    position: absolute;
    cursor: pointer;

    &:before {
      content: '';
      position: absolute;
      z-index: 1;
      top: -1px;
      left: 9px;
      width: 10px;
      height: 2px;
      border-radius: 40px;
      background: $bgColor;
      transform: rotate(-45deg);
      pointer-events: none;
    }

    &:after {
      content: '';
      position: absolute;
      z-index: 1;
      top: 1px;
      left: 7px;
      width: 5px;
      height: 2px;
      border-radius: 40px;
      background-color: $bgColor;
      transform: rotate(45deg);
    }
  }

  &:checked ~ .checkboxFrame {
    background-color: #1b1b1f;
  }
}

.checkboxFrame {
  position: absolute;
  top: -9px;
  left: 4px;
  width: 18px;
  height: 18px;
  border-radius: 2px;
  background-color: $inputBorderColor;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 50% 50%;
}

:deep(.highlight) {
  background-color: $highlight;
  border-radius: 2px;
}
</style>
