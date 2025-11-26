import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { SUPER_ADMIN_PHONE } from "./constants/user";

export const getUserCount = async () => {
  return await prisma.user.count({
    where: { phone: { not: SUPER_ADMIN_PHONE } },
  });
};

export const getPaginationUser = async (page: number, pageSize: number) => {
  console.log("query");
  const where = {
    phone: { not: SUPER_ADMIN_PHONE },
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, users };
};

export const getUserById = async (id: string) => {
  const userWithRoles = await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
              permissionRoles: {
                select: {
                  permission: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userWithRoles) throw new Error("Người dùng không tồn tại");

  const roles = userWithRoles.userRoles.map((ur) => ({
    id: ur.role.id,
    name: ur.role.name,
  }));

  const permissions = userWithRoles.userRoles.flatMap((ur) => {
    const sourceRole = { id: ur.role.id, name: ur.role.name };

    return ur.role.permissionRoles.map((pr) => ({
      id: pr.permission.id,
      name: pr.permission.name,
      sourceRole: sourceRole,
    }));
  });

  const permissionNames = Array.from(
    new Set(
      permissions
        .map((perm) => perm.name)
        .filter((name): name is string => Boolean(name))
    )
  );

  return { ...userWithRoles, roles, permissions, permissionNames };
};

export const createUser = async ({
  name,
  phone,
  password,
  roleIds,
  isActive = true,
}: {
  name: string;
  phone: string;
  password: string;
  roleIds: string[];
  isActive?: boolean;
}) => {
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  if (!trimmedName) throw new Error("Tên người dùng là bắt buộc");
  if (!trimmedPhone) throw new Error("Số điện thoại là bắt buộc");
  if (!password) throw new Error("Mật khẩu là bắt buộc");

  const hashed = await bcrypt.hash(password, 10);
  const uniqueRoleIds = Array.from(new Set(roleIds ?? [])).filter(Boolean);

  const user = await prisma.$transaction(async (tx) => {
    const existed = await tx.user.findUnique({
      where: { phone: trimmedPhone },
      select: { id: true },
    });

    if (existed) throw new Error("Số điện thoại đã tồn tại");

    const created = await tx.user.create({
      data: {
        name: trimmedName,
        phone: trimmedPhone,
        password: hashed,
        isActive,
      },
    });

    if (uniqueRoleIds.length > 0) {
      await tx.userRole.createMany({
        data: uniqueRoleIds.map((roleId) => ({
          userId: created.id,
          roleId,
        })),
        skipDuplicates: true,
      });
    }

    return created;
  });

  return user;
};

export const updateUser = async ({
  id,
  name,
  phone,
  password,
  roleIds,
  isActive,
}: {
  id: string;
  name: string;
  phone: string;
  password?: string;
  roleIds: string[];
  isActive: boolean;
}) => {
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  if (!trimmedName) throw new Error("Tên người dùng là bắt buộc");
  if (!trimmedPhone) throw new Error("Số điện thoại là bắt buộc");

  const uniqueRoleIds = Array.from(new Set(roleIds ?? [])).filter(Boolean);

  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id },
      select: { id: true, phone: true },
    });

    if (!user) throw new Error("Người dùng không tồn tại");

    if (user.phone !== trimmedPhone) {
      const existedPhone = await tx.user.findUnique({
        where: { phone: trimmedPhone },
        select: { id: true },
      });

      if (existedPhone) throw new Error("Số điện thoại đã tồn tại");
    }

    let hashedPassword: string | undefined;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    await tx.user.update({
      where: { id },
      data: {
        name: trimmedName,
        phone: trimmedPhone,
        isActive,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      },
    });

    await tx.userRole.deleteMany({ where: { userId: id } });

    if (uniqueRoleIds.length > 0) {
      await tx.userRole.createMany({
        data: uniqueRoleIds.map((roleId) => ({
          userId: id,
          roleId,
        })),
        skipDuplicates: true,
      });
    }

    return true;
  });

  return updated;
};

export const deleteUser = async (id: string) => {
  const result = await prisma.user.deleteMany({
    where: { id },
  });

  return result.count;
};
