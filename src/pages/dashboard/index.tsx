import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    // Placeholder redirect logic: replace with real role check
    const role = "customer"; // TODO: read from auth/session
    if (role === "customer") router.replace("/dashboard/customer");
    else if (role === "fundi") router.replace("/dashboard/fundi");
    else if (role === "admin") router.replace("/dashboard/admin");
  }, [router]);

  return (
    <>
      <p>Redirecting to your dashboard…</p>
    </>
  );
}
