
export interface ApiResponse<T = unknown> {
  code: number;
  result?: T;
  message?: string;
}
