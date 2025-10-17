import pageBlueprintConfig from "../config/pageBlueprints.json";

const { categories } = pageBlueprintConfig;

function clone(value) {
  if (value === undefined || value === null) return value;
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch (error) {
      // fall back to JSON clone when structuredClone fails
    }
  }
  return JSON.parse(JSON.stringify(value));
}

const CATEGORY_KEYS = Object.keys(categories);
const PAGE_INDEX = CATEGORY_KEYS.reduce((acc, key) => {
  const category = categories[key];
  category.pages.forEach((page) => {
    acc.set(page.pageId, {
      ...page,
      categoryMeta: {
        categoryKey: key,
        categoryId: category.categoryId,
        title: category.title,
      },
    });
  });
  return acc;
}, new Map());

export function listBlueprintCategories() {
  return CATEGORY_KEYS.map((key) => {
    const category = categories[key];
    return clone({
      categoryKey: key,
      categoryId: category.categoryId,
      title: category.title,
      description: category.description,
      purpose: category.purpose,
      defaultLayout: category.defaultLayout,
      pageCount: category.pages.length,
    });
  });
}

export function getBlueprintCategory(categoryKey) {
  if (!categoryKey) return undefined;
  const category = categories[categoryKey];
  return category ? clone(category) : undefined;
}

export function getPageBlueprint(pageId) {
  if (!pageId) return undefined;
  const blueprint = PAGE_INDEX.get(pageId);
  return blueprint ? clone(blueprint) : undefined;
}

export function listPageBlueprints() {
  return Array.from(PAGE_INDEX.values()).map((blueprint) => clone(blueprint));
}

export function getPagesForCategory(categoryKey) {
  const category = categories[categoryKey];
  if (!category) return [];
  return clone(category.pages);
}

export function findBlueprintByRoute(routePath) {
  if (!routePath) return undefined;
  for (const blueprint of PAGE_INDEX.values()) {
    if (typeof blueprint.route === "string" && routePath.startsWith(blueprint.route.replace(/:\w+/g, ""))) {
      return clone(blueprint);
    }
  }
  return undefined;
}
