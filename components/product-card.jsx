"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Scissors, Hash, Palette, Ruler, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ productData, serialNumber, sku }) {
  const { toast } = useToast();

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: `${label} copied successfully`,
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  // Si no hay datos, mostrar mensaje de placeholder
  if (!productData || Object.values(productData).every(value => value === "")) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Scissors className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Complete the form to see product details</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        {/* Product Details List */}
      <div className="space-y-3">
        <div className="space-y-2 text-sm">
          {productData.typeOfShears && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Type of Shears:</span>
              <span className="capitalize text-gray-900 dark:text-gray-100">{productData.typeOfShears}</span>
            </div>
          )}
          
          {serialNumber && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Serial Number:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{serialNumber}</span>
            </div>
          )}
          
          {productData.segment && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Segment:</span>
              <span className="capitalize text-gray-900 dark:text-gray-100">{productData.segment}</span>
            </div>
          )}
          
          {productData.size && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Size:</span>
              <span className="text-gray-900 dark:text-gray-100">{productData.size}"</span>
            </div>
          )}
          
          {productData.numberOfTeeth && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Number of teeth:</span>
              <span className="text-gray-900 dark:text-gray-100">{productData.numberOfTeeth}T</span>
            </div>
          )}
          
          {productData.color && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Color:</span>
              <span className="text-gray-900 dark:text-gray-100">{productData.color}</span>
            </div>
          )}
        </div>
      </div>


      {/* Serial Number Section */}
      {serialNumber && (
        <div className="border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-blue-900 dark:text-blue-100">
              Serial Number:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(serialNumber, "Serial Number")}
              className="border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900/30"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy Serial
            </Button>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">
              {serialNumber}
            </span>
          </div>
        </div>
      )}

      {/* Generated SKU Section */}
      {sku && (
        <div className="border border-gray-200 bg-gray-50 dark:bg-gray-950/20 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              Generated SKU:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(sku, "SKU")}
              className="border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900/30"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy SKU
            </Button>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <span className="font-mono font-bold text-gray-900 dark:text-gray-100 text-lg">
              {sku}
            </span>
          </div>
        </div>
      )}

      
    </div>
  );
}
