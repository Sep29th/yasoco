import { ALL_PERMISSION } from "../lib/constants/permission";
import { DaysOfWeek, PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcrypt";
import { SUPER_ADMIN_PASSWORD, SUPER_ADMIN_PHONE } from "../lib/constants/user";

const prisma = new PrismaClient();

const superAdminRoleName = "SUPER_ADMIN";
const superAdminName = "Super Admin";

type TxType = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Tạo vai trò SUPER_ADMIN và người dùng SUPER_ADMIN,
 * sau đó gán vai trò đó cho người dùng.
 */
async function seedSuperAdminAndRole(tx: TxType) {
  console.log("Đang tạo/cập nhật vai trò SUPER_ADMIN...");
  const role = await tx.role.upsert({
    where: { name: superAdminRoleName },
    update: {},
    create: {
      name: superAdminRoleName,
    },
  });

  console.log("Đang tạo/cập nhật người dùng SUPER_ADMIN...");
  const superAdmin = await tx.user.upsert({
    where: { phone: SUPER_ADMIN_PHONE },
    update: {
      // Chỉ cập nhật những thông tin cơ bản, không update password
      name: superAdminName,
      isActive: true,
    },
    create: {
      phone: SUPER_ADMIN_PHONE,
      name: superAdminName,
      password: bcrypt.hashSync(SUPER_ADMIN_PASSWORD, 10),
      isActive: true,
      isDeleted: false,
    },
  });

  console.log("Đang gán vai trò SUPER_ADMIN cho người dùng...");
  await tx.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: role.id } },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: role.id,
    },
  });

  console.log("✅ Tạo SUPER_ADMIN và gán vai trò thành công.");
  return role;
}

/**
 * Tạo tất cả các quyền cơ bản và gán chúng cho vai trò SUPER_ADMIN.
 */
async function seedPermissions(tx: TxType, superAdminRoleId: string) {
  console.log("Đang định nghĩa và tạo các quyền (permissions)...");

  await tx.permission.createMany({
    data: ALL_PERMISSION.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log("Đang lấy thông tin các quyền...");
  const allPermissions = await tx.permission.findMany({
    where: {
      name: { in: ALL_PERMISSION },
    },
  });

  console.log(
    `Đang gán ${allPermissions.length} quyền cho vai trò SUPER_ADMIN...`
  );
  await tx.permissionRole.createMany({
    data: allPermissions.map((permission) => ({
      roleId: superAdminRoleId,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  console.log("✅ Gán quyền cho SUPER_ADMIN thành công.");
}

/**
 * Tạo các khung giờ khám (ExaminationSession) cho tất cả các ngày trong tuần.
 */
async function seedExaminationSessions(tx: TxType) {
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

  console.log(
    `Đang tạo ${daysOfWeek.length} khung giờ cho các ngày trong tuần...`
  );

  // Sử dụng Promise.all để chạy song song các lệnh upsert
  const upsertPromises = daysOfWeek.map((day) =>
    tx.examinationSession.upsert({
      where: {
        id: `session-${day.toLowerCase()}`,
      },
      update: {
        session: sessions,
      },
      create: {
        id: `session-${day.toLowerCase()}`,
        daysOfWeek: day,
        session: sessions,
      },
    })
  );

  await Promise.all(upsertPromises);

  console.log("✅ Tạo các khung giờ khám thành công.");
}

/**
 * Tạo giá khởi tạo của dịch vụ khám
 */
async function seedExaminationFee(tx: TxType) {
  console.log("Đang kiểm tra giá khởi tạo của dịch vụ khám...");

  const checkExisted = await tx.examinationFee.findFirst();

  if (checkExisted) {
    console.log("⏭️  Giá khám đã tồn tại, bỏ qua bước này.");
    return;
  }

  await tx.examinationFee.create({
    data: {
      value: 20000,
    },
  });

  console.log("✅ Tạo giá khám thành công (20,000 VNĐ).");
}

/**
 * Hàm main để chạy tất cả các bước seed với transaction
 */
async function main() {
  console.log("🚀 Bắt đầu quá trình seed...\n");

  // Kiểm tra biến môi trường
  if (!SUPER_ADMIN_PHONE || !SUPER_ADMIN_PASSWORD) {
    throw new Error(
      "⚠️  Thiếu biến môi trường SUPER_ADMIN_PHONE hoặc SUPER_ADMIN_PASSWORD"
    );
  }

  // Chạy toàn bộ seed operations trong 1 transaction
  await prisma.$transaction(
    async (tx) => {
      console.log("📦 Transaction bắt đầu...\n");

      const superAdminRole = await seedSuperAdminAndRole(tx);
      await seedPermissions(tx, superAdminRole.id);
      await seedExaminationSessions(tx);
      await seedExaminationFee(tx);

      console.log("\n📦 Transaction hoàn tất!");
    },
    {
      maxWait: 10000, // Đợi tối đa 10s để có transaction
      timeout: 30000, // Timeout sau 30s
    }
  );

  console.log("\n✅ Quá trình seed hoàn tất thành công!");
  console.log("📋 Thông tin đăng nhập SUPER_ADMIN:");
  console.log(`   - Số điện thoại: ${SUPER_ADMIN_PHONE}`);
  console.log(`   - Mật khẩu: ${SUPER_ADMIN_PASSWORD}`);
  console.log(
    "\n⚠️  LƯU Ý: Hãy đổi mật khẩu ngay sau lần đăng nhập đầu tiên!\n"
  );
}

main()
  .catch((e) => {
    console.error("\n❌ Đã xảy ra lỗi trong quá trình seed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Đã ngắt kết nối database.");
  });
