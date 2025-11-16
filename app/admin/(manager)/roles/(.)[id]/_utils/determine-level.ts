import { ACCESS_LEVEL_MAP } from '@/lib/constants/permission';

export function determineLevel(resourceKey: string, perms: string[]) {
  const map = ACCESS_LEVEL_MAP[resourceKey];
  if (!map) return null;

  if (map.manager.every((p) => perms.includes(p))) return "Quyền quản lý";
  if (map.editor.every((p) => perms.includes(p))) return "Quyền sửa";
  if (map.viewer.every((p) => perms.includes(p))) return "Quyền xem";

  return null;
}
