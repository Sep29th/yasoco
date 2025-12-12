import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import TagForm from "../../_components/tag-form";
import { getTagById } from "@/lib/tag";

type Params = {
	id: string;
};

type PropsType = {
	params: Promise<Params>;
};

const validateParams = (params: Partial<Params>) => {
	const value = { id: "" };

	if (
		params.id &&
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
			params.id
		)
	) {
		value.id = params.id;
	} else {
		notFound();
	}

	return value;
};

export default async function UpdateTagPage({ params }: PropsType) {
	const auth = await requireAuth();
	if (!auth.permissions.includes("tag:update")) {
		redirect("/admin/forbidden");
	}
	const { id } = validateParams(await params);
	const tag = await getTagById(id);
	if (!tag) notFound();

	return (
		<div className="space-y-6">
			<header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Sửa chủ đề</h1>
					<p className="text-sm text-muted-foreground">
						Chỉnh sửa thông tin cho các chủ đề để nhóm các bài viết liên quan
						tới nhau để gợi ý
					</p>
				</div>
				<Link href="/admin/tags" className="no-underline">
					<Button variant="outline" className="cursor-pointer">
						Quay lại
					</Button>
				</Link>
			</header>

			<TagForm
				mode="edit"
				tagId={tag.id}
				initialValues={{
					color: tag.color,
					name: tag.name,
				}}
			/>
		</div>
	);
}
