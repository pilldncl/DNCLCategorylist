import { CatalogItem, CatalogFilters } from '@/types/catalog';

export function filterCatalogItems(items: CatalogItem[], filters: CatalogFilters): CatalogItem[] {
  return items.filter(item => {
    // Brand filter (case-insensitive)
    if (filters.brand && item.brand.toLowerCase() !== filters.brand.toLowerCase()) {
      return false;
    }

    // Grade filter - check if any of the split grade tags match (case-insensitive)
    if (filters.grade) {
      const itemGradeTags = item.grade ? item.grade.split(/[\/\\]/).map(tag => tag.trim().toLowerCase()) : [];
      if (!itemGradeTags.includes(filters.grade.toLowerCase())) {
        return false;
      }
    }

    // Search filter (searches in brand, name, and description) - case-insensitive
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = [
        item.brand,
        item.name,
        item.description,
        item.category
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
}

export function getUniqueValues(items: CatalogItem[], field: keyof CatalogItem): string[] {
  const values = items.map(item => item[field]).filter(Boolean) as string[];
  // Use case-insensitive deduplication but preserve original case of first occurrence
  const uniqueMap = new Map<string, string>();
  values.forEach(value => {
    const lowerValue = value.toLowerCase();
    if (!uniqueMap.has(lowerValue)) {
      uniqueMap.set(lowerValue, value);
    }
  });
  return Array.from(uniqueMap.values()).sort();
}
