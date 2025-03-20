<script setup>
import { computed, ref, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';
import s from './Dropdown.module.scss';

const props = defineProps({
  modelValue: String,
  options: Array,
  customDropdownClass: {
    type: [String],
    default: null,
  },
  customDropdownBtnClass: {
    type: [String],
    default: null,
  },
  customArrowClass: {
    type: [String],
    default: null,
  },
  customDropdownMenuClass: {
    type: [String],
    default: null,
  },
  customMenuItemClass: {
    type: [String],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);
const dropdownRef = ref(null);

watch(
  () => props.options,
  newOptions => {
    if (!props.modelValue && newOptions.length > 0) {
      emit('update:modelValue', newOptions[0].value);
    }
  },
  { immediate: true },
);

const selectedLabel = computed(() => {
  const selectedOption = props.options.find(opt => opt.value === props.modelValue);
  return selectedOption ? selectedOption.label : '';
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = option => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});
</script>

<template>
  <div :class="[s.dropdown, props.customDropdownClass]" ref="dropdownRef">
    <button :class="[s.dropdownBtn, props.customDropdownBtnClass]" @click="toggleDropdown">
      {{ selectedLabel }}
      <img
        :src="require('@/assets/svg/Arrow.svg')"
        alt="Arrow"
        :class="[s.arrow, props.customArrowClass, { [s.open]: isOpen }]"
      />
    </button>

    <ul v-if="isOpen" :class="[s.dropdownMenu, props.customDropdownMenuClass]">
      <li
        v-for="(option, index) in options"
        :key="index"
        tabindex="0"
        @click="selectOption(option)"
        @keyup.enter="selectOption(option)"
        :class="[s.menuItem, props.customMenuItemClass]"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<style />
