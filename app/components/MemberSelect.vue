<template>
  <select
    class="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm"
    v-model="selectedId"
    @change="persist"
  >
    <option :value="''">Seleccione miembro…</option>
    <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
  </select>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMembersStore, type Member } from '../../stores/members'

const membersStore = useMembersStore()
const { members, selectedMemberId } = storeToRefs(membersStore)

const selectedId = selectedMemberId

const persist = () => {
  membersStore.setSelectedMember(selectedId.value)
}

onMounted(async () => {
  membersStore.initializeFromLocalStorage()
  await membersStore.loadMembers()
})
</script>
