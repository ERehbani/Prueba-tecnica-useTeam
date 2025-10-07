import { useQuery } from "@tanstack/react-query";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo obtener la sesión");
      return res.json() as Promise<{ authenticated: boolean; user: any }>;
    },
    retry: false,
  });
}
