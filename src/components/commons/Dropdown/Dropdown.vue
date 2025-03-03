<script setup>
import { computed, ref, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';

const props = defineProps({
  modelValue: String,
  options: Array,
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
  <div class="dropdown" ref="dropdownRef">
    <button class="dropdown-btn" @click="toggleDropdown">
      {{ selectedLabel }}
      <img src="/src/assets/svg/Arrow.svg" alt="Arrow" class="arrow" :class="{ open: isOpen }" />
    </button>

    <ul v-if="isOpen" class="dropdown-menu">
      <li v-for="(option, index) in options" :key="index" @click="selectOption(option)" class="menuItem">
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.dropdown {
  position: relative;
  width: 30%;
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

.dropdown-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px 24px;
  font-size: 16px;
  text-align: left;
  color: $darkBlack;
  background: white;
  border: 1px solid $inputBorderColor;
  border-radius: 10px;
  cursor: pointer;
  outline: none;
  transition: box-shadow 0.3s ease 0s;

  @include respondXLarge {
    height: 50px;
    padding: 16px;
    font-size: 15px;
    border-radius: 7px;
  }

  @include respondLarge {
    height: 40px;
    padding: 16px 10px;
    font-size: 15px;
  }

  @include respondMedium {
    height: 30px;
  }

  &:hover,
  &:focus {
    box-shadow: 0px 0px 10px 2px rgba(34, 60, 80, 0.2);
  }
}

.dropdown-btn .arrow {
  color: $gray;
  transition: transform 0.3s;
}

.dropdown-btn .arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  width: 100%;
  padding: 5px;
  margin: 5px 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 15px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  list-style: none;

  @include respondXLarge {
    border-radius: 15px;
  }

  @include respondLarge {
    border-radius: 10px;
  }
}

.menuItem {
  padding: 10px;
  font-size: 16px;
  color: $darkBlack;
  cursor: pointer;

  @include respondXLarge {
    font-size: 15px;
  }

  @include respondLarge {
    font-size: 14px;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;

    @include respondLarge {
      border-radius: 6px 6px 0 0;
    }
  }

  &:last-child {
    border-radius: 0 0 8px 8px;

    @include respondLarge {
      border-radius: 0 0 6px 6px;
    }
  }

  &:hover {
    background: #f0f0f0;
  }
}
</style>
