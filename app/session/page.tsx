import { Suspense } from "react";
import TrainingSession from "./TrainingSession";

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="session-shell"><p>Preparando treino…</p></div>}>
      <TrainingSession />
    </Suspense>
  );
}
