import { get } from './axiosInstance.js'
import type { Notification } from '@/types/notification.js'

export async function getMyNotifications(userCode: string): Promise<Notification[]> {
  try {
    const res = await get<{ result: Notification[] }>(`/notification/${userCode}`, {})
    return res.result
  } catch (error: unknown) {
    if (error instanceof Error && 'response' in error) {
      const responseError = error as { response?: { data?: { message?: string } } }
      throw new Error(responseError.response?.data?.message || 'Không thể lấy danh sách thông báo')
    }
    throw new Error('Không thể lấy danh sách thông báo')
  }
}
