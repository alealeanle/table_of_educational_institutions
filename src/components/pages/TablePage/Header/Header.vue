<script setup>
import { ref, defineEmits } from 'vue';
import * as XLSX from 'xlsx';
import DatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useStubStore } from '@/stores';
import Button from '@commons/Button';
import Dropdown from '@commons/Dropdown';

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

const dropdownTypeOptions = ref([
  { label: 'Все виды', value: 'Все' },
  { label: 'Высшее', value: 'Высшее' },
  { label: 'Бакалавр', value: 'Бакалавр' },
  { label: 'Специальное', value: 'Специальное' },
  { label: 'Проф', value: 'Проф' },
  { label: 'Среднее', value: 'Среднее' },
]);
const dropdownStatusOptions = ref([
  { label: 'Все статусы', value: 'all' },
  { label: 'Заершенные', value: 'completed' },
  { label: 'Не завершенные', value: 'not_completed' },
]);
const selectedTypeOption = ref(dropdownTypeOptions.value[0].value);
const selectedStatusOption = ref(dropdownStatusOptions.value[0].value);

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

const store = useStubStore();
const list = store.list;

const downloadExcel = () => {
  const formattedList = list.map(obj => {
    let newObj = {};
    for (let key in obj) {
      if (Array.isArray(obj[key])) {
        newObj[key.toUpperCase()] = obj[key].join(', ');
      } else {
        newObj[key.toUpperCase()] = obj[key];
      }
    }
    return newObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedList);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Учереждения');

  XLSX.writeFile(workbook, 'Таблица учереждений.xlsx');
};
</script>

<template>
  <header class="header">
    <div class="row_1">
      <h1 class="title">Таблица учреждений</h1>
      <div class="controlsGroup">
        <input type="text" class="searchInput" placeholder="Поиск" v-model="searchQuery" @input="updateSearch" />
        <img src="/src/assets/svg/Find.svg" alt="Find" class="find" />
        <Button type="accent" @click="downloadExcel">
          <img src="/src/assets/svg/Download.svg" alt="Download" class="download" />Скачать
        </Button>
      </div>
    </div>
    <div class="row_2">
      <div class="datepickerContainer">
        <DatePicker
          v-model="dateRange"
          range
          placeholder="Выберите период"
          :enable-time-picker="false"
          locale="ru"
          month-name-format="long"
          :format="format"
          :clearable="false"
          select-text="Сохранить"
          cancel-text="Отмена"
          position="left"
          hide-input-icon
          @update:model-value="updateDateRange"
        >
          <template #menu-header>
            <div class="calendarHeader">
              <h3 class="calendarTitle">Выбрать период</h3>
            </div>
          </template>
        </DatePicker>
        <img src="/src/assets/svg/Calendar.svg" alt="Calendar" class="calendar" />
      </div>
      <Dropdown
        class="dropdown _type"
        v-model="selectedTypeOption"
        :options="dropdownTypeOptions"
        @update:model-value="updateType"
      />
      <Dropdown
        class="dropdown _status"
        v-model="selectedStatusOption"
        :options="dropdownStatusOptions"
        @update:model-value="updateStatus"
      />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0px 0px 24px 0px;

  @include respondMedium {
    margin: 0px 0px 16px 0px;
  }

  @include respondSmall {
    margin: 0px 0px 10px 0px;
  }
}

.row_1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;

  @include respondMedium {
    flex-direction: column;
    justify-content: center;
  }

  &:not(:last-child) {
    margin: 0px 0px 24px 0px;

    @include respondMedium {
      margin: 0px 0px 16px 0px;
    }

    @include respondSmall {
      margin: 0px 0px 10px 0px;
    }
  }
}

.title {
  font-size: 32px;
  font-weight: 700;
  line-height: 120%;
  letter-spacing: 0%;
  text-align: left;
  color: $darkGray;

  @include respondXLarge {
    font-size: 24px;
  }

  @include respondLarge {
    font-size: 20px;
  }
}

.controlsGroup {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;

  @include respondSmall {
    gap: 10px;
  }
}

.searchInput {
  width: 300px;
  height: 56px;
  padding: 16px 50px 16px 24px;
  font-size: 16px;
  border: 1px solid $inputBorderColor;
  border-radius: 10px;
  outline: none;
  transition: box-shadow 0.3s ease 0s;

  @include respondXLarge {
    height: 50px;
    padding: 16px 50px 16px 16px;
    font-size: 15px;
  }

  @include respondLarge {
    height: 40px;
    padding: 16px 40px 15px 10px;
    font-size: 14px;
    border-radius: 8px;
  }

  @include respondMedium {
    height: 30px;
  }

  @include respondSmall {
    width: 70%;
    padding: 16px;
  }

  &:hover,
  &:focus {
    box-shadow: 0px 0px 10px 2px rgba(34, 60, 80, 0.2);
  }

  &::placeholder {
    font-size: 16px;
    color: $gray;

    @include respondXLarge {
      font-size: 15px;
    }

    @include respondLarge {
      font-size: 14px;
    }
  }
}

.find {
  position: absolute;
  left: 255px;
  pointer-events: none;

  @include respondLarge {
    left: 265px;
  }

  @include respondMedium {
    width: 17px;
    left: 270px;
  }

  @include respondSmall {
    display: none;
  }
}

.download {
  margin: 0px 8px 0px 0px;
}

.datepickerContainer {
  position: relative;
  width: 35%;
  height: 56px;

  @include respondXXLarge {
    width: 517px;
  }

  @include respondXLarge {
    height: 50px;
  }

  @include respondLarge {
    height: 40px;
  }

  @include respondMedium {
    width: 100%;
    height: 30px;
  }
}

.calendar {
  position: absolute;
  top: 15px;
  right: 25px;
  pointer-events: none;

  @include respondLarge {
    top: 10px;
    right: 10px;
  }

  @include respondMedium {
    top: 7px;
    width: 20px;
  }
}

:deep(.dp__theme_light) {
  --dp-text-color: $darkBlack;
  --dp-range-between-dates-text-color: $darkBlack;
  --dp-range-between-dates-background-color: #c3fcd2;
  --dp-range-between-border-color: #c3fcd2;
}

:deep(.dp__main) {
  font-family: Gothampro;
  border-radius: 10px;

  @include respondXLarge {
    border-radius: 8px;
  }
}

:deep(.dp__input) {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 16px 24px;
  font-size: 16px;
  border: 1px solid $inputBorderColor;
  border-radius: 10px;
  color: $darkBlack;
  transition: box-shadow 0.3s ease 0s;

  @include respondXLarge {
    height: 50px;
    padding: 16px;
    font-size: 15px;
  }

  @include respondLarge {
    height: 40px;
    padding: 16px 35px 16px 10px;
    font-size: 14spx;
    border-radius: 8px;
  }

  @include respondMedium {
    height: 30px;
  }
}

:deep(.dp__input::placeholder) {
  font-size: 17px;
  color: black;

  @include respondXLarge {
    font-size: 16px;
  }

  @include respondLarge {
    font-size: 15px;
  }
}

:deep(.dp__input:hover) {
  border-color: $inputBorderColor;
  box-shadow: 0px 0px 10px 2px rgba(34, 60, 80, 0.2);
}

:deep(.dp__input:focus) {
  box-shadow: 0px 0px 10px 2px rgba(34, 60, 80, 0.2);
}

:deep(.dp__outer_menu_wrap) {
  width: 374px;
  height: 482px;

  @include respondXLarge {
    width: 300px;
    height: 400px;
  }

  @include respondLarge {
    width: 270px;
    height: 360px;
  }

  @include respondSmall {
    width: 260px;
  }
}

:deep(.dp__menu) {
  padding: 24px;
  border-radius: 16px;

  @include respondLarge {
    padding: 20px;
    border-radius: 10px;
  }
}

.calendarHeader {
  margin: 0px 0px 24px 0px;
  font-size: 20px;
  font-weight: 700;
  color: $darkGray;
  border-bottom: 1px solid #e0e0e0;

  @include respondXLarge {
    margin: 0px 0px 20px 0px;
    font-size: 18px;
  }

  @include respondLarge {
    margin: 0px 0px 15px 0px;
    font-size: 16px;
  }
}

.calendarTitle {
  margin: 0px 0px 24px 0px;
  font-family: Manrope;

  @include respondXLarge {
    margin: 0px 0px 20px 0px;
  }

  @include respondLarge {
    margin: 0px 0px 15px 0px;
  }
}

:deep(.dp__menu_inner) {
  padding: 0;
}

:deep(.dp--header-wrap) {
  margin: 0px 0px 14px 0px;
}

:deep(.dp__month_year_wrap) {
  justify-content: center;
  gap: 5px;
}

:deep(.dp__month_year_select) {
  width: max-content;
  font-family: Manrope;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: 0.3px;
  color: #3e4452;

  @include respondLarge {
    font-size: 15px;
  }

  &:first-child {
    justify-content: end;
  }

  &:last-child {
    justify-content: start;
  }
}

:deep(.dp__calendar_header_item) {
  font-family: sans-serif;
  font-size: 18px;
  font-weight: 100;
  color: #93939b;
}

:deep(.dp__calendar_header_separator) {
  display: none;
}

:deep(.dp__cell_inner) {
  font-family: Gothampro;
}

:deep(.dp__cell_inner) {
  border-radius: 0;
}

:deep(.dp__today) {
  border-color: $darkBlack;
}

:deep(.dp__range_start),
:deep(.dp__range_end) {
  background-color: $lightGreen;
  color: $darkBlack;
}

:deep(.dp__range_between) {
  background-color: $whiteGreen;
}

:deep(.dp__action_row) {
  justify-content: space-between;
  padding: 24px 0 0 0;

  @include respondLarge {
    padding: 15px 0 0 0;
  }
}

:deep(.dp__action_buttons) {
  flex: 0 0 100%;
  gap: 20px;
  margin-inline-start: 0;
  justify-content: space-between;

  @include respondXLarge {
    gap: 10px;
  }
}

:deep(.dp__selection_preview) {
  display: none;
}

:deep(.dp__action_button) {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 148px;
  height: 56px;
  margin: 0;
  padding: 16px 24px;
  font-family: Gothampro;
  font-size: 16px;
  line-height: 130%;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease 0s;

  @include respondXLarge {
    width: 120px;
    height: 45px;
    padding: 16px 20px;
    font-size: 15px;
  }

  @include respondLarge {
    width: 100px;
    height: 40px;
    font-size: 14px;
  }
}

:deep(.dp__action_cancel) {
  border: 1px solid $gray;
  transition: border-color 0.3s ease 0s;

  @media (any-hover: hover) {
    &:hover {
      border-color: $darkBlack;
    }
  }

  &:active {
    background-color: #f0f0f7;
  }
}

:deep(.dp__action_select) {
  color: $bgColor;
  background-color: $darkBlack;
  transition: color 0.3s ease 0s;

  @media (any-hover: hover) {
    &:hover {
      color: $darkBlack;
      background-color: $green;
    }
  }

  &:active {
    color: $darkBlack;
    background-color: $darkGreen;
  }
}

.row_2 {
  display: flex;
  justify-content: space-between;
  gap: 16px;

  @include respondMedium {
    flex-direction: column;
  }
}

.dropdown {
  width: 35%;
  height: 56px;

  @include respondXXLarge {
    width: 517px;
  }

  @include respondXLarge {
    height: 50px;
  }

  @include respondLarge {
    height: 40px;
  }

  @include respondMedium {
    width: auto;
    height: 30px;
  }
}
</style>
