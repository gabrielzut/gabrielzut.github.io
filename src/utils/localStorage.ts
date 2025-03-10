export interface LocalStorageData {
  computerStatus: 0 | 1 | 2;
  envs: { [key: string]: string };
}

export function setItem<K extends keyof LocalStorageData>(
  key: K,
  value: LocalStorageData[K],
): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem<K extends keyof LocalStorageData>(
  key: K,
): LocalStorageData[K] | null {
  const item = localStorage.getItem(key);
  return item ? (JSON.parse(item) as LocalStorageData[K]) : null;
}

export function removeItem<K extends keyof LocalStorageData>(key: K): void {
  localStorage.removeItem(key);
}

export function getEnv(envName: string) {
  return (getItem("envs") ?? {})[envName];
}

export function setEnv(envName: string, value: string) {
  const envs = getItem("envs") ?? {};

  return setItem("envs", { ...envs, [envName]: value });
}
