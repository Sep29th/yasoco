import { ALL_PERMISSION } from "../lib/constants/permission";
import { DaysOfWeek, PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcrypt";
import { SUPER_ADMIN_PASSWORD, SUPER_ADMIN_PHONE } from "../lib/constants/user";

const prisma = new PrismaClient();

const superAdminRoleName = "SUPER_ADMIN";
const superAdminName = "Super Admin";

/**
 * Tạo vai trò SUPER_ADMIN và người dùng SUPER_ADMIN,
 * sau đó gán vai trò đó cho người dùng.
 */
async function seedSuperAdminAndRole() {
  console.log("Đang tạo/cập nhật vai trò SUPER_ADMIN...");
  const role = await prisma.role.upsert({
    where: { name: superAdminRoleName },
    update: {},
    create: {
      name: superAdminRoleName,
    },
  });

  console.log("Đang tạo/cập nhật người dùng SUPER_ADMIN...");
  const superAdmin = await prisma.user.upsert({
    where: { phone: SUPER_ADMIN_PHONE },
    update: {},
    create: {
      phone: SUPER_ADMIN_PHONE,
      name: superAdminName,
      password: bcrypt.hashSync(SUPER_ADMIN_PASSWORD, 10),
      isActive: true,
      isDeleted: false,
    },
  });

  console.log("Đang gán vai trò SUPER_ADMIN cho người dùng...");
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: role.id } },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: role.id,
    },
  });

  console.log("Tạo SUPER_ADMIN và gán vai trò thành công.");
  return role; // Trả về vai trò để dùng cho bước tiếp theo
}

/**
 * Tạo tất cả các quyền cơ bản và gán chúng cho vai trò SUPER_ADMIN.
 */
async function seedPermissions(superAdminRoleId: string) {
  console.log("Đang định nghĩa và tạo các quyền (permissions)...");

  await prisma.permission.createMany({
    data: ALL_PERMISSION.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log("Đang lấy thông tin các quyền...");
  const allPermissions = await prisma.permission.findMany({
    where: {
      name: { in: ALL_PERMISSION },
    },
  });

  console.log(
    `Đang gán ${allPermissions.length} quyền cho vai trò SUPER_ADMIN...`
  );
  await prisma.permissionRole.createMany({
    data: allPermissions.map((permission) => ({
      roleId: superAdminRoleId,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  console.log("Gán quyền cho SUPER_ADMIN thành công.");
}

/**
 * Tạo các khung giờ khám (ExaminationSession) cho tất cả các ngày trong tuần.
 */
async function seedExaminationSessions() {
  console.log("Đang tạo các khung giờ khám...");

  const sessions: string[] = [];
  let hour = 17;
  let minute = 30;

  // Tạo mảng các khung giờ: ["17:30", "18:00", ..., "21:00"]
  while (hour < 21 || (hour === 21 && minute === 0)) {
    const timeString = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
    sessions.push(timeString);

    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
  }

  const daysOfWeek = Object.values(DaysOfWeek);

  // Sử dụng Promise.all để chạy song song các lệnh upsert, giúp tăng tốc độ
  const upsertPromises = daysOfWeek.map((day) =>
    prisma.examinationSession.upsert({
      where: {
        id: `session-${day.toLowerCase()}`,
      },
      update: {
        session: sessions, // Cũng cập nhật session nếu đã tồn tại
      },
      create: {
        id: `session-${day.toLowerCase()}`,
        daysOfWeek: day,
        session: sessions, // Gán mảng string[] vào trường Json
      },
    })
  );

  await Promise.all(upsertPromises);

  console.log("Tạo các khung giờ khám thành công.");
}

async function seedExaminationFee() {
  console.log("Đang tạo giá khởi tạo của dịch vụ khám");

  const checkExisted = await prisma.examinationFee.findMany();

  if (checkExisted.length != 0) return;

  await prisma.examinationFee.create({
    data: {
      value: 20000,
    },
  });
}

/**
 * Hàm main để chạy tất cả các bước seed
 */
async function main() {
  console.log("Bắt đầu quá trình seed...");

  const superAdminRole = await seedSuperAdminAndRole();
  await seedPermissions(superAdminRole.id);
  await seedExaminationSessions();
  await seedExaminationFee();

  console.log("✅ Quá trình seed hoàn tất thành công!");
}

main()
  .catch((e) => {
    console.error("❌ Đã xảy ra lỗi trong quá trình seed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
