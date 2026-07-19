"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// (dashboard)/ root — redirect to the main app
export default function DashboardRootPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard"); }, [router]);
  return null;
}
