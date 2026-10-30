import Link from "next/link";
import { Support } from "@/components/member-pages";
export default function Help() {
  return (
    <main className="main-content">
      <Support preview={false} />
      <Link className="text-link" href="/entrar">
        Voltar à tela de acesso
      </Link>
    </main>
  );
}
