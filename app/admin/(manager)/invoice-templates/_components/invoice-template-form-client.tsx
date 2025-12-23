/* eslint-disable @next/next/no-img-element */
"use client";
import {useRef, useState, useTransition} from "react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useForm} from "react-hook-form";
import {
	FormValues,
	invoiceTemplateSchema,
} from "@/app/admin/(manager)/invoice-templates/_schemas/invoice-template-schema";
import {zodResolver} from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import InvoiceTemplateEditor from "@/app/admin/(manager)/invoice-templates/_components/invoice-template-editor";
import {Button} from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {Spinner} from "@/components/ui/spinner";
import {useReactToPrint} from "react-to-print";
import {
	exampleInvoiceTemplateData,
	invoiceTemplate,
	pageStyle,
	printFont,
} from "@/lib/constants/invoice-template";
import {renderHtmlApplyDataToTiptapJsonContent} from "@/utils/render-html-apply-data-to-tiptap-json-content";
import {examinationDataToInvoiceTemplateData} from "@/utils/examination-data-to-invoice-template-data";
import updateInvoiceTemplate from "@/app/admin/(manager)/invoice-templates/_actions/update-invoice-template";
import {toast} from "sonner";

type PropsType = {
	invoiceTemplateId: string;
	initialValues: {
		name: string;
		value: PrismaJson.EditorContentType | null;
		backgroundImage: string | null;
	};
};

export default function InvoiceTemplateFormClient({
																										invoiceTemplateId,
																										initialValues,
																									}: PropsType) {
	const form = useForm<FormValues>({
		resolver: zodResolver(invoiceTemplateSchema),
		defaultValues: {
			name: initialValues.name || "",
			value: initialValues.value || undefined,
			backgroundImage: initialValues.backgroundImage || "",
		},
	});
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewHtml, setPreviewHtml] = useState<string>("");
	// Thêm state để lưu background khi preview
	const [previewBackground, setPreviewBackground] = useState<string | null>(null);
	const [previewLoading, setPreviewLoading] = useState(false);
	const [printLoading, setPrintLoading] = useState(false);
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	const reactToPrintFn = useReactToPrint({
		contentRef,
		ignoreGlobalStyles: true,
		pageStyle,
		onBeforePrint: async () => {
			setPrintLoading(true);
		},
		onAfterPrint: async () => {
			setPrintLoading(false);
		},
		onPrintError: async () => {
			setPrintLoading(false);
		},
	});
	const [isPending, startTransition] = useTransition();

	const onSubmit = (values: FormValues) => {
		startTransition(async () => {
			// Lưu ý: Bạn cần chắc chắn hàm updateInvoiceTemplate phía server
			// đã hỗ trợ nhận tham số backgroundImage nếu muốn lưu nó vào DB.
			// Dưới đây tôi giả định bạn sẽ cập nhật API call này.
			const {success, message} = await updateInvoiceTemplate(
				invoiceTemplateId,
				values.name,
				JSON.parse(JSON.stringify(values.value || {type: "doc", content: []})),
				values.backgroundImage // <-- Cần truyền thêm cái này nếu server đã update
			);
			if (success) {
				toast.success("Lưu mẫu hóa đơn thành công", {position: "top-right"});
			} else {
				form.setError("name", {message});
			}
		});
	};

	const handleOpenPreview = async () => {
		setPreviewOpen(true);
		setPreviewLoading(true);

		try {
			const values = form.getValues();
			const content = values.value || {type: "doc", content: []};

			// Lấy background hiện tại từ form
			setPreviewBackground(values.backgroundImage || null);

			const html = renderHtmlApplyDataToTiptapJsonContent(
				content,
				examinationDataToInvoiceTemplateData(exampleInvoiceTemplateData)
			);
			setPreviewHtml(html);
		} finally {
			setPreviewLoading(false);
		}
	};

	const handleCopy = (text: string, key: string) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedKey(key);
			setTimeout(() => {
				setCopiedKey((current) => (current === key ? null : current));
			}, 1000);
		});
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="grid grid-cols-1 lg:grid-cols-15 gap-6 h-full"
			>
				<div className="lg:col-span-5 space-y-6">
					<div className="bg-white rounded shadow p-6 space-y-4 lg:h-full">
						<div className="md:col-span-3">
							<FormField
								control={form.control}
								name="name"
								render={({field}) => (
									<FormItem>
										<FormLabel>
											Tên của mẫu hóa đơn
											<span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input placeholder="Ví dụ: Mẫu hóa đơn 1" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="space-y-3">
							<Label className="text-sm font-medium">
								Các giá trị có thể sử dụng:
							</Label>
							<div className="border rounded-lg p-4 space-y-4 text-sm h-[841px] overflow-auto">
								{invoiceTemplate.map(([sectionName, argumentsList]) => (
									<div className="space-y-1" key={`argument-${sectionName}`}>
										<div className="text-xs font-semibold text-gray-700">
											{sectionName}
										</div>
										<div className="grid grid-cols-1 gap-2">
											{argumentsList.map(([templateKey, description]) => (
												<div
													className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
													onClick={() =>
														handleCopy(
															templateKey,
															templateKey.replace(/[{}]/g, "")
														)
													}
													key={templateKey}
												>
													<code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
														{templateKey}
													</code>
													<span className="text-gray-600">{description}</span>
													{copiedKey === templateKey.replace(/[{}]/g, "") && (
														<span className="ml-auto text-[10px] text-green-600">
                              Copied
                            </span>
													)}
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
				<div className="lg:col-span-10 space-y-6">
					<div className="bg-white rounded shadow p-6 space-y-4 lg:h-full">
						<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
							<div className="flex items-center justify-between">
								<div className="text-sm text-gray-700 font-medium">
									Xem trước mẫu hóa đơn với dữ liệu khám ví dụ
								</div>
								<div className="flex items-center gap-2">
									<Button
										disabled={isPending}
										type="submit"
										size="sm"
										className="bg-[#A6CF52] hover:bg-[#93b848]"
									>
										{isPending && <Spinner />}
										Lưu
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleOpenPreview}
									>
										Xem thử
									</Button>
								</div>
							</div>
							<DialogContent className="sm:max-w-7xl w-full max-h-[80vh] overflow-hidden">
								<DialogHeader>
									<DialogTitle>Xem trước mẫu hóa đơn</DialogTitle>
									<DialogDescription>
										Mẫu được render với dữ liệu khám ví dụ để bạn kiểm tra layout
										và bind.
									</DialogDescription>
								</DialogHeader>
								<div className="flex justify-end mb-2">
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={reactToPrintFn}
										disabled={!previewHtml || previewLoading || printLoading}
									>
										{(!previewHtml || previewLoading || printLoading) && (
											<Spinner />
										)}
										In thử
									</Button>
								</div>
								<div className="bg-gray-100 max-h-[60vh] overflow-y-auto p-4">
									{previewLoading ? (
										<div className="flex items-center gap-2 text-sm text-gray-600">
											<Spinner />
											<span>Đang dựng nội dung xem trước...</span>
										</div>
									) : (
										<div className="flex justify-center invoice-template">
											<div
												ref={contentRef}
												id="invoice-print"
												className={`bg-white shadow-lg print:shadow-none ${printFont.className}`}
												style={{
													width: "148mm",
													minHeight: "210mm",
													padding: "5mm 10mm",
													boxSizing: "border-box",
													position: "relative", // Chuyển relative vào style
												}}
											>
												{previewBackground && (
													<div
														style={{
															position: "absolute",
															top: 0,
															left: 0,
															width: "100%",
															height: "100%",
															zIndex: 0,
															pointerEvents: "none",
															userSelect: "none",
															overflow: "hidden",
														}}
													>
														<img
															src={previewBackground}
															alt="Background"
															style={{
																width: "100%",
																height: "100%",
																objectFit: "contain",
																objectPosition: "center",
																opacity: 0.15,
															}}
														/>
													</div>
												)}

												<div
													className="prose prose-sm max-w-none ProseMirror preview"
													dangerouslySetInnerHTML={{__html: previewHtml}}
													style={{
														position: "relative",
														zIndex: 10,
													}}
												/>
											</div>
										</div>
									)}
								</div>
							</DialogContent>
						</Dialog>
						<div className="flex justify-center">
							<FormField
								control={form.control}
								name="value"
								render={({field}) => (
									<FormItem>
										<FormLabel>Mẫu hóa đơn</FormLabel>
										<FormControl>
											<InvoiceTemplateEditor
												content={field.value}
												onChange={field.onChange}
												form={form}
												background={true}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</div>
				<div className="hidden">
					<FormField
						control={form.control}
						name="backgroundImage"
						render={({field}) => (
							<FormItem>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</form>
		</Form>
	);
}