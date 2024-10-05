import { Grid2X2, Heart, Trash } from "lucide-react";

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
      label: "Favorites",
      Icon: Heart,
      link: "/favorites",
    },
    {
      id: crypto.randomUUID(),
      label: "Trash",
      Icon: Trash,
      link: "/trash",
    },
  ],
};
