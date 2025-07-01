export interface Comment {
  commentId: number
  taskId: number
  userCode: string
  userName: string
  commentText: string
  createdAt?: string
  updatedAt?: string
}
