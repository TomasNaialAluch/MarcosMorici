"use client";

import { usePathname } from "next/navigation";
import Loader from "@/components/Loader";

export default function HomeOnlyLoader() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return <Loader />;
}

