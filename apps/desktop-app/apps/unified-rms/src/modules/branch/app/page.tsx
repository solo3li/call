"use client";
import { useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-neo-bg flex items-center justify-center font-cairo">
      <div className="text-xl font-black animate-pulse">جاري التوجيه...</div>
    </div>
  );
}
