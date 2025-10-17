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

  // Debug logging
  console.log('User flow: Checking redirect for user:', {
    userId: user.id,
    quizCompleted: user.quizCompleted,
    quizCompletedAt: user.quizCompletedAt
  })

  // All authenticated users go to user-profile
  // The skin-quiz is accessible from the profile page
  console.log('User flow: Redirecting authenticated user to user-profile')
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
  console.log('User flow: New user signup, redirecting to skin-quiz')
  return '/skin-quiz'
}

/**
 * Checks if a user is a new user (hasn't completed the quiz)
 * @param user - The authenticated user object
 * @returns True if the user is new (hasn't completed quiz), false otherwise
 */
export function isNewUser(user: User | null): boolean {
  return user ? !user.quizCompleted : false
}

/**
 * Checks if a user is a returning user (has completed the quiz)
 * @param user - The authenticated user object
 * @returns True if the user is returning (has completed quiz), false otherwise
 */
export function isReturningUser(user: User | null): boolean {
  return user ? !!user.quizCompleted : false
}
