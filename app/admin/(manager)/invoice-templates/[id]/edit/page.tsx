import {requireAuth} from "@/lib/auth";
import {notFound, redirect} from "next/navigation";
import {getInvoiceTemplateById} from "@/lib/invoice-template";
import InvoiceTemplateFormClient
	from "@/app/admin/(manager)/invoice-templates/_components/invoice-template-form-client";
import {Button} from "@/components/ui/button";
import Link from "next/link";

type PropsType = {
	params: Promise<{ id: string }>;
};

export default async function EditInvoiceTemplatePage({params}: PropsType) {
	const auth = await requireAuth();

	if (!auth.permissions.includes("invoice-template:update")) redirect("/admin/forbidden");

	const {id} = await params;

	const invoiceTemplate = await getInvoiceTemplateById(id)

	if (!invoiceTemplate) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Chỉnh sửa mẫu hóa đơn</h1>
					<p className="text-sm text-muted-foreground">
						Cập nhật nội dung của mẫu hóa đơn.
					</p>
				</div>
				<Link href="/admin/invoice-templates" className="no-underline">
					<Button variant="outline" className="cursor-pointer">
						Quay lại
					</Button>
				</Link>
			</header>
			<InvoiceTemplateFormClient
				initialValues={{name: invoiceTemplate.name, value: invoiceTemplate.value, backgroundImage: invoiceTemplate.backgroundImage}}
				invoiceTemplateId={invoiceTemplate.id}
			/>
		</div>
	)
}