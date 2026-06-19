import { router } from "expo-router";

import { ProtectedScreen } from "@/features/auth/components/ProtectedScreen";
import { ActionEntryForm } from "@/features/actions/components/ActionEntryForm";

export default function NewActionRoute() {
  return (
    <ProtectedScreen role="operator">
      <ActionEntryForm
        onCancel={() => router.back()}
        onSuccess={() => {
          router.replace("/operator");
        }}
      />
    </ProtectedScreen>
  );
}
