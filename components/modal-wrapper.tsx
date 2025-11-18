"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function ModalWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 0);
    return () => clearTimeout(t);
  }, []);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // remove `modal` query param and navigate to the same path
      try {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.delete("modal");
        const qs = params.toString();
        const url = qs ? `${pathname}?${qs}` : pathname || "/";
        router.replace(url);
      } catch {
        router.back();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Modal</DialogTitle>
        {children}
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
