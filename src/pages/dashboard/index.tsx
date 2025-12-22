import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardIndex() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Placeholder redirect logic: replace with real role check
    const role = user?.role || "customer"; // TODO: read from auth/session
    if (role === "customer") router.replace("/dashboard/customer");
    else if (role === "fundi" || role === "both")
      router.replace("/dashboard/fundi");
    else if (role === "admin") router.replace("/dashboard/admin");
  }, [router]);

  return (
    <>
      <p>Redirecting to your dashboard…</p>
    </>
  );
}
