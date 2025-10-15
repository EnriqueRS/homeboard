<template>
  <div
    class="min-h-dvh bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors"
  >
    <header
      class="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur"
    >
      <div class="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
        <h1 class="font-semibold">Frascuelo</h1>
        <div class="ml-auto flex items-center gap-2">
          <MemberSelect />
          <ThemeToggle />
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-6">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
// empty for now
</script>
