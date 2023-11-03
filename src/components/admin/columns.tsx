import { Button } from "@/components/ui/ui/button";
import { Checkbox } from "@/components/ui/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/ui/dropdown-menu";
import {
  faArrowUpArrowDown,
  faEllipsis,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type Show } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import type { NextRouter } from "next/router";

export const columns: ({
  deleteShow,
  router,
}: {
  deleteShow: (show: Show) => void;
  router: NextRouter;
}) => ColumnDef<Show>[] = ({ deleteShow, router }) => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Start Date
          <FontAwesomeIcon icon={faArrowUpArrowDown} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorFn: (show) => show.startDate.toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const show = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={async () => {
                await router.push(`/photos/admin/shows/${show.id}`);
              }}
              className="cursor-pointer"
            >
              Manage
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                void navigator.clipboard.writeText(
                  `${window.location.origin}/photos/shows/${show.slug}`
                )
              }
              className="cursor-pointer"
            >
              Copy Show Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                deleteShow(show);
              }}
              className="cursor-pointer text-red-600 hover:text-red-900"
            >
              Delete Show
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
