<template>
  <div class="space-y-3">
    <form class="flex items-center gap-2" @submit.prevent="addTodo">
      <input
        v-model="draft"
        placeholder="Nueva tarea..."
        class="flex-1 rounded border px-3 py-1.5"
      />
      <button
        class="rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1.5"
      >
        Añadir
      </button>
    </form>
    <ul class="space-y-2 text-sm">
      <li v-for="t in todos" :key="t.id" class="flex items-center gap-2">
        <input type="checkbox" v-model="t.done" @change="toggle(t)" />
        <span :class="{ 'line-through opacity-60': t.done }">{{
          t.title
        }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
type Todo = { id: string; title: string; done: boolean };
const todos = ref<Todo[]>([]);
const draft = ref("");

onMounted(async () => {
  // TODO: fetch from /api/todos
  todos.value = [];
});

async function addTodo() {
  if (!draft.value.trim()) return;
  // TODO: send to /api/todos
  todos.value.unshift({
    id: Math.random().toString(36).slice(2),
    title: draft.value,
    done: false,
  });
  draft.value = "";
}

async function toggle(t: Todo) {
  // TODO: send PATCH to /api/todos/:id
}
</script>
