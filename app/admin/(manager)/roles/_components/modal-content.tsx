import { ModalWrapper } from "@/components/modal-wrapper";
import { Badge } from "@/components/ui/badge";
import { RESOURCES } from "@/lib/constants/permission";
import { determineLevel } from "../_utils/determine-level";
import { getRoleById } from "@/lib/role";

type PropsType = {
  data: Awaited<ReturnType<typeof getRoleById>>;
};

export default function ModalContent({ data }: PropsType) {
  const permNames: string[] = (data.permissionRoles || [])
    .map((pr) => pr.permission.name)
    .filter(Boolean);

  return (
    <ModalWrapper>
      <div className="grid gap-4 py-4">
        <h2 className="text-2xl font-bold">{data.name}</h2>

        <div>
          <h3 className="text-lg font-semibold">
            Quyền của vai trò <Badge variant="outline">{data.name}</Badge>
          </h3>

          {permNames.length === 0 ? (
            <div className="text-sm text-gray-500 mt-2">
              Chưa có quyền nào được gán cho vai trò này.
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {RESOURCES.map((res) => {
                const resourcePerms = res.actions.map((a) => a.value);
                const present = resourcePerms.filter((p) =>
                  permNames.includes(p)
                );
                const level = determineLevel(res.key, permNames);

                if (present.length === 0) return null;

                return (
                  <div key={res.key} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{res.label}</div>
                        {res.description && (
                          <div className="text-xs text-gray-500">
                            {res.description}
                          </div>
                        )}
                      </div>
                      <div>
                        {level ? (
                          <span className="text-sm font-medium bg-slate-200 px-2 py-1 rounded">
                            {level}
                          </span>
                        ) : (
                          <span className="text-sm font-medium bg-yellow-100 px-2 py-1 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {res.actions.map(
                        (act) =>
                          permNames.includes(act.value) && (
                            <div
                              key={act.value}
                              className="text-xs px-2 py-1 rounded bg-green-100 text-green-800"
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
