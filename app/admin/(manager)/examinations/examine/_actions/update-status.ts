"use server";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
export default async function updateStatus(
	id: string,
	status: "IN_PROGRESS" | "WAITING"
) {
	await prisma.$transaction(async (tx) => {
		const examination = await tx.examination.findUnique({
			where: { id },
			select: { status: true },
		});
		if (!examination || status == examination.status) return;
		if (status === "IN_PROGRESS" && examination.status !== "WAITING") return;
		if (status === "WAITING" && examination.status !== "IN_PROGRESS") return;
		await tx.examination.update({
			where: { id },
			data: { status },
		});
	});
	await pusherServer.trigger("examination", "update", { id });
}
