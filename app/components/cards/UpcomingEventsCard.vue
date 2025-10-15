<template>
  <ul class="space-y-2 text-sm">
    <li v-for="e in events" :key="e.id" class="flex items-center gap-2">
      <span
        :style="{ backgroundColor: e.color }"
        class="w-2 h-2 rounded-full"
      ></span>
      <div class="rounded-lg px-3 py-2 flex-1 min-w-0 flex flex-col items-start shadow-sm bg-gray-50 dark:bg-slate-800 transition-colors">
        <div class="text-xs opacity-70 mb-1">
          {{
            new Date(e.startsAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '') + ' · ' +
            new Date(e.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) + 'h'
          }}
        </div>
        <div class="flex items-center gap-2 w-full">
          <div class="font-medium text-sm truncate flex-1">{{ e.title }}</div>
          <div class="flex gap-1 items-center flex-wrap ml-auto">
            <template v-for="(p, idx) in e.participants" :key="idx">
              <span
                v-if="p.member"
                class="text-xs px-2 py-0.5 rounded-full font-medium truncate"
                :style="{
                  backgroundColor: p.member.color,
                  color: getContrastColor(p.member.color)
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
</template>

<script setup lang="ts">
type Upcoming = { id: string; title: string; startsAt: string; color: string; participants: { member: { name: string; color: string } }[] };
const events = ref<Upcoming[]>([]);

function getContrastColor(color: string): string {
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? 'black' : 'white';
}

onMounted(async () => {
  events.value = await $fetch<Upcoming[]>("/api/events");
});
</script>
