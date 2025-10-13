"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Clipboard, FileText } from "lucide-react";
import { PiecesList } from "./pieces-list";
import { VariantsList } from "./variants-list";
import { SkuTable } from "./sku-table";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export function ProductTab({ product, onUpdate, onDelete }) {
  const { toast } = useToast();
  const [localProduct, setLocalProduct] = useState(product);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInputChange = (field, value) => {
    const updatedProduct = { ...localProduct, [field]: value };
    setLocalProduct(updatedProduct);
    onUpdate(updatedProduct);
  };

  const handleDeleteProduct = () => {
    onDelete(localProduct.id);
    toast({
      title: "Product deleted",
      description: `${localProduct.name} has been successfully deleted.`,
    });
    setIsDialogOpen(false);
  };

  const generateSkuForVariant = (variant) => {
    const pieces = variant.pieceIds
      .map((variantPiece) => {
        const piece = localProduct.pieces.find((p) => p.id === variantPiece.id);

        if (!piece || !piece.isActive) return "";

        const quantity =
          variantPiece.quantity > 1 ? `(${variantPiece.quantity})` : "";

        return `${localProduct.baseSku}${piece.value}${quantity}`;
      })
      .filter(Boolean);

    if (pieces.length === 0) return "";

    return `${localProduct.setPrefix}${localProduct.delimiter}${pieces.join(
      localProduct.delimiter
    )}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-light">Definitions</CardTitle>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="ml-4">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this product? All variants
                    will be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProduct}>
                    Yes, delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name:</Label>
              <Input
                id="name"
                value={localProduct.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="baseSku">Base SKU:</Label>
              <Input
                id="baseSku"
                value={localProduct.baseSku}
                onChange={(e) => handleInputChange("baseSku", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="delimiter">Delimiter:</Label>
              <Input
                id="delimiter"
                value={localProduct.delimiter}
                onChange={(e) => handleInputChange("delimiter", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="setPrefix">Set Prefix:</Label>
              <Input
                id="setPrefix"
                value={localProduct.setPrefix}
                onChange={(e) => handleInputChange("setPrefix", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <PiecesList
        pieces={localProduct.pieces}
        variants={localProduct.variants}
        onUpdate={(newPieces) => handleInputChange("pieces", newPieces)}
      />

      <VariantsList
        variants={localProduct.variants}
        pieces={localProduct.pieces}
        onUpdate={(newVariants) => handleInputChange("variants", newVariants)}
        generateSku={generateSkuForVariant}
      />

      <SkuTable
        variants={localProduct.variants}
        generateSku={generateSkuForVariant}
      />
    </div>
  );
}
