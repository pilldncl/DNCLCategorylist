import { CatalogItem, CatalogFilters } from '@/types/catalog';

export function filterCatalogItems(items: CatalogItem[], filters: CatalogFilters): CatalogItem[] {
  return items.filter(item => {
    // Brand filter
    if (filters.brand && item.brand.toLowerCase() !== filters.brand.toLowerCase()) {
      return false;
    }

    // Grade filter - check if any of the split grade tags match
    if (filters.grade) {
      const itemGradeTags = item.grade ? item.grade.split(/[\/\\]/).map(tag => tag.trim().toLowerCase()) : [];
      if (!itemGradeTags.includes(filters.grade.toLowerCase())) {
        return false;
      }
    }

    // Min quantity filter
    if (filters.minQty && item.minQty < filters.minQty) {
      return false;
    }

    // Search filter (searches in brand, name, and description)
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
  return [...new Set(values)].sort();
}
