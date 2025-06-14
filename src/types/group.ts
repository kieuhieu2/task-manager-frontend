export interface Group {
  groupId: number
  nameOfGroup: string
  descriptionOfGroup: string
  isLeader: boolean
}

export interface ApiGroupResponse {
  code: number
  message: string
  result: Group[]
}

export interface GroupCreate {
  nameOfGroup: string;
  faculty: string;
  department: string;
  memberCodes: string[];
  leaderCodes: string[];
  descriptionOfGroup: string;
}

export interface GroupMember {
  userCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
}

export interface ApiGroupMemberResponse {
  code: number;
  message: string;
  result: GroupMember[];
}
