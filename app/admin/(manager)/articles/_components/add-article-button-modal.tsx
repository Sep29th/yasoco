"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { articleNameSchema, FormValues } from "../_schema/article-name-schema";
import { createArticle } from "../_actions/create-article";

export default function AddArticleButtonModal() {
	const [isPending, startTransition] = useTransition();
	const { push } = useRouter();
	const form = useForm<FormValues>({
		resolver: zodResolver(articleNameSchema),
		defaultValues: { ["article-name"]: "" },
	});

	const handleAddArticle = (values: FormValues) => {
		startTransition(async () => {
			const { success, message } = await createArticle(values["article-name"]);
			if (success) {
				push(`/admin/articles/${message}/edit`);
			} else {
				form.setError("article-name", { message });
			}
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="lg" variant="outline" className="w-full sm:w-auto">
					<Plus className="size-4 mr-2" /> Thêm bài viết
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Thêm bài viết mới</DialogTitle>
					<DialogDescription>
						Trước khi cấu hình bài viết. Hãy nhập tên cho bài viết trước
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleAddArticle)}
						className="space-y-6"
					>
						<div className="md:col-span-3">
							<FormField
								control={form.control}
								name="article-name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Tên bài viết
											<span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Ví dụ: Tim mạch ở trẻ em..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex justify-end">
							<Button
								type="submit"
								disabled={isPending}
								className="bg-[#A6CF52] hover:bg-[#93b848]"
							>
								{isPending && <Spinner />}
								Thêm
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
