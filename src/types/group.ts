export interface Group {
  groupId: number
  nameOfGroup: string
  descriptionOfGroup: string
}

export interface ApiGroupResponse {
  code: number
  message: string
  result: Group[]
}
