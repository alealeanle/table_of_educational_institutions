<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'primary',
  },
});

const emit = defineEmits(['click']);

const buttonClass = computed(() => ({
  btn: true,
  'btn-primary': props.type === 'primary',
  'btn-secondary': props.type === 'secondary',
  'btn-accent': props.type === 'accent',
}));

const handleClick = () => {
  emit('click');
};
</script>

<template>
  <button :class="buttonClass" @click="handleClick">
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
.btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 56px;
  padding: 16px 24px;
  font-size: 16px;
  line-height: 130%;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease 0s;

  @include respondXLarge {
    height: 50px;
    padding: 16px 20px;
    font-size: 15px;
  }

  @include respondLarge {
    width: 100px;
    height: 40px;
    padding: 16px;
    font-size: 14px;
    border-radius: 8px;
  }

  @include respondMedium {
    height: 34px;
  }
}

.btn-accent {
  background-color: $lightGreen;

  @media (any-hover: hover) {
    &:hover {
      background-color: $green;
    }
  }

  &:focus {
    outline: none;
    background-color: $green;
  }

  &:active {
    background-color: $darkGreen;
  }
}

.btn-primary {
  color: $bgColor;
  background-color: $darkBlack;

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

.btn-secondary {
  background-color: transparent;
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
</style>
