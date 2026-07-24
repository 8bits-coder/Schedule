export function getFieldErrors(values: { validationErrors: Record<string, any> }) {
  const flattenedErrors: Record<string, string> = {};
  Object.entries(values.validationErrors).forEach(([key, value]) => {
    if (value && typeof value === "object" && "_errors" in value && Array.isArray(value._errors)) {
      flattenedErrors[key] = value._errors[0] || "Invalid";
    } else if (typeof value === "string") {
      flattenedErrors[key] = value;
    }
  });
  return flattenedErrors;
}
