"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { ArticleFormValues } from "../_schema/article-form-schema";
import { useEffect } from "react";
import { titleToSlug } from "../_utils/title-to-slug";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type PropsType = {
	form: UseFormReturn<ArticleFormValues, unknown, ArticleFormValues>;
};

export default function TitleAndSlugGroup({ form }: PropsType) {
	const [title] = useWatch({ control: form.control, name: ["title"] });

	useEffect(() => {
		if (title) {
			const slug = titleToSlug(title);
			form.setValue("slug", slug);
		}
	}, [title, form]);

	return (
		<>
			<FormField
				control={form.control}
				name="title"
				render={({ field }) => (
					<FormItem>
						<div className="flex items-center justify-between">
							<FormLabel>
								Tiêu đề <span className="text-red-500">*</span>
							</FormLabel>
							<FormMessage className="font-light leading-none" />
						</div>
						<FormControl>
							<Input {...field} />
						</FormControl>
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="slug"
				render={({ field }) => (
					<FormItem>
						<div className="flex items-center justify-between">
							<FormLabel>Đường dẫn</FormLabel>
							<FormMessage className="font-light leading-none" />
						</div>
						<FormControl>
							<Input {...field} disabled />
						</FormControl>
					</FormItem>
				)}
			/>
		</>
	);
}
