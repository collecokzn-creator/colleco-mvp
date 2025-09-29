// (Replace with the storage you prefer — localStorage now) // src/utils/packageStorage.js
const KEY = "colleco_packages_v1";

// 🔹 Helper: get all packages
export function getPackages() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePackages(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

// 🔹 Add a new package
export function addPackage(pkg) {
  const list = getPackages();
  pkg.id = pkg.id || Date.now().toString();
  list.unshift(pkg);
  savePackages(list);
  return pkg;
}

// 🔹 Update existing package
export function updatePackage(updated) {
  const list = getPackages();
  const idx = list.findIndex((p) => p.id === updated.id);
  if (idx >= 0) {
    list[idx] = updated;
    savePackages(list);
    return true;
  }
  return false;
}

// 🔹 Delete package by ID
export function deletePackage(id) {
  const list = getPackages().filter((p) => p.id !== id);
  savePackages(list);
}

// 🔹 Get a single package by ID
export function getPackageById(id) {
  return getPackages().find((p) => String(p.id) === String(id));
}