"use client";

import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import {useTransition} from "react";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {zodResolver} from "@hookform/resolvers/zod";
import {
	FormValues,
	invoiceTemplateNameSchema
} from "@/app/admin/(manager)/invoice-templates/_schemas/invoice-template-name-schema";
import {createInvoiceTemplate} from "@/app/admin/(manager)/invoice-templates/_actions/create-invoice-template";
import {useRouter} from "next/navigation";
import {Spinner} from "@/components/ui/spinner";

export default function AddInvoiceTemplateButtonModal() {
	const [isPending, startTransition] = useTransition()
	const {push} = useRouter()
	const form = useForm<FormValues>({
		resolver: zodResolver(invoiceTemplateNameSchema),
		defaultValues: {["invoice-template-name"]: ""}
	})

	const handleAddInvoiceTemplate = (values: FormValues) => {
		startTransition(async () => {
			const {success, message} = await createInvoiceTemplate(values["invoice-template-name"]);
			if (success) {
				push(`/admin/invoice-templates/${message}/edit`);
			} else {
				form.setError("invoice-template-name", {message})
			}
		})
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="lg" variant="outline" className="w-full sm:w-auto">
					<Plus className="size-4 mr-2"/> Thêm mẫu hóa đơn
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Thêm mẫu hóa đơn mới</DialogTitle>
					<DialogDescription>Trước khi cấu hình mẫu hóa đơn. Hãy nhập tên cho mẫu hóa đơn trước</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleAddInvoiceTemplate)} className="space-y-6">
						<div className="md:col-span-3">
							<FormField
								control={form.control}
								name="invoice-template-name"
								render={({field}) => (
									<FormItem>
										<FormLabel>
											Tên mẫu hóa đơn
											<span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Ví dụ: Mẫu hóa đơn có đi kèm ghi chú..."
												{...field}
											/>
										</FormControl>
										<FormMessage/>
									</FormItem>
								)}
							/>
						</div>
						<div className="flex justify-end">
							<Button type="submit" disabled={isPending} className="bg-[#A6CF52] hover:bg-[#93b848]">
								{isPending && <Spinner/>}
								Thêm
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}