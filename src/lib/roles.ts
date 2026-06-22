export enum UserRole {
  ADMIN = "admin",
  FINANCIAL = "financial",
  MEMBER = "member",
  VIEWER = "viewer",
}

/**
 * Extract role from Supabase user metadata.
 * The role is expected to be stored in the `role` field of `user.user_metadata`.
 */
export const getUserRole = (user: any): UserRole => {
  const raw = user?.user_metadata?.role ?? "viewer";
  switch (String(raw).toLowerCase()) {
    case "admin":
      return UserRole.ADMIN;
    case "financial":
      return UserRole.FINANCIAL;
    case "member":
      return UserRole.MEMBER;
    default:
      return UserRole.VIEWER;
  }
};
