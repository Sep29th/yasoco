"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserAction } from "../_actions/create";
import { updateUserAction } from "../_actions/update";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RESOURCES } from "@/lib/constants/permission";
import { RoleOption } from "../_types/role-option";
import { getAccessLevelLabel } from "../_utils/get-access-level-label";

type PropsType = {
  mode: "create" | "edit";
  userId?: string;
  initialValues: {
    name: string;
    phone: string;
    password?: string;
    roleIds: string[];
    isActive: boolean;
  };
  availableRoles: RoleOption[];
};

export default function UserFormClient({
  mode,
  userId,
  initialValues,
  availableRoles,
}: PropsType) {
  const router = useRouter();
  const [name, setName] = useState(initialValues.name);
  const [phone, setPhone] = useState(initialValues.phone);
  const [password, setPassword] = useState(initialValues.password ?? "");
  const [roleIds, setRoleIds] = useState<string[]>(initialValues.roleIds);
  const [isActive, setIsActive] = useState<boolean>(initialValues.isActive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRoles = useMemo(
    () => availableRoles.filter((role) => roleIds.includes(role.id)),
    [availableRoles, roleIds]
  );

  const resolvedPermissionNames = useMemo(() => {
    const perms = selectedRoles.flatMap((role) => role.permissionNames);
    return Array.from(new Set(perms)).sort();
  }, [selectedRoles]);

  const toggleRole = (roleId: string) => {
    setRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === "edit" && !userId) {
      setError("Thiếu mã người dùng cần cập nhật");
      return;
    }

    if (!name.trim()) {
      setError("Tên người dùng không được bỏ trống");
      return;
    }

    if (!phone.trim()) {
      setError("Số điện thoại không được bỏ trống");
      return;
    }

    if (mode === "create" && !password.trim()) {
      setError("Mật khẩu không được bỏ trống");
      return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        await createUserAction({
          name,
          phone,
          password,
          roleIds,
          isActive,
        });
      } else {
        await updateUserAction({
          id: userId as string,
          name,
          phone,
          password,
          roleIds,
          isActive,
        });
      }

      router.push("/admin/users");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded shadow p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xx xxx xxx"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {mode === "create" ? "Mật khẩu" : "Mật khẩu (tùy chọn)"}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "create" ? "••••••" : "Để trống nếu không đổi"
              }
            />
            {mode === "edit" && (
              <p className="text-xs text-muted-foreground">
                Để trống nếu không muốn thay đổi mật khẩu.
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(Boolean(checked))}
            />
            <Label htmlFor="isActive">Cho phép đăng nhập</Label>
          </div>
        </div>

        {error && (
          <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            className="cursor-pointer bg-[#A6CF52] hover:bg-[#94B846]"
            disabled={loading}
          >
            {loading
              ? mode === "create"
                ? "Đang tạo..."
                : "Đang cập nhật..."
              : mode === "create"
              ? "Tạo người dùng"
              : "Cập nhật"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.push("/admin/users")}
            disabled={loading}
          >
            Hủy
          </Button>
        </div>
      </div>

      <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Preview permissions on the left */}
        <div className="bg-white rounded shadow p-6 space-y-4">
          <div>
            <h2 className="text-lg font-medium">Quyền sẽ có</h2>
            <p className="text-sm text-muted-foreground">
              Danh sách tổng hợp các quyền từ những vai trò đã chọn.
            </p>
          </div>

          {resolvedPermissionNames.length > 0 ? (
            <div className="space-y-3">
              {RESOURCES.map((resource) => {
                const actions = resource.actions.filter((action) =>
                  resolvedPermissionNames.includes(action.value)
                );
                if (actions.length === 0) return null;

                const level = getAccessLevelLabel(
                  resource.key,
                  resolvedPermissionNames
                );

                return (
                  <div key={resource.key} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{resource.label}</p>
                      {level && (
                        <span className="inline-block text-[11px] font-medium rounded bg-[#E5F4C3] text-[#4B5C1F] px-2 py-0.5">
                          {level}
                        </span>
                      )}
                    </div>
                    <ul className="ml-4 list-disc space-y-0.5">
                      {actions.map((action) => (
                        <li
                          key={action.value}
                          className="text-sm text-muted-foreground"
                        >
                          {action.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa chọn vai trò nào, người dùng sẽ không có quyền.
            </p>
          )}
        </div>

        {/* Role cards on the right with masonry-like layout */}
        <div className="bg-white rounded shadow p-6 space-y-4">
          <div>
            <h2 className="text-lg font-medium">Vai trò</h2>
            <p className="text-sm text-muted-foreground">
              Chọn các vai trò mà người dùng sẽ sở hữu.
            </p>
          </div>

          <div className="columns-1 md:columns-2 gap-3 space-y-3">
            {availableRoles.map((role) => {
              const checked = roleIds.includes(role.id);
              return (
                <label
                  key={role.id}
                  className="flex items-start gap-3 rounded border p-3 cursor-pointer hover:border-primary/40 transition break-inside-avoid"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleRole(role.id)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{role.name}</span>
                      <Badge variant="outline">
                        {role.permissionNames.length} quyền
                      </Badge>
                    </div>
                    {role.permissionNames.length > 0 ? (
                      <div className="mt-1 space-y-1">
                        {RESOURCES.map((resource) => {
                          const actions = resource.actions.filter((action) =>
                            role.permissionNames.includes(action.value)
                          );
                          if (actions.length === 0) return null;

                          const level = getAccessLevelLabel(
                            resource.key,
                            role.permissionNames
                          );

                          return (
                            <div key={resource.key}>
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold">
                                  {resource.label}
                                </p>
                                {level && (
                                  <span className="inline-block text-[11px] font-medium rounded bg-[#E5F4C3] text-[#4B5C1F] px-2 py-0.5">
                                    {level}
                                  </span>
                                )}
                              </div>
                              <ul className="ml-4 list-disc space-y-0.5">
                                {actions.map((action) => (
                                  <li
                                    key={action.value}
                                    className="text-xs text-muted-foreground"
                                  >
                                    {action.label}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Chưa gán quyền nào
                      </p>
                    )}
                  </div>
                </label>
              );
            })}

            {availableRoles.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Chưa có vai trò nào để gán.
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
