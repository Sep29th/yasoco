import prisma from "@/lib/prisma";

export const getExaminationFee = async () => {
  const fee = await prisma.examinationFee.findFirst({
    select: { id: true, value: true },
  });

  return fee;
};

export const upsertExaminationFee = async (value: number) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Giá khám không hợp lệ");
  }

  const existed = await prisma.examinationFee.findFirst({
    select: { id: true },
  });

  if (existed) {
    return prisma.examinationFee.update({
      where: { id: existed.id },
      data: { value },
    });
  }

  return prisma.examinationFee.create({
    data: { value },
  });
}
