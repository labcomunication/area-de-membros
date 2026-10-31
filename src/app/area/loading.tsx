import { MembersShell } from "@/components/members-shell";
import { WireframeState } from "@/components/wireframe-state";
export default function Loading() {
  return (
    <MembersShell>
      <WireframeState kind="loading" title="Carregando" />
    </MembersShell>
  );
}
