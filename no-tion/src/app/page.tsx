"use client";
import Navbar from "@/components/Navbar";
import TableStacks from "@/components/TableStacks";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/hooks/useSession";
import { redirect } from "next/navigation";

export default function Home() {
  const { data, isLoading } = useSession();

  if (isLoading) return (
    <>
      <>
        <Navbar />
        <div className="flex justify-center h-screen bg-[#2a2a2a]">
          <div className="flex flex-col gap-4">
            <TableStacks isLoading={isLoading} />
          </div>
        </div>
      </>

    </>
  )

  if (!data?.authenticated) return redirect("/auth");


  return (
    <>
      <>
        <Navbar />
        <div className="flex justify-center h-screen bg-[#2a2a2a]">
          <div className="flex flex-col gap-4">
            <TableStacks isLoading={isLoading} />
          </div>
        </div>
      </>

    </>
  );
}
