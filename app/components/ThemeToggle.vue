<template>
  <button
    class="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
    @click="toggle"
    :aria-label="`Toggle theme (current: ${colorMode.value})`"
  >
    <span v-if="colorMode.value === 'dark'">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const toggle = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};
</script>
