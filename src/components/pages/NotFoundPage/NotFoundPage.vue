<script setup></script>

<template>
  <div class="root">
    <h1 class="title">Oops!</h1>
    <p class="text">404 page not found</p>
  </div>
</template>

<style lang="scss" scoped>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  gap: 5vh;
}

.title {
  font-size: 48px;
  font-weight: 700;
  color: $errorColor;
}

.text {
  font-size: 18px;
  color: $gray;
}
</style>
