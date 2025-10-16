<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block">
        <span class="block text-sm mb-1">Name</span>
        <input
          type="text"
          v-model.trim="name"
          class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          required
        />
      </label>
      <label class="block">
        <span class="block text-sm mb-1">Color</span>
        <div class="flex items-center gap-2">
          <input
            type="color"
            v-model="color"
            class="h-9 w-12 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
          <input
            type="text"
            v-model.trim="color"
            class="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            placeholder="#AABBCC"
            pattern="#([0-9a-fA-F]{6})"
            required
          />
        </div>
      </label>
    </div>

    <label class="inline-flex items-center gap-2">
      <input type="checkbox" v-model="isAdmin" class="h-4 w-4" />
      <span class="text-sm">Administrator</span>
    </label>

    <div class="flex items-center gap-3">
      <button
        type="submit"
        class="rounded-md bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2 text-sm disabled:opacity-60"
        :disabled="submitting"
      >
        {{ submitting ? "Saving…" : "Add member" }}
      </button>
      <span v-if="message" :class="messageClass" class="text-sm">{{
        message
      }}</span>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useMembersStore } from "../../../stores/members";

const name = ref<string>("");
const color = ref<string>("#AABBCC");
const isAdmin = ref<boolean>(false);
const submitting = ref<boolean>(false);
const message = ref<string>("");

const messageClass = computed(() =>
  message.value.startsWith("Error")
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400",
);

const resetForm = () => {
  name.value = "";
  color.value = "#AABBCC";
  isAdmin.value = false;
  message.value = "";
};

const onSubmit = async () => {
  message.value = "";
  submitting.value = true;
  try {
    await $fetch("/api/members", {
      method: "POST",
      body: { name: name.value, color: color.value, isAdmin: isAdmin.value },
    });
    message.value = "Member added";
    window.dispatchEvent(new CustomEvent("members:added"));
    const memberStore = useMembersStore();
    memberStore.addMember({
      id: memberStore.members.length.toString(),
      name: name.value,
      color: color.value,
      isAdmin: isAdmin.value,
    });
    resetForm();
  } catch (e: any) {
    message.value = "Error: " + (e?.data?.message || e?.message || "unknown");
  } finally {
    submitting.value = false;
  }
};
</script>
