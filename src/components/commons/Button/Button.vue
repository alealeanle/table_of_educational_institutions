<script setup>
import { computed } from 'vue';
import s from './Button.module.scss';

const props = defineProps({
  type: {
    type: String,
    default: 'primary',
  },
});

const emit = defineEmits(['click']);

const buttonClass = computed(() => ({
  [s.btn]: true,
  [s.btnPrimary]: props.type === 'primary',
  [s.btnSecondary]: props.type === 'secondary',
  [s.btnAccent]: props.type === 'accent',
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

<style />
