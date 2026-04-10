import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { RecentActivityItem } from '../types/activity'

const STORAGE_KEY = 'recent-activity'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref<RecentActivityItem[]>([])

  const loadActivities = () => {
    const savedActivities = localStorage.getItem(STORAGE_KEY)

    if (!savedActivities) {
      activities.value = []
      return
    }

    try {
      activities.value = JSON.parse(savedActivities) as RecentActivityItem[]
    } catch {
      activities.value = []
    }
  }

  const saveActivities = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities.value))
  }

  const addActivity = (title: string, description: string) => {
    const newActivity: RecentActivityItem = {
      id: crypto.randomUUID(),
      title,
      description,
      timestamp: new Date().toISOString(),
    }

    activities.value = [newActivity, ...activities.value].slice(0, 3)
    saveActivities()
  }

  const clearActivities = () => {
    activities.value = []
    saveActivities()
  }

  const recentActivities = computed(() => activities.value)

  return {
    activities,
    recentActivities,
    loadActivities,
    addActivity,
    clearActivities,
  }
})