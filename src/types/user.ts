export interface Role {
  name: string;
  description: string;
  permissions: string[];
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  dob: string;
  code: string;
  roles: Role[];
}
