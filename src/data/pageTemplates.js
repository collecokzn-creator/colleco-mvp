import pageTemplateConfig from "../config/pageTemplate.json";

const DEFAULT_TEMPLATE_KEY = "pageTemplate";
const RAW_TEMPLATES = {
  [DEFAULT_TEMPLATE_KEY]: pageTemplateConfig.pageTemplate,
  ...(pageTemplateConfig.examples || {}),
};

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value !== "object") {
    return value;
  }
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch (error) {
      // ignore structuredClone failures and fall back to JSON
    }
  }
  return JSON.parse(JSON.stringify(value));
}

function deepMerge(baseValue, overrideValue) {
  if (overrideValue === undefined) {
    return clone(baseValue);
  }
  if (baseValue === undefined) {
    return clone(overrideValue);
  }

  if (Array.isArray(overrideValue)) {
    return overrideValue.map((item) => clone(item));
  }

  if (Array.isArray(baseValue)) {
    return clone(overrideValue);
  }

  if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
    const result = clone(baseValue) || {};
    Object.keys(overrideValue).forEach((key) => {
      const value = overrideValue[key];
      if (value === undefined) return;
      result[key] = deepMerge(baseValue[key], value);
    });
    return result;
  }

  return clone(overrideValue);
}

function resolveTemplateDefinition(definition) {
  if (!definition) {
    return clone(RAW_TEMPLATES[DEFAULT_TEMPLATE_KEY]);
  }

  if (typeof definition === "string") {
    const referenced = RAW_TEMPLATES[definition];
    if (!referenced) {
      throw new Error(`[template] Unknown template reference: ${definition}`);
    }
    return resolveTemplateDefinition(referenced);
  }

  if (Array.isArray(definition)) {
    throw new Error("[template] Array definitions are not supported for templates.");
  }

  if (isPlainObject(definition)) {
    const workingCopy = clone(definition);
    if (workingCopy.extends) {
      const base = resolveTemplateDefinition(workingCopy.extends);
      delete workingCopy.extends;
      return deepMerge(base, workingCopy);
    }
    return workingCopy;
  }

  throw new Error(`[template] Unsupported template definition: ${String(definition)}`);
}

export function resolveTemplate(definition, overrides) {
  const template = resolveTemplateDefinition(definition);
  if (overrides) {
    return deepMerge(template, overrides);
  }
  return template;
}

export function getTemplate(name = DEFAULT_TEMPLATE_KEY) {
  return resolveTemplate(name);
}

export function listTemplateKeys() {
  return Object.keys(RAW_TEMPLATES);
}

export function resolveTemplateForRoute(route) {
  if (!route) return resolveTemplate();
  const metaOverrides = route.meta ? { meta: route.meta } : undefined;
  return resolveTemplate(route.template, metaOverrides);
}
