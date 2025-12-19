import {
	FormField,
	FormItem,
	FormControl,
	FormLabel,
} from "@/components/ui/form";
import { useEffect } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { ArticleFormValues } from "../_schema/article-form-schema";
import { Checkbox } from "@/components/ui/checkbox";

type PropsType = {
	form: UseFormReturn<ArticleFormValues, unknown, ArticleFormValues>;
};

export default function IsPublishedAndShowInMainPageGroup({ form }: PropsType) {
	const [isPublished] = useWatch({
		control: form.control,
		name: ["isPublished"],
	});

	useEffect(() => {
		if (!isPublished) {
			form.setValue("showInMainPage", false);
		}
	}, [isPublished, form]);

	return (
		<>
			<FormField
				control={form.control}
				name="isPublished"
				render={({ field }) => (
					<FormItem className="flex flex-row items-center space-x-3 space-y-0">
						<FormControl>
							<Checkbox
								checked={field.value}
								onCheckedChange={field.onChange}
							/>
						</FormControl>
						<div className="space-y-1 leading-none">
							<FormLabel>Xuất bản</FormLabel>
						</div>
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="showInMainPage"
				render={({ field }) => (
					<FormItem className="flex flex-row items-center space-x-3 space-y-0">
						<FormControl>
							<Checkbox
								checked={field.value}
								onCheckedChange={field.onChange}
								disabled={!isPublished}
							/>
						</FormControl>
						<div className="space-y-1 leading-none">
							<FormLabel>Hiển thị ở trang chủ</FormLabel>
						</div>
					</FormItem>
				)}
			/>
		</>
	);
}
