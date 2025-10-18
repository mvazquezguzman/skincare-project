import { User } from '@/contexts/AuthContext'

/**
 * Determines the appropriate redirect path for a user based on their quiz completion status
 * @param user - The authenticated user object
 * @returns The path to redirect the user to
 */
export function getUserRedirectPath(user: User | null): string {
  if (!user) {
    return '/auth/signin'
  }

  // All authenticated users go to user-profile
  // The skin-quiz is accessible from the profile page
  return '/user-profile'
}

/**
 * Determines the redirect path for new users during signup
 * @param user - The authenticated user object
 * @returns The path to redirect the new user to
 */
export function getNewUserRedirectPath(user: User | null): string {
  if (!user) {
    return '/auth/signin'
  }

  // New users should be directed to skin-quiz
  return '/skin-quiz'
}

