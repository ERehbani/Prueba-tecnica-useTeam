"use client";
import Navbar from "@/app/widgets/Navbar/Navbar";
import TableStacks from "@/app/features/kanban/TableStacks";
import { useSession } from "@/app/features/auth/hooks/useSession";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { userStore } from "@/app/features/auth/store/userStore";

export default function Home() {
  const { data, isLoading } = useSession();
  const { setUser } = userStore()
  const router = useRouter();

  console.log(data)

  useEffect(() => {
    if (isLoading) return;
    if (!data?.authenticated) router.replace("/auth");
    setUser(data?.user)
  }, [data, isLoading, router]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center h-screen bg-[#2a2a2a]">
          <div className="flex flex-col gap-4">
            {/* spinner/skeleton si querés */}
            <TableStacks isLoading />
          </div>
        </div>
      </>
    );
  }

  if (!data?.authenticated) return null; // se está redirigiendo

  return (
    <>
      <Navbar />
      <div className="flex justify-center h-screen bg-[#2a2a2a]">
        <div className="flex flex-col gap-4">
          <TableStacks isLoading={false} />
        </div>
      </div>
    </>
  );
}
