export type RegisterRequest  = {
  email: string;
  password: string;
  username: string;
  first_name?: string;
  last_name?: string;
}