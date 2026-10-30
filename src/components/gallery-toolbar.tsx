"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { screens, states } from "@/config/members";
export function GalleryToolbar() {
  const router = useRouter();
  const params = useSearchParams();
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    router.push("/wireframes?" + next.toString());
  }
  return (
    <div className="gallery-toolbar">
      <strong>
        Wireframes <span>Dados fictícios · revisão local</span>
      </strong>
      <label>
        Tela
        <select
          value={params.get("screen") ?? "home"}
          onChange={(e) => change("screen", e.target.value)}
        >
          {screens.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Estado
        <select
          value={params.get("state") ?? "normal"}
          onChange={(e) => change("state", e.target.value)}
        >
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label>
        Perfil
        <select
          value={params.get("profile") ?? "essencial"}
          onChange={(e) => change("profile", e.target.value)}
        >
          <option value="essencial">Essencial</option>
          <option value="organizado">Organizado</option>
          <option value="nenhum">Sem produtos</option>
          <option value="todos">Todos</option>
        </select>
      </label>
    </div>
  );
}
