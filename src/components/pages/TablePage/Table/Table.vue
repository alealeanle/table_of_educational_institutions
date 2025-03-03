<script setup>
import { computed, defineProps, ref } from 'vue';
import { useStubStore } from '@/stores';
import Pagination from '@TablePage/Pagination';

const props = defineProps({
  searchQuery: String,
  dateRange: Array,
  selectedType: String,
  selectedStatus: String,
});

const store = useStubStore();
const list = store.list;

const parseDate = dateStr => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

const sortColumn = ref(null);
const sortOrder = ref(1);
const currentPage = ref(1);
const recordsPerPage = ref(10);

const sortByColumn = column => {
  if (sortColumn.value === column) {
    sortOrder.value *= -1;
  } else {
    sortColumn.value = column;
    sortOrder.value = 1;
  }
};

const filteredList = computed(() => {
  let sortedList = [...list].filter(item => {
    const itemDate = parseDate(item.date);
    const query = props.searchQuery ? props.searchQuery.toLowerCase() : '';

    const isWithinDateRange =
      props.dateRange.length === 2
        ? itemDate >= new Date(props.dateRange[0]) && itemDate <= new Date(props.dateRange[1])
        : true;

    const matchesType = props.selectedType === 'Все' || item.level.includes(props.selectedType);

    const matchesStatus =
      props.selectedStatus === 'completed'
        ? item.completed
        : props.selectedStatus === 'not_completed'
          ? !item.completed
          : props.selectedStatus === 'all';

    const matchesSearchQuery =
      query === '' ||
      item.region.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.address.toLowerCase().includes(query);

    return isWithinDateRange && matchesSearchQuery && matchesType && matchesStatus;
  });

  if (sortColumn.value) {
    sortedList.sort((a, b) => {
      let valA = a[sortColumn.value];
      let valB = b[sortColumn.value];

      if (sortColumn.value === 'date') {
        valA = parseDate(valA);
        valB = parseDate(valB);
      }

      if (Array.isArray(valA) && Array.isArray(valB)) {
        return (valA.length - valB.length) * sortOrder.value;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * sortOrder.value;
      }

      return (valA > valB ? 1 : -1) * sortOrder.value;
    });
  }

  return sortedList;
});

const highlightMatch = text => {
  if (!props.searchQuery) return text;
  const query = props.searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

const totalRecords = computed(() => filteredList.value.length || 0);

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * recordsPerPage.value;
  return filteredList.value.slice(start, start + recordsPerPage.value);
});

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
</script>

<template>
  <table class="table">
    <thead class="tHeader">
      <tr class="headRow">
        <th class="headCell">
          <div class="thContent"><img src="/src/assets/svg/Check.svg" alt="Check" class="check" /></div>
        </th>
        <th class="headCell _hide768px" @click="sortByColumn('date')">
          <div class="thContent">
            Дата
            <span class="sortWrap" :class="{ active: sortColumn === 'date' }">
              <img
                src="/src/assets/svg/Sort.svg"
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
                src="/src/assets/svg/Sort.svg"
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
                src="/src/assets/svg/Sort.svg"
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
                src="/src/assets/svg/Sort.svg"
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
                src="/src/assets/svg/Sort.svg"
                alt="Sort"
                class="sort"
                :class="{ rotated: sortColumn === 'level' && sortOrder === -1 }"
            /></span>
          </div>
        </th>
      </tr>
    </thead>
    <tbody class="tBody">
      <tr v-for="item in paginatedList || []" :key="item.id" class="row">
        <td class="cell">
          <div class="checkboxWrap">
            <input
              type="checkbox"
              name="checkbox"
              :id="'checkbox_' + item.id"
              class="checkbox"
              :checked="item.completed"
              @change="store.toggleCompleted(item.id)"
            />
            <label :for="'checkbox_' + item.id" class="checkboxCheckMark"></label>
            <label :for="'checkbox_' + item.id" class="checkboxFrame"></label>
          </div>
        </td>
        <td class="cell _hide768px">{{ item.date }}</td>
        <td class="cell" v-html="highlightMatch(item.region)"></td>
        <td class="cell" v-html="highlightMatch(item.name)"></td>
        <td class="cell _hide992px" v-html="highlightMatch(item.address)"></td>
        <td class="cell _hide480px">
          <span v-for="(level, index) in item.level || []" :key="index" class="level _hide480px">{{ level }}</span>
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
  }
}

._hide992px {
  @include respondMLarge {
    display: none;
  }
}

._hide768px {
  @include respondMedium {
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
