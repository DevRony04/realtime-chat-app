export interface AuthUser {
  $id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}
