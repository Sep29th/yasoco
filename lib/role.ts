import prisma from "./prisma";

export const getPaginationRoles = async (page: number, pageSize: number) => {
  const [total, roles] = await Promise.all([
    prisma.role.count({ where: { NOT: { name: "SUPER_ADMIN" } } }),
    prisma.role.findMany({
      where: { NOT: { name: "SUPER_ADMIN" } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, roles };
};

export const getRoleById = async (id: string) => {
  const roleWithPermissions = await prisma.role.findUnique({
    where: { id },
    include: {
      permissionRoles: {
        include: {
          permission: true,
        },
      },
    },
  });

  const permissionNames: string[] =
    roleWithPermissions?.permissionRoles.map((pr) => pr.permission.name) ?? [];

  return { ...roleWithPermissions, permissionNames };
};

export const createRole = async ({
  name,
  permissions,
}: {
  name: string;
  permissions: string[];
}) => {
  const result = await prisma.$transaction(async (tx) => {
    const checkExisted = await tx.role.findUnique({
      where: { name },
      select: { id: true },
    });

    if (checkExisted) throw new Error("Tên vai trò đã tồn tại");

    let permissionsResult: { id: string }[] = [];
    if (permissions.length > 0) {
      permissionsResult = await tx.permission.findMany({
        where: {
          name: { in: permissions },
        },
        select: { id: true },
      });
    }

    await tx.role.create({
      data: {
        name: name,
        permissionRoles: permissionsResult.length
          ? {
              create: permissionsResult.map((p) => ({
                permissionId: p.id,
              })),
            }
          : undefined,
      },
      include: {
        permissionRoles: {
          include: { permission: true },
        },
      },
    });

    return true;
  });

  return result;
};

export const deleteRole = async (id: string) => {
  const result = await prisma.role.deleteMany({ where: { id } });

  return result.count;
};
