<template>
  <div class="space-y-3">
    <form class="flex items-center gap-2" @submit.prevent="addPost">
      <input
        v-model="draft"
        placeholder="Escribe algo..."
        class="flex-1 rounded border px-3 py-1.5"
      />
      <button
        class="rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1.5"
      >
        Publicar
      </button>
    </form>
    <ul class="space-y-2 text-sm">
      <li v-for="p in posts" :key="p.id" class="rounded border p-2">
        {{ p.content }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
type Post = { id: string; content: string };
const posts = ref<Post[]>([]);
const draft = ref("");

async function addPost() {
  if (!draft.value.trim()) return;
  // TODO: send to /api/posts
  posts.value.unshift({
    id: Math.random().toString(36).slice(2),
    content: draft.value,
  });
  draft.value = "";
}
</script>
