import type { ZodIssue } from "zod";

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface ItemResponse<T> {
  data: T;
}

export interface ErrorResponse {
  error: string;
  issues?: ZodIssue[];
}

export interface ReorderRequest {
  ordered_ids: number[];
}
