/** Rol de cuenta en Firestore `users/{uid}`. Ver README_DATABASE.md §4. */
export type AccountRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: AccountRole;
}
