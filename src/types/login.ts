export interface LoginForm {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  code?: number;
  message?: string;
  result: T;
}
