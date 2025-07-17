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

export async function createComment(taskId: number, commentText: string, commentFile?: File): Promise<Comment> {
    try {
        if (commentFile) {
            const formData = new FormData();
            formData.append('taskId', taskId.toString());
            formData.append('commentText', commentText);
            formData.append('commentFile', commentFile);

            const res = await axiosInstance.post('/comments', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            return res.data.result;
        } else {
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
        }
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

export async function getCommentFile(taskId: number, commentId: number): Promise<{ fileUrl: string; fileType?: string; fileName?: string }> {
  try {

    const response = await axiosInstance.get(`/comments/file/${taskId}/${commentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      responseType: 'blob',
    });

    const contentDisposition = response.headers['content-disposition'];
    const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+?)"/);
    const filename = filenameMatch ? filenameMatch[1] : `downloaded_file`;

    // Extract the file type from the filename
    const fileType = filename.split('.').pop() || 'unknown';

    // Create a Blob URL for the file
    const fileUrl = URL.createObjectURL(response.data);

    return {
      fileUrl,
      fileType,
      fileName: filename,
    };

  } catch (error: unknown) {
    console.error('Error in getCommentFile API:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Không thể tải file đính kèm');
  }
}
