<template>
  <div>
    <ul class="space-y-2 text-sm">
      <li
        v-for="e in paginatedEvents"
        :key="e.id"
        class="flex items-center gap-2"
      >
        <span
          :style="{ backgroundColor: e.color }"
          class="w-2 h-2 rounded-full"
        ></span>
        <div
          class="rounded-lg px-3 py-2 flex-1 min-w-0 flex flex-col items-start shadow-sm bg-gray-50 dark:bg-slate-800 transition-colors"
        >
          <div class="text-xs opacity-70 mb-1">
            {{
              new Date(e.startsAt)
                .toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
                .replace(".", "") +
              " · " +
              new Date(e.startsAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }) +
              "h"
            }}
          </div>
          <div class="flex flex-row gap-2 w-full">
            <div class="basis-64 font-medium text-sm flex-1">{{ e.title }}</div>
            <div class="basis-128 flex gap-1 flex-wrap ml-auto">
              <template v-for="(p, idx) in e.participants" :key="idx">
                <span
                  v-if="p.member"
                  class="text-xs px-2 py-0.5 rounded-full font-medium truncate"
                  :style="{
                    backgroundColor: p.member.color,
                    color: getContrastColor(p.member.color),
                  }"
                >
                  {{ p.member.name }}
                </span>
              </template>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <!-- Pagination Controls -->
    <div class="flex justify-between items-center mt-4">
      <button
        :disabled="currentPage === 1"
        @click="prevPage"
        class="flex items-center justify-center w-8 h-8 rounded-full border px-3 py-1.5 text-sm border rounded"
      >
        <!-- Heroicon for "Previous" -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>
      <span class="text-xs opacity-70"
        >{{ currentPage }} / {{ totalPages }}</span
      >
      <button
        class="flex items-center justify-center w-8 h-8 rounded-full border px-3 py-1.5 text-sm border rounded"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        <!-- Heroicon for "Next" -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

type Upcoming = {
  id: string;
  title: string;
  startsAt: string;
  color: string;
  participants: { member: { name: string; color: string } }[];
};

const events = ref<Upcoming[]>([]);
const currentPage = ref(1);
const itemsPerPage = 5;

// Computed property to calculate paginated events
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return events.value.slice(start, end);
});

// Computed property to calculate total pages
const totalPages = computed(() =>
  Math.ceil(events.value.length / itemsPerPage),
);

// Pagination methods
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// Fetch events on component mount
onMounted(async () => {
  events.value = await $fetch<Upcoming[]>("/api/events");
});

function getContrastColor(color: string): string {
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "black" : "white";
}
</script>
