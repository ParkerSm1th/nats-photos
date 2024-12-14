import { AlertDialog } from "@/components/global/AlertDialog";
import { NewShowDialog } from "@/components/shows/NewShowDialog";
import { Spinner } from "@/components/ui/ui/spinner";
import { api } from "@/utils/api";
import type { Show } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { columns } from "../../../../components/admin/columns";
import { DataTable } from "../../../../components/admin/data-table";

export default function Shows() {
  const { data, isLoading } = api.shows.getAll.useQuery({
    orderByStartDate: "desc",
    includeChildren: true,
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showToDelete, setShowToDelete] = useState<Show | null>(null);
  const deleteShow = api.shows.delete.useMutation();
  const utils = api.useContext();
  const router = useRouter();

  const [newShowDialogOpen, setNewShowDialogOpen] = useState(false);

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <DataTable
            columns={columns({
              deleteShow: (show) => {
                setShowToDelete(show);
                setIsDeleteOpen(true);
              },
              router,
            })}
            data={data ?? []}
            onNewClick={() => {
              setNewShowDialogOpen(true);
            }}
            newClickValue="Create Show"
          />
          <NewShowDialog
            open={newShowDialogOpen}
            onClose={() => setNewShowDialogOpen(false)}
          />
          <AlertDialog
            open={isDeleteOpen}
            onClose={() => {
              setIsDeleteOpen(false);
              setShowToDelete(null);
            }}
            title={`Delete ${showToDelete?.name}?`}
            body={`Are you sure you want to delete ${showToDelete?.name}?`}
            callback={async () => {
              if (!showToDelete) return;
              await deleteShow.mutateAsync({
                id: showToDelete.id,
              });
              await utils.shows.invalidate();
            }}
          />
        </>
      )}
    </>
  );
}
