"use client";

import { Button } from "@/components/ui/button";
import { Package, Settings, Database, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ 
  products = [], 
  activeTab, 
  activeView,
  onTabChange, 
  onDefineProduct,
  onViewChange,
  className 
}) {
  return (
    <div className={cn("w-64 bg-background border-r border-border flex flex-col h-full hidden md:flex", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="space-y-1">
          <button
            onClick={() => onViewChange('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "text-sm font-medium",
              activeView === 'dashboard' && "bg-accent text-accent-foreground"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={onDefineProduct}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "text-sm font-medium",
              activeView === 'define' && "bg-accent text-accent-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Define Product
          </button>

          <button
            onClick={() => onViewChange('list')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "text-sm font-medium",
              activeView === 'list' && "bg-accent text-accent-foreground"
            )}
          >
            <Database className="h-4 w-4" />
            Scissors Database
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Products
          </h3>
          
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No products yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first product to start generating SKUs
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {products.map((product) => (
                <Button
                  key={product.id}
                  variant={activeTab === product.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => onTabChange(product.id)}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">{product.name}</span>
                    {product.baseSku && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {product.baseSku}
                      </span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
