import { canAccess } from "@/lib/auth";
import type { AppUser, ModuleKey } from "@/types/hms";

export function usePermissions() {
  return {
    canAccessModule: (user: AppUser, module: ModuleKey | string) => canAccess(user, module),
  };
}
