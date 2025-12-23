"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {AtSign, Edit3} from "lucide-react";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Spinner} from "@/components/ui/spinner";
import {useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {dosageTemplateSchema, FormValues} from "../_schemas/dosage-template-schema";
import updateDosageTemplateAction from "@/app/admin/(manager)/dosage-templates/_actions/update-dosage-template";
import {DosageTemplate} from "@/lib/generated/prisma";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type PropsType = {
	dosageTemplate: DosageTemplate
}

export default function UpdateDosageTemplateButton({dosageTemplate}: PropsType) {
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const {refresh} = useRouter();
	const form = useForm<FormValues>({
		resolver: zodResolver(dosageTemplateSchema),
		defaultValues: {
			shortcut: dosageTemplate.shortcut,
			content: dosageTemplate.content
		}
	})

	const handleAddDosageTemplate = (values: FormValues) => {
		startTransition(async () => {
			const {success, message} = await updateDosageTemplateAction(dosageTemplate.id, values);
			if (success) {
				setOpen(false);
				refresh();
			} else {
				form.setError("shortcut", {message})
			}
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<DialogTrigger asChild>
							<Button
								className="cursor-pointer"
								variant="ghost"
								size="icon"
							>
								<Edit3 className="size-4"/>
							</Button>
						</DialogTrigger>
					</TooltipTrigger>
					<TooltipContent>
						<p>Chỉnh sửa</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<DialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
				<DialogHeader>
					<DialogTitle>Chỉnh sửa mẫu tắt</DialogTitle>
					<DialogDescription>
						Nhập phím tắt và nội dung
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleAddDosageTemplate)}
						className="space-y-6"
					>
						<div className="md:col-span-3">
							<FormField
								control={form.control}
								name="shortcut"
								render={({field}) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>
												Phím tắt
												<span className="text-red-500">*</span>
											</FormLabel>
											<FormMessage className="font-light leading-none"/>
										</div>
										<div className="relative w-full">
											<AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
											<FormControl className="pl-9">
												<Input
													placeholder="Ví dụ: s1gc1g"
													{...field}
												/>
											</FormControl>
										</div>
									</FormItem>
								)}
							/>
						</div>
						<div className="md:col-span-3">
							<FormField
								control={form.control}
								name="content"
								render={({field}) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>
												Nội dung
												<span className="text-red-500">*</span>
											</FormLabel>
											<FormMessage className="font-light leading-none"/>
										</div>
										<FormControl>
											<Input
												placeholder="Ví dụ: Sáng 1 gói, chiều 1 gói"
												{...field}
											/>
										</FormControl>
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
								{isPending && <Spinner/>}
								Lưu
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}