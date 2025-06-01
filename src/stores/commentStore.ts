import { defineStore } from 'pinia';
import { fetchComments } from '@/api/commentApi.ts';

export const useCommentsStore = defineStore('comments', {
  state: () => ({
    comments: [] as Comment[] | undefined,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchComments(taskId: number) {
      this.loading = true
      this.error = null
      try {
        this.comments = await fetchComments(taskId)
      } catch (error: unknown) {
        if (error instanceof Error && 'response' in error) {
          const responseError = error as { response?: { data?: { message?: string } } }
          this.error = responseError.response?.data?.message || 'Không thể lấy danh sách bình luận'
        } else {
          this.error = 'Không thể lấy danh sách bình luận'
        }
      } finally {
        this.loading = false
      }
    },
  },
})
