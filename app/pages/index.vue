<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <draggable
      v-model="cards"
      item-key="key"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 col-span-full"
      :component-data="{ class: 'contents' }"
    >
      <template #item="{ element }">
        <section
          :key="element.key"
          class="col-span-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
        >
          <h2 class="mb-3 font-semibold">{{ element.title }}</h2>
          <component :is="element.component" />
        </section>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";

type Card = { key: string; title: string; component: any };

const registry = {
  calendar: defineAsyncComponent(
    () => import("@/components/cards/CalendarCard.vue"),
  ),
  upcoming: defineAsyncComponent(
    () => import("@/components/cards/UpcomingEventsCard.vue"),
  ),
  board: defineAsyncComponent(() => import("@/components/cards/BoardCard.vue")),
  todo: defineAsyncComponent(() => import("@/components/cards/TodoCard.vue")),
  admin: defineAsyncComponent(() => import("@/components/cards/AdminCard.vue")),
} as const;

type CardKey = keyof typeof registry;

const defaultOrder: CardKey[] = ["calendar", "upcoming", "board", "todo"];
const order = ref<CardKey[]>([]);
const cards = computed<Card[]>(() =>
  order.value.map((k) => ({
    key: k,
    title: titles[k],
    component: registry[k],
  })),
);

const titles: Record<CardKey, string> = {
  calendar: "Calendario",
  upcoming: "Próximos eventos",
  board: "Board",
  todo: "To-Do",
  admin: "Administración",
};

onMounted(() => {
  const saved = localStorage.getItem("homeboard:cardOrder");
  order.value = saved ? JSON.parse(saved) : defaultOrder;

  // Append admin card for admins
  const isAdmin = localStorage.getItem("homeboard:isAdmin") === "true";
  if (isAdmin && !order.value.includes("admin")) {
    order.value = [...order.value, "admin"];
  }

  const handleMemberChanged = () => {
    const nowIsAdmin = localStorage.getItem("homeboard:isAdmin") === "true";
    if (nowIsAdmin && !order.value.includes("admin")) {
      order.value = [...order.value, "admin"];
    } else if (!nowIsAdmin && order.value.includes("admin")) {
      order.value = order.value.filter((k) => k !== "admin");
    }
  };
  const handleMemberAdded = () => {
    const nowIsAdmin = localStorage.getItem("homeboard:isAdmin") === "true";
    if (nowIsAdmin && !order.value.includes("admin")) {
      order.value = [...order.value, "admin"];
    }
  };
  window.addEventListener("member:changed", handleMemberChanged);
  onBeforeUnmount(() =>
    window.removeEventListener("member:changed", handleMemberChanged),
  );
  window.addEventListener("members:added", handleMemberAdded);
  onBeforeUnmount(() =>
    window.removeEventListener("members:added", handleMemberAdded),
  );
});

watch(
  order,
  (v) => {
    localStorage.setItem("homeboard:cardOrder", JSON.stringify(v));
  },
  { deep: true },
);
</script>
