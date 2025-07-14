import { defineStore } from 'pinia';
import { fetchComments, createComment, updateComment, deleteComment, addFileByCommentId } from '../api/commentApi.ts';
import type { Comment } from '../types/comment.ts';

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

    async createComment(taskId: number, commentText: string) {
      this.loading = true
      this.error = null
      try {
        await createComment(taskId, commentText)
        // Reload comments after creating
        await this.fetchComments(taskId)
      } catch (error: unknown) {
        if (error instanceof Error && 'response' in error) {
          const responseError = error as { response?: { data?: { message?: string } } }
          this.error = responseError.response?.data?.message || 'Không thể tạo bình luận'
        } else {
          this.error = 'Không thể tạo bình luận'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateComment(commentId: number, commentText: string) {
      this.loading = true
      this.error = null
      try {
        await updateComment(commentId, commentText)
        // Update comment in local state
        if (this.comments) {
          const commentIndex = this.comments.findIndex((c: Comment) => c.commentId === commentId)
          if (commentIndex !== -1 && this.comments[commentIndex]) {
            this.comments[commentIndex].commentText = commentText
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && 'response' in error) {
          const responseError = error as { response?: { data?: { message?: string } } }
          this.error = responseError.response?.data?.message || 'Không thể cập nhật bình luận'
        } else {
          this.error = 'Không thể cập nhật bình luận'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteComment(commentId: number) {
      this.loading = true
      this.error = null
      try {
        await deleteComment(commentId)
        // Remove comment from local state
        if (this.comments) {
          this.comments = this.comments.filter((c: Comment) => c.commentId !== commentId)
        }
      } catch (error: unknown) {
        if (error instanceof Error && 'response' in error) {
          const responseError = error as { response?: { data?: { message?: string } } }
          this.error = responseError.response?.data?.message || 'Không thể xóa bình luận'
        } else {
          this.error = 'Không thể xóa bình luận'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async addFileByCommentId(formData: FormData) {
      this.loading = true;
      this.error = null;
      try {
        await addFileByCommentId(formData);

        // Get the taskId from formData to reload comments
        const taskId = formData.get('taskId');
        if (taskId) {
          await this.fetchComments(Number(taskId));
        }
      } catch (error: unknown) {
        if (error instanceof Error && 'response' in error) {
          const responseError = error as { response?: { data?: { message?: string } } };
          this.error = responseError.response?.data?.message || 'Không thể tạo bình luận với tệp đính kèm';
        } else {
          this.error = 'Không thể tạo bình luận với tệp đính kèm';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
})
