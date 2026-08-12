export interface AdminSession {
  email: string;
  userId: string;
}

export interface LoginActionState {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
}
