import WeekSchedule from "./WeekSchedule";
import { getSchedule } from "@/actions/schedule";
import { getServerUser } from "@/lib/server-session";

export default async function SchedulePage() {
  const [scheduleData, user] = await Promise.all([getSchedule(), getServerUser()]);
  const isManager = user?.role === "ADMIN";

  return (
    <WeekSchedule
      employees={scheduleData.employees}
      shifts={scheduleData.shifts}
      locations={scheduleData.locations}
      isManager={isManager}
    />
  );
}
