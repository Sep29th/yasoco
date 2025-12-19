"use client";

import { Article, Tag } from "@/lib/generated/prisma";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
	articleFormSchema,
	ArticleFormValues,
} from "../_schema/article-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import TitleAndSlugGroup from "./title-and-slug-group";
import IsPublishedAndShowInMainPageGroup from "./is-published-and-show-in-main-page-group";
import ImageUploadCrop from "./image-upload-crop";
import { Button } from "@/components/ui/button";
import ArticleEditor from "./article-editor";
import { MultiSelect } from "@/components/multiple-select";
import saveArticleAction from "../_actions/save";
import { toast } from "sonner";
import { invoiceTemplateTipTapExtensions } from "@/lib/constants/invoice-template";
import { generateText } from "@tiptap/react";

type PropsType = {
	articleId: string;
	initialValues: Pick<
		Article,
		| "title"
		| "slug"
		| "excerpt"
		| "coverImage"
		| "isPublished"
		| "showInMainPage"
		| "content"
	> & { tags: string[] };
	data: { tags: Pick<Tag, "id" | "name" | "color">[] };
};

export default function ArticleFormClient({
	articleId,
	data,
	initialValues,
}: PropsType) {
	const [isLoading, startSaveTransition] = useTransition();
	const [error, setError] = useState("");

	const form = useForm<ArticleFormValues>({
		resolver: zodResolver(articleFormSchema),
		defaultValues: {
			title: initialValues.title || "",
			slug: initialValues.slug || "",
			excerpt: initialValues.excerpt || "",
			coverImage: initialValues.coverImage || "",
			content: initialValues.content,
			isPublished: initialValues.isPublished,
			showInMainPage: initialValues.showInMainPage,
			tags: initialValues.tags,
		},
	});

	const onSubmit = (values: ArticleFormValues) => {
		startSaveTransition(async () => {
			const contentText = generateText(
				values.content || { type: "doc" },
				invoiceTemplateTipTapExtensions
			);
			try {
				await saveArticleAction(
					articleId,
					{
						...values,
						content: values.content
							? JSON.parse(JSON.stringify(values.content))
							: { type: "doc" },
					},
					contentText
				);
				setError("");
				toast.success("Lưu bài viết thành công!", { position: "top-right" });
			} catch (e) {
				console.error(e);
				setError("Đã có lỗi xảy ra!");
			}
		});
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit, (e) => console.error(e))}
				className="grid grid-cols-1 lg:grid-cols-3 gap-6"
			>
				<div className="lg:col-span-1 space-y-6">
					<div className="bg-white rounded shadow p-6 space-y-4">
						<TitleAndSlugGroup form={form} />
						<FormField
							control={form.control}
							name="excerpt"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>Trích đoạn</FormLabel>
										<FormMessage className="font-light leading-none" />
									</div>
									<FormControl>
										<Textarea {...field} value={field.value || undefined} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="tags"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>Chủ đề</FormLabel>
										<FormMessage className="font-light leading-none" />
									</div>
									<FormControl>
										<MultiSelect
											{...field}
											options={data.tags}
											placeholder=""
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="coverImage"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>Ảnh bìa</FormLabel>
										<FormMessage className="font-light leading-none" />
									</div>
									<FormControl>
										<ImageUploadCrop
											value={field.value}
											onChange={field.onChange}
											disabled={isLoading}
											aspectRatio={1.7}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<IsPublishedAndShowInMainPageGroup form={form} />
						<div className="flex justify-end items-center space-x-4">
							{error && (
								<p className="font-light leading-none text-red-500">{error}</p>
							)}
							<Button
								type="submit"
								className="cursor-pointer bg-[#A6CF52] hover:bg-[#94B846]"
								disabled={isLoading}
							>
								{isLoading ? "Đang lưu..." : "Lưu"}
							</Button>
						</div>
					</div>
				</div>
				<div className="lg:col-span-2 h-full">
					<div className="bg-white rounded shadow overflow-hidden h-full">
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<ArticleEditor
											content={field.value || undefined}
											onChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				</div>
			</form>
		</Form>
	);
}
