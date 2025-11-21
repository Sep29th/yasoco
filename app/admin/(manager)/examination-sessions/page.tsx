import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getExaminationSessionsByDay } from "@/lib/examination-session";
import ExaminationSessionsClient from "./_components/examination-sessions-client";

export default async function ExaminationSessionsPage() {
  const auth = await requireAuth();

  if (!auth.permissions.includes("examination-session:read")) {
    redirect("/admin/forbidden");
  }

  const data = await getExaminationSessionsByDay();
  const canEdit = auth.permissions.includes("examination-session:update");

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Giờ khám</h1>
        <p className="text-sm text-muted-foreground">
          Thiết lập các khung giờ khám có thể đặt lịch cho từng ngày trong tuần.
        </p>
      </header>

      <ExaminationSessionsClient initialData={data} canEdit={canEdit} />
    </div>
  );
}
