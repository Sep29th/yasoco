import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import TagForm from "../_components/tag-form";
import { getRandomPastelColor } from "../_utils/random-pastel";

export default async function CreateTagPage() {
	const auth = await requireAuth();

	if (!auth.permissions.includes("tag:create")) {
		redirect("/admin/forbidden");
	}

	return (
		<div className="space-y-6">
			<header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Tạo chủ đề</h1>
					<p className="text-sm text-muted-foreground">
						Thiết lập thông tin cho các chủ đề để nhóm các bài viết liên quan
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
				mode="create"
				initialValues={{
					color: getRandomPastelColor(),
					name: "",
				}}
			/>
		</div>
	);
}
