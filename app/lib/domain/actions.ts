/**
 * Standardized response type for all Server Actions.
 * This ensures no 'any' is used and frontend gets type safety.
 */
export type ActionResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string }