"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function AdWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide ads on landing page and login page
  if (pathname === "/" || pathname === "/login") {
    return null;
  }
  
  return <>{children}</>;
}
