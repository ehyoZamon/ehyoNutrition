import { Suspense } from "react";
import FoodDiaryClient from "./foodDiaryClient";

export default function FoodDiaryPage() {
  return (
    <Suspense fallback={null}>
      <FoodDiaryClient />
    </Suspense>
  );
}
