export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
}
