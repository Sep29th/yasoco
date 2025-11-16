import { ModalWrapper } from "@/components/modal-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoleModalLoading() {
  return (
    <ModalWrapper>
      <div className="space-y-4 py-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full rounded-md" />{" "}
      </div>
    </ModalWrapper>
  );
}
