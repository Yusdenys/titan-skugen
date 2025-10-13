import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

export function VariantDialog({
  open,
  onOpenChange,
  onSubmit,
  availablePieces,
  editingVariant,
}) {
  const [name, setName] = useState("");
  const [selectedPieces, setSelectedPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (editingVariant) {
      setName(editingVariant.name);
      // Convert old format to new format if necessary
      const pieces = Array.isArray(editingVariant.pieceIds)
        ? editingVariant.pieceIds.map((id) =>
            typeof id === "string" ? { id, quantity: 1 } : id
          )
        : [];
      setSelectedPieces(pieces);
    } else {
      setName("");
      setSelectedPieces([]);
    }
  }, [editingVariant]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && selectedPieces.length > 0) {
      onSubmit(name.trim(), selectedPieces);
      setName("");
      setSelectedPieces([]);
      onOpenChange(false);
    }
  };

  const handleAddPiece = () => {
    if (
      selectedPiece &&
      !selectedPieces.some((piece) => piece.id === selectedPiece)
    ) {
      setSelectedPieces([...selectedPieces, { id: selectedPiece, quantity }]);
      setSelectedPiece("");
      setQuantity(1); // Reset quantity to default after adding
    }
  };

  const handleRemovePiece = (pieceId) => {
    setSelectedPieces(selectedPieces.filter((piece) => piece.id !== pieceId));
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value)); // Ensure minimum value is 1
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-sm uppercase tracking-wide">
            {editingVariant ? "Edit Variant" : "Create New Variant"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {editingVariant
              ? "You can update the variant information."
              : "You can create a new variant using the active pieces."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Variant Name:</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Bed & Nightstand"
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Selected Pieces:</Label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                {selectedPieces.map((piece) => {
                  const pieceInfo = availablePieces.find(
                    (p) => p.id === piece.id
                  );
                  return pieceInfo ? (
                    <div key={pieceInfo.id} className="relative h-5">
                      {piece.quantity > 1 && (
                        <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow shadow-primary/50">
                          {piece.quantity}
                        </div>
                      )}
                      <Badge className="bg-primary/10 h-full text-primary hover:bg-primary/20 transition-colors border-0 p-0 overflow-hidden rounded-lg">
                        <div className="pl-4 text-xs tracking-wider flex items-center">
                          {pieceInfo.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePiece(pieceInfo.id)}
                          className="ml-1 h-full px-1 hover:text-destructive/90 transition-colors hover:bg-primary/30"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </div>
                  ) : null;
                })}
              </div>

              <div className="flex gap-2">
                <Select value={selectedPiece} onValueChange={setSelectedPiece}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select to add a piece" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePieces
                      .filter(
                        (piece) =>
                          !selectedPieces.some((p) => p.id === piece.id)
                      )
                      .map((piece) => (
                        <SelectItem key={piece.id} value={piece.id}>
                          {piece.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-20"
                />
                <Button
                  type="button"
                  variant="info"
                  onClick={handleAddPiece}
                  disabled={!selectedPiece}
                  className={!selectedPiece ? "disabled opacity-50" : ""}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              {editingVariant ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
