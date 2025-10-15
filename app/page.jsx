"use client";

import { useState, useEffect } from "react";
import { ProductTab } from "@/components/product-tab";
import { DefineProductPage } from "@/components/define-product-page";
import { ScissorsList } from "@/components/scissors-list";
import { ScissorsDashboard } from "@/components/scissors-dashboard";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'define', 'list', or 'product'
  const { toast } = useToast();

  useEffect(() => {
    const savedData = localStorage.getItem("titanSkugen");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setProducts(parsedData.products);
      if (parsedData.products.length > 0) {
        setActiveTab(parsedData.products[0].id);
      }
    }
  }, []);

  const saveToLocalStorage = (newProducts) => {
    localStorage.setItem(
      "titanSkugen",
      JSON.stringify({ products: newProducts })
    );
  };


  const activeProduct = products.find(p => p.id === activeTab);

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <Sidebar
        products={products}
        activeTab={activeTab}
        activeView={activeView}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
          setActiveView('product');
        }}
        onDefineProduct={() => {
          setActiveView('define');
          setActiveTab("");
        }}
        onViewChange={(view) => {
          setActiveView(view);
          setActiveTab("");
        }}
      />
      
      <main className="flex-1 overflow-y-auto md:ml-0">
        <div className="p-6">
          {activeView === 'dashboard' ? (
            <ScissorsDashboard />
          ) : activeView === 'define' ? (
            <DefineProductPage />
          ) : activeView === 'list' ? (
            <ScissorsList />
          ) : activeProduct ? (
            <ProductTab
              product={activeProduct}
              onUpdate={(updatedProduct) => {
                const newProducts = products.map((p) =>
                  p.id === updatedProduct.id ? updatedProduct : p
                );
                setProducts(newProducts);
                saveToLocalStorage(newProducts);
              }}
              onDelete={(productId) => {
                const newProducts = products.filter((p) => p.id !== productId);
                setProducts(newProducts);
                saveToLocalStorage(newProducts);
                if (newProducts.length > 0) {
                  setActiveTab(newProducts[0].id);
                } else {
                  setActiveTab("");
                  setActiveView('dashboard');
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-semibold mb-2">Welcome to Titan SKUGen</h2>
                <p className="text-muted-foreground">
                  Use the menu to navigate between Dashboard, Define Product, and Scissors Database
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
