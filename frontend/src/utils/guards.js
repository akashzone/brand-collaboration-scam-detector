export const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const asArray = (value) => (Array.isArray(value) ? value : []);

export const asObject = (value) => (isObject(value) ? value : {});

export const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

export const isNonEmptyString = (value) => typeof value === "string" && value.trim() !== "";

export const asStringArray = (value) => asArray(value).filter(isNonEmptyString);
