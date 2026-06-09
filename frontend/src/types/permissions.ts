export interface Permission {
  code: string;
  description: string | null;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface UserPermissions {
  permissions: string[];
  roles: Role[];
}
