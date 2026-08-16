"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function AdWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide ads on landing page, login page, and about page
  if (pathname === "/" || pathname === "/login" || pathname === "/about") {
    return null;
  }
  
  return <>{children}</>;
}
