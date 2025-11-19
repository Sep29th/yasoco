import { ModalWrapper } from "@/components/modal-wrapper";
import { Badge } from "@/components/ui/badge";
import { getUserById } from "@/lib/user";
import { RESOURCES } from "@/lib/constants/permission";

type PropsType = {
  data: Awaited<ReturnType<typeof getUserById>>;
};

export default function UserModalContent({ data }: PropsType) {
  const permNames: string[] = data.permissionNames ?? [];

  return (
    <ModalWrapper>
      <div className="grid gap-4 py-4">
        <div>
          <h2 className="text-2xl font-bold">{data.name}</h2>
          <p className="text-sm text-muted-foreground">{data.phone}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Trạng thái</p>
          <div className="flex flex-wrap gap-2">
            {data.isDeleted ? (
              <Badge variant="destructive">Đã xóa</Badge>
            ) : data.isActive ? (
              <Badge>Đang hoạt động</Badge>
            ) : (
              <Badge variant="secondary">Đã khóa</Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Vai trò</p>
          {data.roles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.roles.map((role) => (
                <Badge key={role.id} variant="outline">
                  {role.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Người dùng chưa được gán vai trò.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold">Quyền chi tiết</h3>

          {permNames.length === 0 ? (
            <div className="text-sm text-muted-foreground mt-2">
              Người dùng chưa sở hữu quyền nào.
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {RESOURCES.map((res) => {
                const resourcePerms = res.actions.map((a) => a.value);
                const present = resourcePerms.filter((p) =>
                  permNames.includes(p)
                );

                if (present.length === 0) return null;

                return (
                  <div key={res.key} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {res.label}
                        </div>
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
    </ModalWrapper>
  );
}

