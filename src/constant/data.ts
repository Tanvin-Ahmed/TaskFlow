import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ChartGantt,
  Grid2X2,
  Layers3,
  Search,
  Settings,
  ShieldAlert,
  User,
  Users,
} from "lucide-react";

export const sidebarData = {
  quickLink: [
    {
      id: crypto.randomUUID(),
      label: "Dashboard",
      Icon: Grid2X2,
      link: "/dashboard",
    },
    {
      id: crypto.randomUUID(),
      label: "Timeline",
      Icon: ChartGantt,
      link: "/timeline",
    },
    {
      id: crypto.randomUUID(),
      label: "Search",
      Icon: Search,
      link: "/search",
    },
    {
      id: crypto.randomUUID(),
      label: "Settings",
      Icon: Settings,
      link: "/settings",
    },
    {
      id: crypto.randomUUID(),
      label: "Users",
      Icon: User,
      link: "/users",
    },
    {
      id: crypto.randomUUID(),
      label: "Teams",
      Icon: Users,
      link: "/teams",
    },
  ],
  priorityLinks: [
    {
      id: crypto.randomUUID(),
      label: "Urgent",
      Icon: AlertCircle,
      link: "/priority/urgent",
    },
    {
      id: crypto.randomUUID(),
      label: "High",
      Icon: ShieldAlert,
      link: "/priority/high",
    },
    {
      id: crypto.randomUUID(),
      label: "Medium",
      Icon: AlertTriangle,
      link: "/priority/medium",
    },
    {
      id: crypto.randomUUID(),
      label: "Low",
      Icon: AlertOctagon,
      link: "/priority/low",
    },
    {
      id: crypto.randomUUID(),
      label: "Backlog",
      Icon: Layers3,
      link: "/priority/backlog",
    },
  ],
};
