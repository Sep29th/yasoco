import { ActionItem } from "../_types/action-item";
import { Level } from "../_types/level";

export const inferLevelActions = (actions: ActionItem[], level: Level) => {
  if (!level) return [];
  const suffix = (v: string) => v.split(":")[1] || v;

  if (level === "viewer")
    return actions
      .filter((a) => suffix(a.value) === "read")
      .map((a) => a.value);
  if (level === "editor")
    return actions
      .filter((a) => {
        const s = suffix(a.value);
        return s === "read" || s === "create" || s === "update";
      })
      .map((a) => a.value);
  if (level === "manager")
    return actions
      .filter((a) => {
        const s = suffix(a.value);
        return (
          s === "read" || s === "create" || s === "update" || s === "delete"
        );
      })
      .map((a) => a.value);

  return [];
};
