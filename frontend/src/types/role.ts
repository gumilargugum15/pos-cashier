export type Role = {
  id: number;
  name: string;
  permissions: string[];
  users_count: number | null;
  created_at: string;
};
