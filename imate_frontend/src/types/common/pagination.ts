export interface GetPaginationRangeProps {
  currentPage: number;
  totalPage: number;
  siblingCount?: number;
}

export type PaginationRange = (number | "dots")[];


export interface PagedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}