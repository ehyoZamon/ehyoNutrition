import { Suspense } from "react";
import SettingsClient from "./settingsClient";

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsClient />
    </Suspense>
  );
}
