<script setup></script>

<template>
  <div class="loaderOverlay">
    <div class="spinner"></div>
  </div>
</template>

<style lang="scss" scoped>
.loaderOverlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 100px;
  background: rgba(255, 255, 255, 0.4);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-top: 5px solid $lightGreen;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
