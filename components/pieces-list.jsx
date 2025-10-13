"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { NewPieceDialog } from "./new-piece-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PiecesList({ pieces, variants, onUpdate }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pieceToDelete, setPieceToDelete] = useState(null);
  const { toast } = useToast();

  const handleAddPiece = (name, value) => {
    const newPiece = {
      id: nanoid(),
      name,
      value,
      isActive: true,
    };
    onUpdate([...pieces, newPiece]);
    toast({
      title: "The piece was added",
      description: `${name} has been successfully added.`,
    });
  };

  const handleDeletePiece = (pieceId) => {
    const isUsedInVariant = variants.some((variant) =>
      variant.pieceIds.some((piece) => piece.id === pieceId)
    );

    if (isUsedInVariant) {
      setPieceToDelete(pieceId);
      setIsAlertOpen(true);
    } else {
      onUpdate(pieces.filter((p) => p.id !== pieceId));
      toast({
        title: "Piece deleted",
        description: "The piece has been successfully deleted.",
      });
    }
  };

  const confirmDelete = () => {
    if (pieceToDelete) {
      onUpdate(pieces.filter((p) => p.id !== pieceToDelete));
      setPieceToDelete(null);
      setIsAlertOpen(false);
      toast({
        title: "The piece was deleted",
        description:
          "The piece was removed from the related variants and successfully deleted.",
      });
    }
  };

  const handleToggleActive = (pieceId) => {
    onUpdate(
      pieces.map((piece) =>
        piece.id === pieceId ? { ...piece, isActive: !piece.isActive } : piece
      )
    );
  };

  const handleValueChange = (pieceId, value) => {
    onUpdate(
      pieces.map((piece) =>
        piece.id === pieceId ? { ...piece, value } : piece
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-light">Pieces</CardTitle>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Piece
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pieces.map((piece) => (
          <div key={piece.id} className="flex items-center gap-2">
            <Switch
              checked={piece.isActive}
              onCheckedChange={() => handleToggleActive(piece.id)}
            />
            <Input value={piece.name} readOnly className="flex-1 min-w-24" />
            <Input
              value={piece.value}
              onChange={(e) => handleValueChange(piece.id, e.target.value)}
              placeholder="SKU suffix"
              className="min-w-24 w-44"
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeletePiece(piece.id)}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {pieces?.length === 0 && (
          <div className="text-center text-sm">No pieces for this product</div>
        )}
      </CardContent>

      <NewPieceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddPiece}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Piece</AlertDialogTitle>
            <AlertDialogDescription>
              This piece is used in one or more variants. Deleting it will also
              remove it from those variants. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPieceToDelete(null);
                setIsAlertOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
