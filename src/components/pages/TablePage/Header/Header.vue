<script setup>
import { ref } from 'vue';
import DatePicker from '@vuepic/vue-datepicker';
import { downloadList } from '@api/downloadList';
import Button from '@commons/Button';
import Dropdown from '@commons/Dropdown';
import '@vuepic/vue-datepicker/dist/main.css';
import s from './Header.module.scss';
import './datapicker.scss';

const emit = defineEmits(['updateSearch', 'updateDateRange', 'updateType', 'updateStatus']);

const dateRange = ref([]);
const searchQuery = ref('');

const updateSearch = () => {
  emit('updateSearch', searchQuery.value);
};

const updateDateRange = () => {
  emit('updateDateRange', dateRange.value);
};

const updateType = () => {
  emit('updateType', selectedTypeOption.value);
};

const updateStatus = () => {
  emit('updateStatus', selectedStatusOption.value);
};

const dropdownTypeOptions = [
  { label: 'Все виды', value: 'Все' },
  { label: 'Постоянное', value: 'Постоянное' },
  { label: 'Не определен', value: 'Не определен' },
];
const dropdownStatusOptions = [
  { label: 'Все статусы', value: 'Все' },
  { label: 'Действующее', value: 'Действующее' },
  { label: 'Недействующее', value: 'Недействующее' },
];
const selectedTypeOption = ref(dropdownTypeOptions[0].value);
const selectedStatusOption = ref(dropdownStatusOptions[0].value);

const handleDateChange = value => {
  emit('updateDateRange', value || []);
  dateRange.value = value || [];
};

const format = dateRange => {
  if (!dateRange || dateRange.length !== 2) return '';

  const [startDate, endDate] = dateRange;

  return `${startDate
    .toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    .replace(' г.', '')} - ${endDate
    .toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    .replace(' г.', '')}`;
};
</script>

<template>
  <header :class="s.header">
    <div :class="s.row_1">
      <h1 :class="s.title">Таблица учреждений</h1>
      <div :class="s.controlsGroup">
        <input
          type="text"
          name="findInput"
          :class="s.searchInput"
          placeholder="Поиск"
          v-model="searchQuery"
          @input="updateSearch"
        />
        <img :src="require('@/assets/svg/Find.svg')" alt="Find" :class="s.find" />
        <Button type="accent" @click="downloadList" :class="s.downloadBtn">
          <img :src="require('@/assets/svg/Download.svg')" alt="Download" :class="s.download" />Скачать
        </Button>
      </div>
    </div>
    <div :class="s.row_2">
      <div class="datepickerContainer" data-datepicker>
        <DatePicker
          name="dateInput"
          v-model="dateRange"
          range
          placeholder="Выберите период"
          :enable-time-picker="false"
          locale="ru"
          month-name-format="long"
          :format="format"
          select-text="Сохранить"
          cancel-text="Отмена"
          position="left"
          :clearable="!!dateRange.length"
          hide-input-icon
          @update:model-value="updateDateRange"
          @update:modelValue="handleDateChange"
        >
          <template #menu-header>
            <div class="calendarHeader">
              <h3 class="calendarTitle">Выбрать период</h3>
            </div>
          </template>
        </DatePicker>
        <transition name="fade">
          <img v-if="!dateRange.length" :src="require('@/assets/svg/Calendar.svg')" alt="Calendar" class="calendar" />
        </transition>
      </div>
      <Dropdown
        :class="[s.dropdown, s._type]"
        v-model="selectedTypeOption"
        :options="dropdownTypeOptions"
        @update:model-value="updateType"
      />
      <Dropdown
        :class="[s.dropdown, s._status]"
        v-model="selectedStatusOption"
        :options="dropdownStatusOptions"
        @update:model-value="updateStatus"
      />
    </div>
  </header>
</template>

<style />
