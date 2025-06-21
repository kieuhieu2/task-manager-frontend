export interface Task {
  taskId: number;
  title: string;
  description: string;
  percentDone: number;
  userId: string;
  groupId: number;
  state: TaskState;
  fileUrl?: string
  fileType?: string
  isCreator?: boolean
  deadline?: string
  taskType?: string
}

export enum TaskState {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  SPAM = "SPAM"
}
