import { AlertDialog } from "@/components/global/AlertDialog";
import { NewShowDialog } from "@/components/shows/NewShowDialog";
import { Spinner } from "@/components/ui/ui/spinner";
import { api } from "@/utils/api";
import type { Show } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { columns } from "../columns";
import { DataTable } from "../data-table";

export const ShowChildrenTable = ({ id }: { id: string }) => {
  const router = useRouter();
  const { data, isLoading } = api.shows.getShowChildren.useQuery({
    id,
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showToDelete, setShowToDelete] = useState<Show | null>(null);
  const deleteShow = api.shows.delete.useMutation();
  const utils = api.useContext();

  const [newShowDialogOpen, setNewShowDialogOpen] = useState(false);
  return isLoading ? (
    <div className="mt-14 flex flex-col items-center justify-center gap-4">
      <Spinner />
      <p>Loading the sub-shows</p>
    </div>
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
        parentShowId={id}
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
  );
};
