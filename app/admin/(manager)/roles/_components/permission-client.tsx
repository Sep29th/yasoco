"use client";

import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Level } from "../_types/level";
import { inferLevelActions } from "../_utils/infer-level-action";
import { ACCESS_LEVEL_MAP, RESOURCES } from "@/lib/constants/permission";
import { permissionsToLevels } from "../_utils/permissions-to-levels";

type PropsType = {
  onChange?: (permissions: string[]) => void;
  includeHiddenInputs?: boolean;
  initialPermissions?: string[];
};

export default function PermissionsClient({ onChange, includeHiddenInputs, initialPermissions }: PropsType) {
  const [levels, setLevels] = useState<Record<string, Level>>(() => {
    if (initialPermissions && initialPermissions.length > 0) {
      return permissionsToLevels(initialPermissions);
    }
    const initial: Record<string, Level> = {};
    RESOURCES.forEach((r) => (initial[r.key] = null));
    return initial;
  });

  const toggleLevel = (resourceKey: string, level: Level) => {
    setLevels((prev) => ({
      ...prev,
      [resourceKey]: prev[resourceKey] === level ? null : level,
    }));
  };

  // compute active permissions whenever levels change
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    const perms: string[] = [];
    RESOURCES.forEach((res) => {
      const selectedLevel = levels[res.key];
      let activeActions: string[] = [];
      if (ACCESS_LEVEL_MAP && ACCESS_LEVEL_MAP[res.key]) {
        const map = ACCESS_LEVEL_MAP[res.key];
        if (selectedLevel === "viewer") activeActions = map.viewer ?? [];
        if (selectedLevel === "editor") activeActions = map.editor ?? [];
        if (selectedLevel === "manager") activeActions = map.manager ?? [];
      } else {
        activeActions = inferLevelActions(res.actions, selectedLevel);
      }

      activeActions.forEach((p) => perms.push(p));
    });

    const unique = Array.from(new Set(perms));
    const key = unique.join(",");

    // Only call onChange when permissions actually change
    if (key !== prevRef.current) {
      prevRef.current = key;
      onChange?.(unique);
    }
  }, [levels, onChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {RESOURCES.map((res) => {
        const selectedLevel = levels[res.key];

        let activeActions: string[] = [];
        if (ACCESS_LEVEL_MAP && ACCESS_LEVEL_MAP[res.key]) {
          const map = ACCESS_LEVEL_MAP[res.key];
          if (selectedLevel === "viewer") activeActions = map.viewer ?? [];
          if (selectedLevel === "editor") activeActions = map.editor ?? [];
          if (selectedLevel === "manager") activeActions = map.manager ?? [];
        } else {
          activeActions = inferLevelActions(res.actions, selectedLevel);
        }

        return (
          <div key={res.key} className="border rounded p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{res.label}</h3>
                <p className="text-sm text-gray-500">
                  {res.description}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-1 justify-end">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium">Xem</span>
                  <input
                    type="checkbox"
                    checked={selectedLevel === "viewer"}
                    onChange={() => toggleLevel(res.key, "viewer")}
                    aria-label={`${res.key}-viewer`}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium">Sửa</span>
                  <input
                    type="checkbox"
                    checked={selectedLevel === "editor"}
                    onChange={() => toggleLevel(res.key, "editor")}
                    aria-label={`${res.key}-editor`}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium truncate">Quản lý</span>
                  <input
                    type="checkbox"
                    checked={selectedLevel === "manager"}
                    onChange={() => toggleLevel(res.key, "manager")}
                    aria-label={`${res.key}-manager`}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {res.actions.map((perm) => {
                const isChecked = activeActions.includes(perm.value);

                return (
                  <label key={perm.value} className="flex items-center gap-2">
                    <Checkbox checked={isChecked} disabled />
                    <span className="text-sm">{perm.label}</span>
                    {includeHiddenInputs && isChecked && (
                      <input type="hidden" name="permissions[]" value={perm.value} />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
