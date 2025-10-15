import { defineStore } from 'pinia'

export type Member = { id: string; name: string; color: string; isAdmin: boolean }

interface MembersState {
  members: Member[]
  selectedMemberId: string
  isLoading: boolean
  error: string | null
}

export const useMembersStore = defineStore('members', {
  state: (): MembersState => ({
    members: [],
    selectedMemberId: '',
    isLoading: false,
    error: null
  }),
  getters: {
    selectedMember(state): Member | undefined {
      return state.members.find(m => m.id === state.selectedMemberId)
    },
    isAdmin(state): boolean {
      const member = state.members.find(m => m.id === state.selectedMemberId)
      return member?.isAdmin ?? false
    }
  },
  actions: {
    async loadMembers(): Promise<void> {
      try {
        this.isLoading = true
        this.error = null
        const data = await $fetch<Member[]>('/api/members')
        this.members = data
        // Ensure selectedMemberId stays valid
        if (this.selectedMemberId && !this.members.some(m => m.id === this.selectedMemberId)) {
          this.selectedMemberId = ''
        }
        this.persistToLocalStorage()
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to load members'
      } finally {
        this.isLoading = false
      }
    },
    initializeFromLocalStorage(): void {
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('homeboard:memberId') : null
      this.selectedMemberId = storedId ?? ''
    },
    setSelectedMember(id: string): void {
      this.selectedMemberId = id
      this.persistToLocalStorage()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('member:changed'))
      }
    },
    persistToLocalStorage(): void {
      if (typeof window === 'undefined') return
      localStorage.setItem('homeboard:memberId', this.selectedMemberId)
      localStorage.setItem('homeboard:isAdmin', this.isAdmin ? 'true' : 'false')
    }
  }
})


