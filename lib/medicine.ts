import prisma from "@/lib/prisma";

export const getPaginationMedicines = async (
  page: number,
  pageSize: number
) => {
  const [total, medicines] = await Promise.all([
    prisma.medicine.count(),
    prisma.medicine.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, medicines };
};

export const getMedicineById = async (id: string) => {
  const medicine = await prisma.medicine.findUnique({ where: { id } });

  if (!medicine) throw new Error("Thuốc không tồn tại");

  return medicine;
};

export const createMedicine = async ({
  name,
  description,
  unit,
  price,
}: {
  name: string;
  description?: string;
  unit: string;
  price: number;
}) => {
  const trimmedName = name.trim();
  const trimmedUnit = unit.trim();
  const trimmedDescription = (description || "").trim() || null;

  if (!trimmedName) throw new Error("Tên thuốc là bắt buộc");
  if (!trimmedUnit) throw new Error("Đơn vị là bắt buộc");
  if (!Number.isFinite(price) || price < 0)
    throw new Error("Giá thuốc không hợp lệ");

  const medicine = await prisma.medicine.create({
    data: {
      name: trimmedName,
      unit: trimmedUnit,
      description: trimmedDescription,
      price,
    },
  });

  return medicine;
};

export const updateMedicine = async ({
  id,
  name,
  description,
  unit,
  price,
}: {
  id: string;
  name: string;
  description?: string;
  unit: string;
  price: number;
}) => {
  const trimmedName = name.trim();
  const trimmedUnit = unit.trim();
  const trimmedDescription = (description || "").trim() || null;

  if (!trimmedName) throw new Error("Tên thuốc là bắt buộc");
  if (!trimmedUnit) throw new Error("Đơn vị là bắt buộc");
  if (!Number.isFinite(price) || price < 0)
    throw new Error("Giá thuốc không hợp lệ");

  const existed = await prisma.medicine.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existed) throw new Error("Thuốc không tồn tại");

  const medicine = await prisma.medicine.update({
    where: { id },
    data: {
      name: trimmedName,
      unit: trimmedUnit,
      description: trimmedDescription,
      price,
    },
  });

  return medicine;
};

export const deleteMedicine = async (id: string) => {
  const result = await prisma.medicine.deleteMany({ where: { id } });

  return result.count;
};
