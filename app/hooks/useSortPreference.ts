import { useState, useEffect } from "react";

export type SortField = "name" | "modified" | "size";
export type SortDirection = "asc" | "desc";

export function useSortPreference() {
  const [sortField, setSortField] = useState<SortField>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sortField") as SortField) || "name";
    }
    return "name";
  });

  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sortDirection") as SortDirection) || "asc";
    }
    return "asc";
  });

  useEffect(() => {
    localStorage.setItem("sortField", sortField);
    localStorage.setItem("sortDirection", sortDirection);
  }, [sortField, sortDirection]);

  const handleSort = (field: string, direction: string) => {
    setSortField(field as SortField);
    setSortDirection(direction as SortDirection);
  };

  return {
    sortField,
    sortDirection,
    handleSort,
  };
}
