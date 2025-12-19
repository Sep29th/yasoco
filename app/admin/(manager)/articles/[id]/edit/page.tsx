import { Button } from "@/components/ui/button";
import { getArticleById } from "@/lib/article";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ArticleFormClient from "../../_components/article-form-client";
import { getAllTags } from "@/lib/tag";

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

export default async function EditArticlePage({ params }: PropsType) {
	const auth = await requireAuth();
	if (!auth.permissions.includes("article:update")) {
		redirect("/admin/forbidden");
	}
	const { id } = validateParams(await params);
	const [article, tags] = await Promise.all([getArticleById(id), getAllTags()]);
	if (!article) notFound();

	return (
		<div className="space-y-6">
			<header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Chỉnh sửa bài viết</h1>
					<p className="text-sm text-muted-foreground">
						Chỉnh sửa bài viết để đưa lên trang web
					</p>
				</div>
				<Link href="/admin/articles" className="no-underline">
					<Button variant="outline" className="cursor-pointer">
						Quay lại
					</Button>
				</Link>
			</header>

			<ArticleFormClient
				articleId={article.id}
				initialValues={{
					title: article.title,
					slug: article.slug,
					excerpt: article.excerpt,
					coverImage: article.coverImage,
					isPublished: article.isPublished,
					showInMainPage: article.showInMainPage,
					content: article.content,
					tags: article.articleTags.map((k) => k.tagId),
				}}
				data={{ tags }}
			/>
		</div>
	);
}
