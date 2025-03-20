<script setup>
import { computed } from 'vue';
import { useStore } from '@/stores';
import Dropdown from '@commons/Dropdown';
import s from './Pagination.module.scss';

const props = defineProps({
  currentPage: Number,
  recordsPerPage: Number,
  isFiltered: Boolean,
});

const emit = defineEmits(['updatePage', 'updateRecordsPerPage']);

const store = useStore();

const loading = computed(() => store.loading);
const error = computed(() => store.error);

const totalPages = computed(() => store.response.pages_count || 1);
const totalRecords = computed(() => store.response.total_count || 0);

const pageSizes = ['10', '20', '30', '40', '50'];

const goToPage = page => {
  if (page >= 1 && page <= totalPages.value) {
    emit('updatePage', page);
  }
};

const updateRecordsPerPage = value => {
  const newValue = Number(value);
  if (!isNaN(newValue) && newValue > 0) {
    emit('updateRecordsPerPage', newValue);
  }
};

const displayedPages = computed(() => {
  const pages = [];
  const maxPagesToShow = 5;
  const { currentPage } = props;

  if (totalPages.value <= maxPagesToShow) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages.value - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages.value - 2) pages.push('...');
    pages.push(totalPages.value);
  }

  return pages;
});
</script>

<template>
  <div v-if="!loading" :class="s.pagination">
    <div :class="s.leftBlock">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" :class="[s.btn, s.arrowBtn]">
        <img :src="require('@/assets/svg/Arrow.svg')" alt="Arrow" :class="s.imgLArrow" />
      </button>

      <span :class="s.pagesBtn">
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="goToPage(page)"
          :tabindex="page === '...' && -1"
          :class="[s.btn, { [s.active]: page === currentPage, [s.dots]: page === '...' }]"
        >
          {{ page }}
        </button>
      </span>

      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" :class="[s.btn, s.arrowBtn]">
        <img :src="require('@/assets/svg/Arrow.svg')" alt="Arrow" :class="s.imgRArrow" />
      </button>
    </div>

    <div v-if="!error" :class="s.rightBlock">
      <div v-if="!isFiltered" :class="s.paginationInfo">
        {{ (currentPage - 1) * recordsPerPage + 1 }}-{{ Math.min(currentPage * recordsPerPage, totalRecords) }} из
        {{ totalRecords }} записей
      </div>

      <div v-if="!error" :class="s.paginationSize">
        <span :class="s._hide480px">Показывать</span>
        <Dropdown
          :options="pageSizes.map(size => ({ label: size, value: size }))"
          :model-value="recordsPerPage.toString()"
          @update:model-value="updateRecordsPerPage"
          :class="s.show"
          :customDropdownClass="s.dropdown"
          :customDropdownBtnClass="s.dropdownBtn"
          :customArrowClass="s.arrow"
          :customMenuItemClass="s.menuItem"
        />
      </div>
    </div>
  </div>
</template>

<style />
