<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import Dropdown from '@commons/Dropdown';

const props = defineProps({
  totalRecords: Number,
  currentPage: Number,
  recordsPerPage: Number,
  isFiltered: Boolean,
});

const emit = defineEmits(['updatePage', 'updateRecordsPerPage']);

const pageSizes = [10, 20, 30, 40, 50];

const totalPages = computed(() => Math.ceil(props.totalRecords / props.recordsPerPage));

const goToPage = page => {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    emit('updatePage', page);
  }
};

const updateRecordsPerPage = value => {
  const newValue = Number(value);
  if (!isNaN(newValue)) {
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
  <div class="pagination">
    <div class="leftBlock">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn arrowBtn">
        <img src="/src/assets/svg/Arrow.svg" alt="Arrow" class="imgLArrow" />
      </button>
      <span class="pagesBtn">
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="goToPage(page)"
          class="btn"
          :class="{ active: page === currentPage, dots: page === '...' }"
        >
          {{ page }}
        </button>
      </span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn arrowBtn">
        <img src="/src/assets/svg/Arrow.svg" alt="Arrow" class="imgRArrow" />
      </button>
    </div>

    <div class="rightBlock">
      <div v-if="!isFiltered" class="pagination-info">
        {{ (currentPage - 1) * recordsPerPage + 1 }}-{{ Math.min(currentPage * recordsPerPage, totalRecords) }} из
        {{ totalRecords }} записей
      </div>

      <div class="pagination-size">
        <span class="_hide480px">Показывать</span>
        <Dropdown
          :options="pageSizes.map(size => ({ label: size.toString(), value: size }))"
          :model-value="recordsPerPage"
          @update:model-value="updateRecordsPerPage"
          class="show"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.leftBlock {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  background: none;
  padding: 10px 14px;
  font-family: Gothampro;
  font-size: 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s ease;

  @include respondMedium {
    padding: 6px 12px;
    font-size: 10px;
    border-radius: 4px;
  }

  @include respondSmall {
    padding: 3px 6px;
  }

  &:hover {
    border-color: $gray;
  }

  &:disabled {
    opacity: 0.5;
    cursor: auto;

    &:hover {
      border-color: $inputBorderColor;
    }
  }
}

.pagesBtn {
  display: flex;
  align-items: center;
  gap: 2px;
}

.active {
  background-color: $lightGray;
}

.dots {
  pointer-events: none;
  border: none;
  background: none;

  @include respondSmall {
    padding: 0;
  }
}

.arrowBtn {
  padding: 6px 10px;
  font-weight: bold;
  border: 1px solid $inputBorderColor;

  @include respondMedium {
    padding: 3px 5px;
  }

  @include respondSmall {
    padding: 0;
  }
}

.imgLArrow {
  rotate: 90deg;

  @include respondSmall {
    width: 20px;
  }
}

.imgRArrow {
  rotate: -90deg;

  @include respondSmall {
    width: 20px;
  }
}

.rightBlock {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #687588;

  @include respondMedium {
    display: none;
    font-size: 10px;
  }
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #687588;

  @include respondMedium {
    font-size: 10px;
  }
}

:deep(.dropdown) {
  width: 73px;
  height: 36px;

  @include respondSmall {
    width: 50px;
    height: 25px;
  }
}

:deep(.dropdown-btn) {
  width: 73px;
  height: 36px;
  padding: 10px 44px 10px 16px;
  font-family: Gothampro;
  font-size: 12px;

  @include respondSmall {
    width: 50px;
    height: 25px;
    padding: 8px 30px 8px 10px;
    font-size: 10px;
  }
}

:deep(.arrow) {
  position: absolute;
  right: 10px;

  @include respondSmall {
    width: 15px;
  }
}

:deep(.menuItem) {
  @include respondMedium {
    font-size: 10px;
  }
}

._hide480px {
  display: none;
}
</style>
