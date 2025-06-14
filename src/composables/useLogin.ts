import { ref } from "vue";
import { useRouter } from "vue-router";
import { post } from "@/api/axiosInstance.js";
import type { Ref } from "vue";
import type { AuthenticationResponse, TokenPayload } from "@/types/auth.js";
import { jwtDecode } from "jwt-decode";
import axios from 'axios'
import { useTaskStore } from "@/stores/taskStore.js";
import { useGetMyGroupsStore } from '@/stores/groupsStore.ts'
import { useNotificationStore } from '@/stores/notificationStore.ts'

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

  const router = useRouter();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const login = async () => {
    isLoading.value = true;
    error.value = null;
    localStorage.setItem("username", form.value.username);
    try {

      const response = await axios.post<{ result: AuthenticationResponse }>(
        "http://localhost:8080/auth/token",
        { username: form.value.username,
          password: form.value.password },
      );

      console.log("Đăng nhập thành công:", response.data);
      localStorage.setItem("token", response.data.result.token);
      const payload = jwtDecode<TokenPayload>(response.data.result.token);
      localStorage.setItem("role", payload.scope);
      localStorage.setItem("userCode", payload.sub);

      router.push("/get-my-groups");

    } catch (err: any) {
      error.value =
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      console.error("Lỗi đăng nhập:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Additional method for logout (for reusability)
  const logout = () => {
    const taskStore = useTaskStore();
    const notificationStore = useNotificationStore();
    const useGetMyGroupsStore = useNotificationStore();

    localStorage.clear();
    taskStore.$reset();
    notificationStore.$reset();
    useGetMyGroupsStore.$reset()
    router.push("/login");
  };

  const resetForm = () => {
    form.value = { username: "", password: "" };
    error.value = null;
    isLoading.value = false;
  };

  return {
    form,
    isLoading,
    error,
    login,
    logout,
    resetForm,
  };
}
