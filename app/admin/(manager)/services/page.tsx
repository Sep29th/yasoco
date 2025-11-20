import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, Edit3, Trash2, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getPaginationServices, getServiceById } from "@/lib/service";
import { getExaminationFee } from "@/lib/examination-fee";
import { deleteServiceAction } from "./_actions/delete";
import ServiceModalContent from "./_components/modal-content";
import ExaminationFeeClient from "./_components/examination-fee-client";

type PropsType = {
  searchParams: Promise<{ page?: string; error?: string; modal?: string }>;
};

export default async function ServicesPage({ searchParams }: PropsType) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("service:read")) {
    redirect("/admin/forbidden");
  }

  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) || "1", 10) || 1);
  const pageSize = 10;

  const { total, services } = await getPaginationServices(page, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fee = await getExaminationFee();
  const canEditFee = auth.permissions.includes("service:update");

  const spTyped = sp as Record<string, string | undefined>;
  const errorMessage =
    typeof spTyped.error === "string" ? spTyped.error.trim() : "";
  const modalId = String(spTyped.modal ?? "").trim();

  const formatDateTime = (value: Date | string) =>
    new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const modalData = modalId
    ? await getServiceById(modalId).catch(() => null)
    : null;

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dịch vụ</h1>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
          <ExaminationFeeClient
            value={fee ? fee.value : null}
            canEdit={canEditFee}
          />
          {auth.permissions.includes("service:create") && (
            <Link
              href="/admin/services/create"
              className="no-underline w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                className="cursor-pointer w-full sm:w-auto"
              >
                <Plus className="size-4 mr-2" /> Thêm dịch vụ
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="bg-white rounded shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên dịch vụ</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tạo lúc</TableHead>
              <TableHead className="text-left">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.description || "-"}</TableCell>
                <TableCell>{formatPrice(service.price)}</TableCell>
                <TableCell>{formatDateTime(service.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/services?modal=${service.id}&page=${page}`}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="cursor-pointer"
                            variant="ghost"
                            size="icon"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>Xem chi tiết</p>
                        </TooltipContent>
                      </Tooltip>
                    </Link>

                    {auth.permissions.includes("service:update") && (
                      <Link href={`/admin/services/${service.id}/edit`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="cursor-pointer"
                              variant="ghost"
                              size="icon"
                            >
                              <Edit3 className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Chỉnh sửa</p>
                          </TooltipContent>
                        </Tooltip>
                      </Link>
                    )}

                    {auth.permissions.includes("service:delete") && (
                      <Tooltip>
                        <Popover>
                          <PopoverTrigger asChild>
                            <TooltipTrigger asChild>
                              <Button
                                className="cursor-pointer"
                                variant="ghost"
                                size="icon"
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                          </PopoverTrigger>

                          <PopoverContent className="w-[260px]" side="top">
                            <p className="text-sm">
                              Bạn có chắc muốn xóa dịch vụ này không?
                            </p>

                            <form
                              action={deleteServiceAction}
                              className="mt-3 flex items-center gap-2 justify-end"
                            >
                              <input type="hidden" name="id" value={service.id} />
                              <input type="hidden" name="page" value={page} />
                              <Button
                                type="submit"
                                variant="destructive"
                                className="cursor-pointer"
                                size="sm"
                              >
                                Xóa
                              </Button>
                            </form>
                          </PopoverContent>
                        </Popover>
                        <TooltipContent side="right">
                          <p>Xóa</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {services.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center px-4 py-6 text-muted-foreground"
                >
                  Không có dịch vụ nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <nav className="flex items-center justify-between">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`?page=${Math.max(1, page - 1)}`}
                className={
                  page <= 1
                    ? "opacity-50 pointer-events-none cursor-not-allowed"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 py-1 border rounded">
                {page} / {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href={`?page=${Math.min(totalPages, page + 1)}`}
                className={
                  page >= totalPages
                    ? "opacity-50 pointer-events-none cursor-not-allowed"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </nav>

      {modalData ? <ServiceModalContent data={modalData} /> : null}
    </div>
  );
}

