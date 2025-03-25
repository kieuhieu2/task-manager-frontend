import { ref } from 'vue';
import { post } from '@/utils/httpRequest.js';
import type { Ref } from 'vue';
import type { AuthenticationResponse } from '@/types/auth.js';


interface LoginForm {
  username: string;
  password: string;
}

interface ApiResponse<T> {
  code?: number;
  message?: string;
  result: T;
}

export function useLogin() {
  const form: Ref<LoginForm> = ref({
    username: '',
    password: '',
  });

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const handleLogin = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await post<ApiResponse<AuthenticationResponse>>(
        '/auth/token',
        {
          username: form.value.username,
          password: form.value.password,
        }
      );

      console.log('Đăng nhập thành công:', response);
      localStorage.setItem('token', response.result.token);

      form.value = { username: '', password: '' };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      console.error('Lỗi đăng nhập:', err);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    form,
    isLoading,
    error,
    handleLogin,
  };
}
