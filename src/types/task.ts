export interface Task {
  taskId: number;
  title: string;
  description: string;
  percentDone: number;
  userId: string;
  groupId: number;
  state: TaskState;
}

export enum TaskState {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  SPAM = "SPAM"
}
