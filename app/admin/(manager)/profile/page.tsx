import { requireAuth } from "@/lib/auth";
import { getUserById } from "@/lib/user";
import { RESOURCES } from "@/lib/constants/permission";
import { Badge } from "@/components/ui/badge";
import ChangePasswordForm from "./_components/change-password-form-client";

export default async function ProfilePage() {
  const auth = await requireAuth();
  const user = await getUserById(auth.userId);

  const permNames: string[] = user.permissionNames ?? [];

  const renderStatus = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) {
      return <Badge variant="destructive">Đã xóa</Badge>;
    }

    if (!isActive) {
      return <Badge variant="secondary">Đã khóa</Badge>;
    }

    return <Badge>Đang hoạt động</Badge>;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hồ sơ cá nhân</h1>
          <p className="text-sm text-muted-foreground">
            Xem thông tin tài khoản, vai trò, quyền hạn và thay đổi mật khẩu.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded shadow p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Thông tin cơ bản</h2>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Họ và tên</p>
              <p>{user.name}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Số điện thoại</p>
              <p>{user.phone}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Trạng thái</p>
              <div className="flex flex-wrap gap-2">
                {renderStatus(Boolean(user.isActive), Boolean(user.isDeleted))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Vai trò</p>
              {user.roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge key={role.id} variant="outline">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Bạn chưa được gán vai trò nào.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Quyền chi tiết</h2>

            {permNames.length === 0 ? (
              <div className="text-sm text-muted-foreground mt-2">
                Bạn chưa sở hữu quyền nào.
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {RESOURCES.map((res) => {
                  const resourcePerms = res.actions.map((a) => a.value);
                  const present = resourcePerms.filter((p) => permNames.includes(p));

                  if (present.length === 0) return null;

                  return (
                    <div key={res.key} className="p-3 border rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{res.label}</div>
                          {res.description && (
                            <div className="text-xs text-muted-foreground">
                              {res.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {res.actions.map(
                          (act) =>
                            permNames.includes(act.value) && (
                              <div
                                key={act.value}
                                className="text-xs px-2 py-1 rounded bg-[#E5F4C3] text-[#4B5C1F]"
                              >
                                {act.label}
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Đổi mật khẩu</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi mật khẩu đăng nhập.
            </p>
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
