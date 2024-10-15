import { Button } from "@/components/ui/button";
import { Member, MemberRole } from "../types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminSwitcher, MemberTableAction } from "./column-components";

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as MemberRole;

      return (
        <Badge
          className={"text-[10px]"}
          variant={role === "ADMIN" ? "default" : "destructive"}
        >
          {role}
        </Badge>
      );
    },
  },
  {
    header: "Admin",
    cell: ({ row }) => <AdminSwitcher data={row} />,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <MemberTableAction data={row} />,
  },
];
