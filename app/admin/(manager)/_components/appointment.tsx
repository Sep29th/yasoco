import { getTodayAppointmentCount } from "@/lib/examination";

export default async function Appointment() {
  const todayAppointmentCount = await getTodayAppointmentCount();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600 mb-1">Lịch khám hôm nay</p>
      <p className="text-3xl font-bold" style={{ color: "#A6CF52" }}>
        {todayAppointmentCount}
      </p>
    </div>
  );
}
