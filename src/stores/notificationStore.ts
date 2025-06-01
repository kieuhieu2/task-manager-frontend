import { defineStore } from 'pinia'
import { getMyNotifications } from '@/api/notificationApi.js'
import type { Notification } from '@/types/notification.js'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Notification[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchNotifications(userCode: string) {
      this.loading = true
      this.error = null
      try {
        this.notifications = await getMyNotifications(userCode)
      } catch (error: unknown) {
        if (error instanceof Error && 'response' in error) {
          const responseError = error as { response?: { data?: { message?: string } } }
          this.error = responseError.response?.data?.message || 'Không thể lấy danh sách thông báo'
        } else {
          this.error = 'Không thể lấy danh sách thông báo'
        }
      } finally {
        this.loading = false
      }
    },
  },
})
