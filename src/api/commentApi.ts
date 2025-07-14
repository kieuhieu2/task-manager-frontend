import axiosInstance from "./axiosInstance.ts";
import type { Comment } from '@/types/comment.ts';

export async function fetchComments(taskId: number): Promise<Comment[] | undefined> {
    try {
        const res = await axiosInstance.get(`/comments/${taskId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        return res.data.result;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Không thể lấy danh sách bình luận');
    }
}

export async function createComment(taskId: number, commentText: string): Promise<Comment> {
    try {
        const res = await axiosInstance.post(
            `/comments`,
            { taskId, commentText },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            },
        );

        return res.data.result;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Không thể tạo bình luận');
    }
}

export async function updateComment(commentId: number, commentText: string): Promise<void> {
  try {
    await axiosInstance.put(
      `/comments/${commentId}`,
      { commentText },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('Không thể sửa bình luận');
  }
}

export async function deleteComment(commentId: number): Promise<void> {
  try {
    await axiosInstance.delete(`/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('Không thể xóa bình luận');
  }
}

export async function addFileByCommentId(formData: FormData): Promise<Comment> {
  try {
    const response = await axiosInstance.post('/comments/add-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return response.data.result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Không thể tạo bình luận với tệp đính kèm');
  }
}
