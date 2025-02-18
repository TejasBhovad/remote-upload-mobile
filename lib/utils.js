export function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isImage(filename) {
  const imageExtensions = ["jpg", "png", "jpeg", "webp", "gif", "svg"];
  return imageExtensions.some((ext) => filename.endsWith(ext));
}
