import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Eye, Edit3, Trash2, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { deleteRoleAction } from "./_actions/delete";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { getPaginationRoles } from "@/lib/role";
import { Badge } from "@/components/ui/badge";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function RolePage({ searchParams }: Props) {
  const auth = await requireAuth();

  if (!auth.permissions.includes("role:read")) redirect("/admin/forbidden");

  const page = Math.max(
    1,
    parseInt(((await searchParams).page as string) || "1", 10) || 1
  );
  const pageSize = 10;

  const { total, roles } = await getPaginationRoles(page, pageSize);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vai trò</h1>

        {auth.permissions.includes("role:create") && (
          <Link href="/admin/roles/create" className="no-underline">
            <Button variant="outline" size="lg" className="cursor-pointer">
              <Plus className="size-4 mr-2" /> Tạo vai trò
            </Button>
          </Link>
        )}
      </header>

      <div className="bg-white rounded shadow">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Tên</TableHead>
              <TableHead>Tạo lúc</TableHead>
              <TableHead>Action</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Badge variant="outline">{r.name}</Badge>
                </TableCell>
                <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/roles/${r.id}`}>
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

                    {auth.permissions.includes("role:update") && (
                      <Link href={`/admin/roles/${r.id}/edit`}>
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

                    {auth.permissions.includes("role:delete") && (
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
                              Bạn có chắc muốn xóa vai trò này không?
                            </p>

                            <form
                              action={deleteRoleAction}
                              method="post"
                              className="mt-3 flex items-center gap-2 justify-end"
                            >
                              <input type="hidden" name="id" value={r.id} />
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

            {roles.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center px-4 py-6 text-gray-500"
                >
                  Không có vai trò nào
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
    </div>
  );
}
