import { MemberLink as Link } from "./member-link";
import type { Product } from "@/config/members";
import { screenHref } from "@/config/navigation";
export function AssetPlaceholder({
  label,
  variant = "cover",
}: {
  label: string;
  variant?: "cover" | "wide" | "square";
}) {
  return (
    <div
      className={`asset-placeholder ${variant}`}
      role="img"
      aria-label={`Espaço reservado: ${label}`}
    >
      <span className="placeholder-symbol" aria-hidden="true">
        ◇
      </span>
      <span>{label}</span>
    </div>
  );
}
export function ProductCard({
  product,
  preview,
  owned = true,
}: {
  product: Product;
  preview: boolean;
  owned?: boolean;
}) {
  return (
    <article className="product-card" data-product={product.id}>
      <Link
        className="cover-link"
        href={screenHref(owned ? "product" : "locked", preview, product.id)}
        aria-label={`Ver ${product.title}`}
      >
        <AssetPlaceholder label={product.cover.slot} />
        {!owned && <span className="lock-label">Bloqueado</span>}
      </Link>
      <span className="eyebrow">
        {product.kind === "bonus"
          ? "BÔNUS"
          : product.kind === "complemento"
            ? "COMPLEMENTO"
            : "COLEÇÃO"}
      </span>
      <h3>{product.title}</h3>
      <p className="card-status">
        {owned
          ? "PDF pendente — aguardando arquivo"
          : "Disponível em outra oferta"}
      </p>
      <Link
        className={`button ${owned ? "" : "outline"}`}
        href={screenHref(owned ? "product" : "locked", preview, product.id)}
      >
        {owned ? "Ver conteúdo" : "Ver oferta"}
      </Link>
      <button className="material-button" disabled>
        {owned ? "Acessar · Em breve" : "Acesso bloqueado"}
      </button>
    </article>
  );
}
