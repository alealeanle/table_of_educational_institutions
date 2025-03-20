<script setup>
import { useStore } from '@/stores';
import SortHeader from './SortHeader';
import s from './TableContent.module.scss';

const props = defineProps({
  sortedList: Array,
  sortColumn: String,
  sortOrder: Number,
  highlightMatch: Function,
  getUniqueEduLevels: Function,
  formatDate: Function,
});

const store = useStore();

const emit = defineEmits(['update:sortColumn', 'update:sortOrder']);

const sortByColumn = column => {
  if (props.sortColumn === column) {
    emit('update:sortOrder', props.sortOrder * -1);
  } else {
    emit('update:sortColumn', column);
    emit('update:sortOrder', 1);
  }
};
</script>

<template>
  <table :class="s.table">
    <thead :class="s.tHeader">
      <tr :class="s.headRow">
        <th :class="s.headCell">
          <div :class="s.thContent">
            <img :src="require('@/assets/svg/Check.svg')" alt="Check" :class="s.check" />
          </div>
        </th>
        <th :class="[s.headCell, s._hide992px]" @click="sortByColumn('date')">
          <div :class="s.thContent">
            Дата
            <span :class="[s.sortWrap, { [s.active]: sortColumn === 'date' }]">
              <img
                :src="require('@/assets/svg/Sort.svg')"
                alt="Sort"
                tabindex="0"
                @keyup.enter="sortByColumn('date')"
                :class="[s.sort, { [s.rotated]: sortColumn === 'date' && sortOrder === -1 }]"
              />
            </span>
          </div>
        </th>
        <SortHeader
          label="Регион"
          field="region"
          :sortColumn="props.sortColumn"
          :sortOrder="props.sortOrder"
          @updateSort="sortByColumn"
          :s="s"
        />
        <SortHeader
          label="Название"
          field="name"
          :sortColumn="props.sortColumn"
          :sortOrder="props.sortOrder"
          @updateSort="sortByColumn"
          :s="s"
        />
        <SortHeader
          :class="s._hide992px"
          label="Адрес"
          field="address"
          :sortColumn="props.sortColumn"
          :sortOrder="props.sortOrder"
          @updateSort="sortByColumn"
          :s="s"
        />
        <SortHeader
          :class="s._hide480px"
          label="Уровень образования"
          field="level"
          :sortColumn="props.sortColumn"
          :sortOrder="props.sortOrder"
          @updateSort="sortByColumn"
          :s="s"
        />
      </tr>
    </thead>
    <tbody :class="s.tBody">
      <transition-group name="fade">
        <tr v-for="item in sortedList || []" :key="item.uuid" :class="s.row">
          <td :class="s.cell">
            <div :class="s.checkboxWrap">
              <input
                type="checkbox"
                name="checkbox"
                :id="'checkbox_' + item.uuid"
                :class="s.checkbox"
                tabindex="-1"
                :checked="item.supplements.some(s => s.status.name === 'Действующее') ? true : false"
                @change="store.toggleStatus(item.uuid)"
              />
              <label :for="'checkbox_' + item.uuid" :class="s.checkboxCheckMark"></label>
              <label
                :for="'checkbox_' + item.uuid"
                :class="s.checkboxFrame"
                tabindex="0"
                @keyup.enter="store.toggleStatus(item.uuid)"
              ></label>
            </div>
          </td>
          <td :class="[s.cell, s._hide992px]">{{ formatDate(item.updated_at) }}</td>
          <td :class="s.cell" v-html="highlightMatch(item.edu_org.region.name)"></td>
          <td :class="s.cell" v-html="highlightMatch(item.edu_org.short_name ?? item.edu_org.full_name)"></td>
          <td :class="[s.cell, s._hide992px]" v-html="highlightMatch(item.edu_org.contact_info.post_address)"></td>
          <td :class="[s.cell, s._hide480px]">
            <div v-if="getUniqueEduLevels(item.supplements).length" :class="s.cell">
              <span
                v-for="(level, index) in getUniqueEduLevels(item.supplements)"
                :key="index"
                :class="[s.level, s._hide480px]"
              >
                {{ level }}
              </span>
            </div>
          </td>
        </tr>
      </transition-group>
    </tbody>
  </table>
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
