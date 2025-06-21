import { defineStore } from 'pinia'
import { getMyNotifications, markNotificationAsRead } from '@/api/notificationApi.js'
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

    async markAsRead(notificationId: number) {
      try {
        await markNotificationAsRead(notificationId)
        // Cập nhật trạng thái local
        const notification = this.notifications.find(n => n.notificationId === notificationId)
        if (notification) {
          notification.wasRead = true
        }
      } catch (error: unknown) {
        if (error instanceof Error && 'response' in error) {
          const responseError = error as { response?: { data?: { message?: string } } }
          this.error = responseError.response?.data?.message || 'Không thể đánh dấu thông báo đã đọc'
        } else {
          this.error = 'Không thể đánh dấu thông báo đã đọc'
        }
      }
    },
  },
})
