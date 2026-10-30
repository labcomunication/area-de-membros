"use client";
import { WireframeState } from "@/components/wireframe-state";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="main-content">
      <h1>Não foi possível abrir esta página</h1>
      <WireframeState
        kind="error"
        title="Algo não saiu como esperado"
        onRetry={reset}
      />
    </main>
  );
}
