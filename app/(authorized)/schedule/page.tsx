import WeekSchedule from "./WeekSchedule";
import { getSchedule } from "@/actions/schedule";

export default async function SchedulePage() {
  const { employees, shifts, locations } = await getSchedule();

  return (
    <WeekSchedule employees={employees} shifts={shifts} locations={locations} />
  );
}
