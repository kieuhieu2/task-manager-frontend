import { defineStore } from 'pinia';
import { fetchComments, createComment, updateComment, deleteComment, getCommentFile } from '../api/commentApi.ts';
import type { Comment } from '../types/comment.ts';

export const useCommentsStore = defineStore('comments', {
  state: () => ({
    comments: [] as Comment[] | undefined,
    loading: false,
    error: null as string | null,
    commentFiles: new Map<number, { fileUrl: string; fileName: string; fileType?: string }>()
  }),
  getters: {
    getFileUrl: (state) => (commentId: number) => {
      return state.commentFiles.get(commentId)?.fileUrl || undefined;
    },
    getFileName: (state) => (commentId: number) => {
      return state.commentFiles.get(commentId)?.fileName || 'Tệp đính kèm';
    },
    getFileType: (state) => (commentId: number) => {
      return state.commentFiles.get(commentId)?.fileType || undefined
    }
  },
  actions: {
    async fetchComments(taskId: number) {
      this.loading = true
      this.error = null
      try {
        this.comments = await fetchComments(taskId)
        if (this.comments) {
          this.comments = this.comments.map(comment => ({
            ...comment,
            taskId: taskId
          }));

          for (const comment of this.comments) {
              await this.fetchCommentFile(taskId, comment.commentId)
          }
        }
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

    async createComment(taskId: number, commentText: string, file?: File) {
      this.loading = true
      this.error = null
      try {
        await createComment(taskId, commentText, file)
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
        // Remove any stored file for this comment
        this.commentFiles.delete(commentId)
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

    async fetchCommentFile(taskId: number, commentId: number) {
      try {
        const fileData = await getCommentFile(taskId, commentId)

        if (fileData?.fileUrl) {
          // Ghi lại file vào Map theo commentId
          this.commentFiles.set(commentId, {
            fileUrl: fileData.fileUrl,
            fileName: fileData.fileName || 'Tệp đính kèm',
            fileType: fileData.fileType
          })
        }
      } catch (error) {
        console.warn(`Không thể tải file đính kèm cho comment ${commentId}`, error)
      }
    }

  }
})
