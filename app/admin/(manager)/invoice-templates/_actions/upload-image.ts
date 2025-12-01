"use server";

import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";

const r2Client = new S3Client({
	region: process.env.CLOUDFLARE_R2_REGION || "auto",
	endpoint:
		process.env.CLOUDFLARE_R2_ENDPOINT ||
		(process.env.CLOUDFLARE_R2_ACCOUNT_ID
			? `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
			: undefined),
	credentials: {
		accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
	},
	forcePathStyle: true,
});

function getPublicUrl(key: string): string {
	const base = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;
	if (base) {
		return `${base.replace(/\/$/, "")}/${key}`;
	}
	const endpoint =
		process.env.CLOUDFLARE_R2_ENDPOINT ||
		(process.env.CLOUDFLARE_R2_ACCOUNT_ID
			? `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
			: "");
	const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";
	return `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
}

function randomKey(prefix: string, extension: string) {
	const safeExt = extension.startsWith(".") ? extension : `.${extension}`;
	const randomPart = Math.random().toString(36).slice(2, 10);
	const timestamp = Date.now();
	return `${prefix}/${timestamp}-${randomPart}${safeExt}`;
}

type UploadResult = {
	success: boolean;
	url?: string;
	error?: string;
};

export default async function uploadImage(formData: FormData): Promise<UploadResult> {
	try {
		const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;

		if (!bucket) {
			return {success: false, error: "Server configuration error"};
		}

		const file = formData.get("file") as File;

		if (!file) {
			return {success: false, error: "No file provided"};
		}

		const arrayBuffer = await file.arrayBuffer();
		const contentType = file.type || "application/octet-stream";
		const size = file.size;

		const originalName = file.name;
		const ext =
			(originalName && originalName.includes(".")
				? originalName.substring(originalName.lastIndexOf("."))
				: "") || "";

		const key = randomKey("invoice-templates", ext || ".bin");

		await r2Client.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: key,
				Body: Buffer.from(arrayBuffer),
				ContentType: contentType,
				ContentLength: size,
			}),
		);

		const url = getPublicUrl(key);

		return {success: true, url};
	} catch (error) {
		console.error("Error uploading image to R2", error);
		return {success: false, error: "Failed to upload image"};
	}
}