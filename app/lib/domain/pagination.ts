/** @format */

/**
 * Standard pagination parameters for repository queries.
 * Defines the requested page number and the number of items per page.
 */
export interface PaginationParams {
    page: number
    pageSize: number
}

/**
 * Standard paginated result wrapper.
 * Encapsulates the list of items along with metadata about the pagination state.
 */
export interface PaginationResult<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}
