import { requireAuth } from "@/lib/auth";
import { Suspense } from "react";
import Appointment from "./_components/appointment";
import Article from "./_components/article";
import User from "./_components/user";
import Tag from "./_components/tag";
import Skeleton from "./_components/skeleton";

export default async function Dashboard() {
  const auth = await requireAuth();

  const permissionsSet = new Set(auth.permissions);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tổng quan</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {permissionsSet.has("examination:read") && (
          <Suspense fallback={<Skeleton />}>
            <Appointment />
          </Suspense>
        )}
        {permissionsSet.has("article:read") && (
          <Suspense fallback={<Skeleton />}>
            <Article />
          </Suspense>
        )}
        {permissionsSet.has("user:read") && (
          <Suspense fallback={<Skeleton />}>
            <User />
          </Suspense>
        )}
        {permissionsSet.has("tag:read") && (
          <Suspense fallback={<Skeleton />}>
            <Tag />
          </Suspense>
        )}
      </div>
    </div>
  );
}
