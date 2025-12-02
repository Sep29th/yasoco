"use client";

import {InvoiceTemplate} from "@/lib/generated/prisma";
import {examinationDataToInvoiceTemplateData} from "@/utils/examination-data-to-invoice-template-data";
import {useMemo, useRef, useState, useTransition} from "react";
import {getAllInvoiceTemplates} from "@/lib/invoice-template";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {useReactToPrint} from "react-to-print";
import {pageStyle} from "@/lib/constants/invoice-template";
import {cn} from "@/lib/utils";
import {renderHtmlApplyDataToTiptapJsonContent} from "@/utils/render-html-apply-data-to-tiptap-json-content";
import {Printer} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {ExaminationDataNeededForInvoiceTemplateType} from "@/utils/types/examination-data-needed-for-invoice-template";

type PropsType = {
	examination: ExaminationDataNeededForInvoiceTemplateType;
}

export default function PrintInvoiceModalButton({examination}: PropsType) {
	const [open, setOpen] = useState(false);
	const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[] | null>(null);
	const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);
	const [isPending, startTransition] = useTransition();
	const contentRef = useRef<HTMLDivElement>(null);

	const reactToPrintFn = useReactToPrint({
		contentRef,
		ignoreGlobalStyles: true,
		pageStyle,
	});

	const loadInvoiceTemplates = () => {
		startTransition(async () => {
			const data = await getAllInvoiceTemplates();
			setInvoiceTemplates(data);
			if (data && data.length > 0) {
				setSelectedTemplate(data[0]);
			}
		})
	}

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (isOpen) {
			if (!invoiceTemplates) {
				loadInvoiceTemplates();
			}
		}
	}

	const previewHtml = useMemo(() => {
		if (!selectedTemplate || !examination) return "";

		const invoiceData = examinationDataToInvoiceTemplateData(examination);
		return renderHtmlApplyDataToTiptapJsonContent(
			selectedTemplate.value || {type: "doc", content: []},
			invoiceData
		);
	}, [selectedTemplate, examination]);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className="w-full border-gray-300"
				>
					<Printer className="mr-2 h-4 w-4"/>
					In hóa đơn
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-7xl w-7xl pt-10 min-h-[822px] h-[90vh] overflow-hidden flex flex-col">
				<VisuallyHidden>
					<DialogTitle>Modal in hóa đơn</DialogTitle>
				</VisuallyHidden>
				{!isPending && invoiceTemplates ? (
					<div className="grid grid-cols-4 gap-4 h-full min-h-0">
						<div className="bg-white rounded shadow p-4 flex flex-col gap-4 h-full">
              <span className="font-semibold text-lg block border-b pb-2">
                Chọn mẫu hóa đơn
              </span>

							<div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
								{invoiceTemplates.map((template) => (
									<div
										key={template.id}
										onClick={() => setSelectedTemplate(template)}
										className={cn(
											"cursor-pointer px-4 py-3 rounded-md text-sm font-medium transition-colors border",
											selectedTemplate?.id === template.id
												? "bg-[#A6CF52] text-white border-[#A6CF52]"
												: "bg-white text-gray-700 border-gray-100 hover:bg-gray-50 hover:border-gray-200"
										)}
									>
										{template.name}
									</div>
								))}
							</div>

							<Button
								type="submit"
								size="lg"
								onClick={reactToPrintFn}
								className="w-full bg-[#A6CF52] hover:bg-[#93b848] text-white font-bold text-md shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
							>
								In
							</Button>
						</div>

						<div className="bg-gray-100 rounded shadow p-4 space-y-4 col-span-3 overflow-y-auto h-full">
							<div className="flex justify-center invoice-template">
								<div
									ref={contentRef}
									id="invoice-print"
									className="bg-white shadow-lg print:shadow-none prose prose-sm max-w-none ProseMirror preview"
									style={{
										width: "148mm",
										minHeight: "210mm",
										padding: "5mm",
										boxSizing: "border-box",
									}}
									dangerouslySetInnerHTML={{__html: previewHtml}}
								/>
							</div>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-4 gap-4 h-full min-h-0">
						<div className="bg-white rounded shadow p-4 flex flex-col gap-4 h-full">
							<div className="border-b pb-2">
								<Skeleton className="h-7 w-32"/>
							</div>
							<div className="flex-1 space-y-2 pr-1">
								{Array.from({length: 5}).map((_, i) => (
									<Skeleton key={i} className="h-12 w-full rounded-md"/>
								))}
							</div>
							<Skeleton className="h-11 w-full mt-auto"/>
						</div>

						<div className="bg-gray-100 rounded shadow p-4 space-y-4 col-span-3 overflow-hidden h-full">
							<div className="flex justify-center h-full">
								<div
									className="bg-white shadow-lg p-[5mm] box-border space-y-6"
									style={{
										width: "148mm",
										height: "210mm",
									}}
								>
									<div className="flex justify-center mb-8">
										<Skeleton className="h-8 w-48"/>
									</div>
									<div className="flex justify-between gap-8">
										<div className="space-y-2 w-1/2">
											<Skeleton className="h-4 w-full"/>
											<Skeleton className="h-4 w-3/4"/>
											<Skeleton className="h-4 w-5/6"/>
										</div>
										<div className="space-y-2 w-1/2">
											<Skeleton className="h-4 w-full"/>
											<Skeleton className="h-4 w-2/3"/>
										</div>
									</div>
									<div className="pt-4 space-y-3">
										<Skeleton className="h-10 w-full"/>
										<Skeleton className="h-8 w-full"/>
										<Skeleton className="h-8 w-full"/>
										<Skeleton className="h-8 w-full"/>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}