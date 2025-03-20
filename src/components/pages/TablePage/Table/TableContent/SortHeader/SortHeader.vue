<script setup>
const props = defineProps({
  label: String,
  field: String,
  sortColumn: String,
  sortOrder: Number,
  s: Object,
});

const emit = defineEmits(['updateSort']);

const onSort = () => {
  emit('updateSort', props.field);
};
</script>

<template>
  <th :class="[s.headCell]" @click="onSort">
    <div :class="s.thContent">
      {{ props.label }}
      <span :class="[s.sortWrap, { [s.active]: props.sortColumn === props.field }]">
        <img
          :src="require('@/assets/svg/Sort.svg')"
          alt="Sort"
          tabindex="0"
          @keyup.enter="onSort"
          :class="[s.sort, { [s.rotated]: props.sortColumn === props.field && props.sortOrder === -1 }]"
        />
      </span>
    </div>
  </th>
</template>

<style />
