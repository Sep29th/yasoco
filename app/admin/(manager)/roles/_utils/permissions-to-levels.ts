import { Level } from "../_types/level";
import { ACCESS_LEVEL_MAP, RESOURCES } from "@/lib/constants/permission";
import { inferLevelActions } from "./infer-level-action";

export function permissionsToLevels(permissions: string[]): Record<string, Level> {
  const levels: Record<string, Level> = {};
  
  RESOURCES.forEach((res) => {
    const resourcePerms = permissions.filter((p) => p.startsWith(`${res.key}:`));
    
    if (resourcePerms.length === 0) {
      levels[res.key] = null;
      return;
    }

    // Check if resource has ACCESS_LEVEL_MAP
    if (ACCESS_LEVEL_MAP && ACCESS_LEVEL_MAP[res.key]) {
      const map = ACCESS_LEVEL_MAP[res.key];
      
      // Check manager level (all manager permissions must be present)
      if (map.manager.every((p) => permissions.includes(p))) {
        levels[res.key] = "manager";
        return;
      }
      
      // Check editor level (all editor permissions must be present)
      if (map.editor.every((p) => permissions.includes(p))) {
        levels[res.key] = "editor";
        return;
      }
      
      // Check viewer level (all viewer permissions must be present)
      if (map.viewer.every((p) => permissions.includes(p))) {
        levels[res.key] = "viewer";
        return;
      }
    } else {
      // Fallback to inferring from actions
      const managerActions = inferLevelActions(res.actions, "manager");
      const editorActions = inferLevelActions(res.actions, "editor");
      const viewerActions = inferLevelActions(res.actions, "viewer");
      
      if (managerActions.every((p) => permissions.includes(p))) {
        levels[res.key] = "manager";
        return;
      }
      
      if (editorActions.every((p) => permissions.includes(p))) {
        levels[res.key] = "editor";
        return;
      }
      
      if (viewerActions.every((p) => permissions.includes(p))) {
        levels[res.key] = "viewer";
        return;
      }
    }
    
    // If no level matches, set to null
    levels[res.key] = null;
  });
  
  return levels;
}

