<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <button class="px-2 py-1 border rounded" @click="prevMonth">←</button>
      <div class="font-medium">{{ format(currentMonth, "MMMM yyyy") }}</div>
      <button class="px-2 py-1 border rounded" @click="nextMonth">→</button>
    </div>
    <div class="grid grid-cols-7 gap-1 text-xs">
      <div v-for="d in weekDays" :key="d" class="text-center font-medium py-1">
        {{ d }}
      </div>
      <div
        v-for="cell in days"
        :key="cell.key"
        :class="[
          'h-16 border rounded relative overflow-hidden',
          cell.isPlaceholder ? 'bg-transparent opacity-40' : 'cursor-pointer',
        ]"
        :style="cell.isPlaceholder ? '' : ''"
        @click="!cell.isPlaceholder && openCreate(cell.date)"
      >
        <template v-if="!cell.isPlaceholder">
          <!-- stripes background when multiple colors -->
          <div
            v-if="cell.bgStyle"
            class="absolute inset-0"
            :style="cell.bgStyle"
          ></div>
          <div
            class="absolute top-1 left-1 text-[10px] opacity-70"
            :class="{ 'ring-2 ring-blue-500 rounded-sm': isToday(cell.date) }"
          >
            {{ cell.date.getDate() }}
          </div>
          <div class="absolute inset-x-1 bottom-1 flex gap-1 flex-wrap">
            <span
              v-for="c in cell.colors"
              :key="c"
              :style="{ backgroundColor: c }"
              class="w-2 h-2 rounded-full"
            ></span>
          </div>
        </template>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-lg p-4 w-full max-w-sm shadow-xl"
      >
        <div class="text-sm mb-3 font-medium">
          Eventos — {{ format(selectedDate, "dd MMMM yyyy") }}
        </div>
        <div v-if="selectedDayEvents.length" class="mb-3 space-y-2">
          <div class="text-xs opacity-80">Selecciona para editar</div>
          <div
            v-for="ev in selectedDayEvents"
            :key="ev.id"
            class="flex items-center justify-between gap-2 border rounded px-2 py-1"
          >
            <button class="text-left text-sm flex-1" @click="beginEdit(ev)">
              {{ ev.title }}
            </button>
            <div class="flex gap-1">
              <span
                v-for="p in ev.participants"
                :key="p.member.id"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :style="{
                  backgroundColor: hexToPastel(p.member.color),
                  color: '#222',
                }"
              >
                <span
                  class="w-2 h-2 inline-block rounded-full mr-1"
                  :style="{ backgroundColor: p.member.color }"
                ></span>
                {{ p.member.name }}
              </span>
            </div>
          </div>
          <div class="text-right">
            <button
              class="mt-1 text-xs underline"
              @click="openCreate(selectedDate)"
            >
              Nuevo
            </button>
          </div>
        </div>
        <div class="space-y-3">
          <input
            v-model="form.title"
            type="text"
            placeholder="Título del evento"
            class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          />
          <div>
            <label class="block text-xs mb-1 opacity-80">
              Hora de inicio (opcional)
            </label>
            <input
              v-model="form.startsAt"
              type="time"
              class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              placeholder="Hora de inicio"
              step="60"
            />
          </div>
          <div>
            <label class="block text-xs mb-1 opacity-80"
              >Miembros (opcional)</label
            >
            <div class="flex flex-wrap gap-1 mb-2">
              <span
                v-for="m in members"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer"
                :style="{
                  backgroundColor: form.memberIds.includes(m.id)
                    ? m.color
                    : hexToPastel(m.color),
                  color: '#222',
                }"
                @click="
                  () => {
                    const idx = form.memberIds.indexOf(m.id);
                    if (idx === -1) {
                      form.memberIds.push(m.id);
                    } else {
                      form.memberIds.splice(idx, 1);
                    }
                  }
                "
              >
                <span
                  class="w-2 h-2 rounded-full mr-1"
                  :style="{ backgroundColor: m.color }"
                ></span>
                {{ m.name }}
                <button
                  v-if="form.memberIds.includes(m.id)"
                  type="button"
                  class="ml-1 text-xs text-gray-700 hover:text-red-500 focus:outline-none"
                  @click="
                    () => {
                      const idx = form.memberIds.indexOf(m.id);
                      if (idx !== -1) {
                        form.memberIds.value.splice(idx, 1);
                      }
                    }
                  "
                  aria-label="Quitar"
                >
                  &times;
                </button>
              </span>
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-between items-center gap-2">
          <button
            class="px-3 py-1.5 text-sm border rounded"
            @click="closeModal"
          >
            Cerrar
          </button>
          <div class="flex items-center gap-2">
            <span v-if="editingEventId" class="text-xs opacity-70"
              >Editando</span
            >
            <button
              class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded"
              @click="saveEvent"
              :disabled="!form.title"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  isSameDay,
  addDays,
  getDay,
} from "date-fns";
import { storeToRefs } from "pinia";
import { useMembersStore, type Member } from "../../../stores/members";

type EventParticipant = { member: Member };
type EventItem = {
  id: string;
  title: string;
  startsAt: string;
  allDay: boolean;
  participants: EventParticipant[];
};

// removed single MemberSelect usage for a local multi-select

const membersStore = useMembersStore();
const { members } = storeToRefs(membersStore);

const currentMonth = ref(new Date());
const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

const events = ref<EventItem[]>([]);

const days = computed(() => {
  const start = startOfMonth(currentMonth.value);
  const end = endOfMonth(currentMonth.value);
  const monthDays = eachDayOfInterval({ start, end });

  // weekday index with Monday=0 .. Sunday=6
  const jsDay = getDay(start); // 0=Sunday..6=Saturday
  const mondayIndex = (jsDay + 6) % 7; // shift so Monday=0

  const cells: Array<{
    key: string;
    isPlaceholder: boolean;
    date: Date;
    colors: string[];
    bgStyle?: string;
  }> = [];

  // leading placeholders before the 1st of month
  for (let i = 0; i < mondayIndex; i++) {
    const d = addDays(start, -(mondayIndex - i));
    cells.push({
      key: `p-${d.toISOString()}`,
      isPlaceholder: true,
      date: d,
      colors: [],
    });
  }

  // real month days
  for (const date of monthDays) {
    const cell = {
      key: date.toISOString(),
      isPlaceholder: false,
      date,
      colors: [] as string[],
      bgStyle: "" as string | undefined,
    };
    const dayEvents = (events.value as EventItem[]).filter((e: EventItem) =>
      isSameDay(new Date(e.startsAt), date),
    );
    const colors = Array.from(
      new Set(
        dayEvents.flatMap((e: EventItem) =>
          e.participants.map((p: EventParticipant) => p.member.color),
        ),
      ),
    ) as string[];
    cell.colors = colors;
    if (colors.length === 1) {
      const onlyColor = colors[0] as string;
      cell.bgStyle = `background: ${hexToPastel(onlyColor)}`;
    } else if (colors.length > 1) {
      const stripes = colors
        .map(
          (c: string, i: number) =>
            `${hexToPastel(c)} ${(i * 100) / colors.length}% ${((i + 1) * 100) / colors.length}%`,
        )
        .join(", ");
      cell.bgStyle = `background: repeating-linear-gradient(45deg, ${stripes})`;
    }
    cells.push(cell);
  }

  return cells;
});

function prevMonth() {
  currentMonth.value = addMonths(currentMonth.value, -1);
}
function nextMonth() {
  currentMonth.value = addMonths(currentMonth.value, 1);
}

function isToday(d: Date) {
  return isSameDay(d, new Date());
}

// modal state
const showModal = ref(false);
const selectedDate = ref<Date>(new Date());
const form = reactive({
  title: "" as string,
  memberIds: [] as string[],
  startsAt: "" as string,
});
const editingEventId = ref<string | null>(null);

function openCreate(date: Date) {
  selectedDate.value = date;
  form.title = "";
  editingEventId.value = null;
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
}

async function saveEvent() {
  if (editingEventId.value) {
    const payload = { title: form.title, memberIds: form.memberIds };
    await $fetch(`/api/events/${editingEventId.value}` as any, {
      title: form.title,
      method: "PUT",
      date: format(selectedDate.value, "yyyy-MM-dd 'T'") + (form.startsAt || "00:00"),
      body: payload,
    });
  } else {
    const payload = {
      title: form.title,
      date: format(selectedDate.value, "yyyy-MM-dd 'T'") + (form.startsAt || "00:00"),
      memberIds: form.memberIds,
    };
    await $fetch("/api/events", { method: "POST", body: payload });
  }
  showModal.value = false;
  await loadMonthEvents();
}

async function loadMonthEvents() {
  const start = startOfMonth(currentMonth.value).toISOString();
  const end = endOfMonth(currentMonth.value).toISOString();
  events.value = await $fetch<EventItem[]>(
    `/api/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
  );
}

watch(
  currentMonth,
  () => {
    loadMonthEvents();
  },
  { immediate: true },
);

function hexToPastel(hex: string): string {
  // lighten hex color toward white for pastel background
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const blend = (v: number) => Math.round(v + (255 - v) * 0.7); // 70% toward white
  const rr = blend(r).toString(16).padStart(2, "0");
  const gg = blend(g).toString(16).padStart(2, "0");
  const bb = blend(b).toString(16).padStart(2, "0");
  return `#${rr}${gg}${bb}`;
}
const selectedDayEvents = computed<EventItem[]>(() => {
  return (events.value as EventItem[]).filter((e: EventItem) =>
    isSameDay(new Date(e.startsAt), selectedDate.value),
  );
});

function beginEdit(ev: EventItem) {
  editingEventId.value = ev.id;
  form.title = ev.title;
  form.memberIds = ev.participants.map(
    (p: EventParticipant) => p.member.id as string,
  );
}
</script>
