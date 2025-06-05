import axiosInstance from "./axiosInstance.ts";

export async function fetchComments(taskId: number): Promise<Comment[] | undefined> {
    try {
        const res = await axiosInstance.get(`/comments/${taskId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        return res.data.result;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách bình luận');
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
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Không thể tạo bình luận');
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
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể sửa bình luận');
  }
}

export async function deleteComment(commentId: number): Promise<void> {
  try {
    await axiosInstance.delete(`/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể xóa bình luận');
  }
}
