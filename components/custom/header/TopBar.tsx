import { CalendarDays, Users, UmbrellaIcon, ShieldCheck, Settings, Home } from "lucide-react";
import { getServerUser } from "@/lib/server-session";
import TopBarClient from "@/components/custom/header/TopBarClient";

const navItems = (pendingCount = 0) => [
  {
    href: "/",
    label: "Home",
    // icon: Home,
    managerOnly: false,
    badge: 0,
  },
  {
    href: "/schedule",
    label: "Schedule",
    // icon: CalendarDays,
    managerOnly: false,
    badge: 0,
  },
  {
    href: "/timeoff",
    label: "Time Off",
    // icon: UmbrellaIcon,
    managerOnly: false,
    badge: pendingCount > 0 ? pendingCount : 0,
  },
  {
    href: "/request",
    label: "Requests",
    // icon: ShieldCheck,
    managerOnly: true,
    badge: 0,
  },
  {
    href: "/employees",
    label: "Employees",
    // icon: Users,
    managerOnly: true,
    badge: 0,
  },
  {
    href: "/settings",
    label: "Settings",
    // icon: Settings,
    managerOnly: true,
    badge: 0,
  },
];

export default async function TopBar() {
  const user = await getServerUser();
  const isManager = user?.role === "ADMIN";
  const filteredNavItems = navItems().filter((item) => !item.managerOnly || isManager);
  const topBarUser = user
    ? {
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      }
    : null;

  return <TopBarClient user={topBarUser} navItems={filteredNavItems} isManager={isManager} />;
}
