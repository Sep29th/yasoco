import prisma from "@/lib/prisma";

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

  if (!roleWithPermissions) throw new Error("Vai trò không tồn tại");

  const permissionNames: string[] =
    roleWithPermissions.permissionRoles.map((pr) => pr.permission.name) ?? [];

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

export const updateRole = async ({
  id,
  name,
  permissions,
}: {
  id: string;
  name: string;
  permissions: string[];
}) => {
  const result = await prisma.$transaction(async (tx) => {
    const existingRole = await tx.role.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existingRole) throw new Error("Vai trò không tồn tại");

    // Check if name is being changed and if the new name already exists
    if (name !== existingRole.name) {
      const checkExisted = await tx.role.findUnique({
        where: { name },
        select: { id: true },
      });

      if (checkExisted) throw new Error("Tên vai trò đã tồn tại");
    }

    // Delete all existing permission roles
    await tx.permissionRole.deleteMany({
      where: { roleId: id },
    });

    // Add new permissions
    let permissionsResult: { id: string }[] = [];
    if (permissions.length > 0) {
      permissionsResult = await tx.permission.findMany({
        where: {
          name: { in: permissions },
        },
        select: { id: true },
      });
    }

    // Update role name and create new permission roles
    await tx.role.update({
      where: { id },
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

export const getAssignableRoles = async () => {
  const roles = await prisma.role.findMany({
    where: { NOT: { name: "SUPER_ADMIN" } },
    include: {
      permissionRoles: {
        include: { permission: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    permissionNames:
      role.permissionRoles
        .map((pr) => pr.permission.name)
        .filter((name): name is string => Boolean(name)) ?? [],
  }));
};
