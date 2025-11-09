import { PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const superAdminRoleName = "SUPER_ADMIN";

async function main() {
  // await prisma.role.upsert({
  //   where: { name: superAdminRoleName },
  //   update: {},
  //   create: {
  //     name: superAdminRoleName,
  //   },
  // });
  // await prisma.user.upsert({
  //   where: { phone: "0862973602" },
  //   update: {},
  //   create: {
  //     phone: "0862973602",
  //     name: "Super Admin",
  //     password: bcrypt.hashSync("nguyenchinhkiet", 10),
  //     isActive: true,
  //     isDeleted: false,
  //   },
  // });
  // await prisma.userRole.upsert({
  //   where: {},
  // });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
