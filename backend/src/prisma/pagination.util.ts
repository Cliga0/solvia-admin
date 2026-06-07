import { PaginationDto } from "../common/dto";

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function buildPaginationSearch(
  searchFields: string[],
  search?: string,
): Record<string, { contains: string; mode: "insensitive" }> | undefined {
  if (!search) {
    return undefined;
  }

  const conditions: Record<string, { contains: string; mode: "insensitive" }> =
    {};
  for (const field of searchFields) {
    conditions[field] = { contains: search, mode: "insensitive" };
  }
  return conditions;
}

export function buildPaginationOrderBy(
  pagination: PaginationDto,
  allowedSortFields: string[],
  defaultSort = "createdAt",
  defaultOrder: "asc" | "desc" = "desc",
): Record<string, "asc" | "desc"> {
  const sortBy = pagination.sortBy ?? defaultSort;
  const sortOrder = pagination.sortOrder ?? defaultOrder;

  if (!allowedSortFields.includes(sortBy)) {
    return { [defaultSort]: defaultOrder };
  }

  return { [sortBy]: sortOrder };
}

export function buildPaginationSkip(pagination: PaginationDto): {
  skip: number;
  take: number;
} {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 20;

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function createPaginatedResult<T>(
  items: T[],
  total: number,
  pagination: PaginationDto,
): PaginatedResult<T> {
  const limit = pagination.limit ?? 20;

  return {
    items,
    total,
    page: pagination.page ?? 1,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
