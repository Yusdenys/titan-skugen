"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Share_Tech_Mono } from "next/font/google";

const stm = Share_Tech_Mono({
  subsets: ["latin"],
  weight: ["400"], // İnce fontlar için
  display: "swap",
});

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem("dark") === "true";
    setIsDarkMode(darkMode);
    document.body.classList.toggle("dark", darkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("dark", isDarkMode);
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="flex-1 flex items-center gap-3">
          <img 
            src="/favicon.png" 
            alt="Titan SKUGen Logo" 
            className="h-8 w-8"
          />
          <h1 className={`${stm.className} text-2xl m-0 p-0`}>TITAN SKUGEN</h1>
        </div>

        <div className="flex-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 group"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            <SunIcon
              className={`group-hover:animate-swing transition-transform duration-300 ${
                isDarkMode ? "block" : "hidden"
              } h-4 w-4`}
            />
            <MoonIcon
              className={`group-hover:animate-pulse transition-transform duration-300 ${
                isDarkMode ? "hidden" : "block"
              } h-4 w-4`}
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
