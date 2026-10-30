import { WireframeState } from "@/components/wireframe-state";
export default function Loading() {
  return (
    <main className="main-content">
      <WireframeState kind="loading" title="Carregando" />
    </main>
  );
}
