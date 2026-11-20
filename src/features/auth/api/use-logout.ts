import { useClerk } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut } = useClerk();

  const mutation = useMutation({
    mutationFn: async () => {
      await signOut();
      return { success: true };
    },
    onSuccess: () => {
      router.push("/sign-in");
      queryClient.invalidateQueries({ queryKey: ["current"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  return mutation;
};
