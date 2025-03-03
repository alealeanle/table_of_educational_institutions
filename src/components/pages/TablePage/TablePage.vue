<script setup>
import { ref } from 'vue';
import Header from '@TablePage/Header';
import Table from '@TablePage/Table';

const searchQuery = ref('');
const dateRange = ref([]);
const selectedType = ref('Все');
const selectedStatus = ref('all');

const updateSearchQuery = query => {
  searchQuery.value = query;
};

const updateDateRange = range => {
  dateRange.value = range;
};

const updateType = type => {
  selectedType.value = type;
};

const updateStatus = status => {
  selectedStatus.value = status;
};
</script>

<template>
  <div class="pageBody">
    <Header
      @updateSearch="updateSearchQuery"
      @updateDateRange="updateDateRange"
      @updateType="updateType"
      @updateStatus="updateStatus"
    />
    <Table
      :searchQuery="searchQuery"
      :dateRange="dateRange"
      :selectedType="selectedType"
      :selectedStatus="selectedStatus"
    />
  </div>
</template>

<style lang="scss" scoped>
.pageBody {
  width: 100%;
  height: 100%;
  padding: 24px;
  font-size: 32px;
  background: white;
  border-radius: 16px;
  color: $darkBlack;

  @include respondMedium {
    padding: 10px;
  }
}
</style>
