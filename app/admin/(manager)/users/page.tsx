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
import { Badge } from "@/components/ui/badge";
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
import { getPaginationUser, getUserById } from "@/lib/user";
import { deleteUserAction } from "./_actions/delete";
import UserModalContent from "./_components/modal-content";

type Props = {
  searchParams: Promise<{ page?: string; error?: string; modal?: string }>;
};

export default async function UsersPage({ searchParams }: Props) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("user:read")) redirect("/admin/forbidden");

  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) || "1", 10) || 1);
  const pageSize = 10;

  const { total, users } = await getPaginationUser(page, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const spTyped = sp as Record<string, string | undefined>;
  const errorMessage =
    typeof spTyped.error === "string" ? spTyped.error.trim() : "";
  const modalId = String(spTyped.modal ?? "").trim();

  const formatDateTime = (value: Date | string) =>
    new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  const renderStatus = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) {
      return <Badge variant="destructive">Đã xóa</Badge>;
    }

    if (!isActive) {
      return <Badge variant="secondary">Đã khóa</Badge>;
    }

    return <Badge variant="outline">Đang hoạt động</Badge>;
  };

  const modalData = modalId
    ? await getUserById(modalId).catch(() => null)
    : null;

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      )}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Người dùng</h1>
        {auth.permissions.includes("user:create") && (
          <Link href="/admin/users/create" className="no-underline">
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer"
            >
              <Plus className="size-4 mr-2" /> Thêm người dùng
            </Button>
          </Link>
        )}
      </header>

      <div className="bg-white rounded shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tạo lúc</TableHead>
              <TableHead className="text-left">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  {renderStatus(Boolean(user.isActive), Boolean(user.isDeleted))}
                </TableCell>
                <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/users?modal=${user.id}&page=${page}`}>
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

                    {auth.permissions.includes("user:update") && (
                      <Link href={`/admin/users/${user.id}/edit`}>
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

                    {auth.permissions.includes("user:delete") && (
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
                              Bạn có chắc muốn xóa người dùng này không?
                            </p>

                            <form
                              action={deleteUserAction}
                              className="mt-3 flex items-center gap-2 justify-end"
                            >
                              <input type="hidden" name="id" value={user.id} />
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

            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center px-4 py-6 text-muted-foreground"
                >
                  Không có người dùng nào
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

      {modalData ? <UserModalContent data={modalData} /> : null}
    </div>
  );
}
