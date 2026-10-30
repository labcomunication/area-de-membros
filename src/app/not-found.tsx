import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <span className="error-number">404</span>
      <h1>Esse caminho ainda não existe</h1>
      <p>Volte à tela de acesso para continuar.</p>
      <Link className="button" href="/entrar">
        Voltar ao início
      </Link>
    </main>
  );
}
