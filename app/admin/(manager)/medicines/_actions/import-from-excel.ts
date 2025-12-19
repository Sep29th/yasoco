"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidateTag } from 'next/cache';

type ImportRow = {
	name: string;
	unit: string;
	description?: string;
};

type ImportResult =
	| { ok: true; count: number }
	| { ok: false; rowErrors: { index: number; message: string }[] };

export async function importMedicinesFromExcelAction(payload: {
	rows: ImportRow[];
}): Promise<ImportResult> {
	const auth = await requireAuth();

	if (!auth.permissions.includes("medicine:create")) {
		throw new Error("Không có quyền tạo thuốc");
	}

	const rows = Array.isArray(payload?.rows) ? payload.rows : [];

	if (rows.length === 0) {
		throw new Error("Không có dòng dữ liệu nào để import");
	}

	const errors: { index: number; message: string }[] = [];

	// Chuẩn hóa và validate cơ bản
	const normalizedRows = rows.map((row, index) => {
		const name = String(row.name ?? "").trim();
		const unit = String(row.unit ?? "").trim();
		const description = String(row.description ?? "").trim();

		if (!name) {
			errors.push({ index, message: "Tên thuốc là bắt buộc" });
		}

		if (!unit) {
			errors.push({ index, message: "Đơn vị là bắt buộc" });
		}

		return { name, unit, description };
	});

	// Kiểm tra trùng tên trong file
	const nameMap = new Map<string, number[]>();
	normalizedRows.forEach((row, index) => {
		const key = row.name.toLowerCase();
		if (!key) return;

		const arr = nameMap.get(key) ?? [];
		arr.push(index);
		nameMap.set(key, arr);
	});

	for (const [, indexes] of nameMap.entries()) {
		if (indexes.length > 1) {
			indexes.forEach((index) => {
				errors.push({ index, message: "Tên thuốc bị trùng trong file" });
			});
		}
	}

	// Kiểm tra trùng với dữ liệu trong DB
	const uniqueNames = Array.from(
		new Set(normalizedRows.map((row) => row.name).filter(Boolean))
	);

	if (uniqueNames.length > 0) {
		const existing = await prisma.medicine.findMany({
			where: { name: { in: uniqueNames } },
			select: { name: true },
		});

		const existingNames = new Set(existing.map((m) => m.name.toLowerCase()));

		normalizedRows.forEach((row, index) => {
			const key = row.name.toLowerCase();
			if (key && existingNames.has(key)) {
				errors.push({ index, message: "Tên thuốc đã tồn tại trong hệ thống" });
			}
		});
	}

	if (errors.length > 0) {
		return { ok: false, rowErrors: errors };
	}

	// Không có lỗi, tiến hành tạo theo transaction
	await prisma.$transaction(async (tx) => {
		for (const row of normalizedRows) {
			await tx.medicine.create({
				data: {
					name: row.name,
					unit: row.unit,
					description: row.description || null,
				},
			});
		}
	});

	revalidateTag("medicines-all", { expire: 0 });

	return { ok: true, count: normalizedRows.length };
}
