import { products } from "@/config/members";
import { WireframeState } from "./wireframe-state";
import { AssetPlaceholder } from "./product-card";
export function Offers({ entitlements }: { entitlements: readonly string[] }) {
  const offers = products.filter((p) => !entitlements.includes(p.id));
  if (offers.length === 0)
    return <WireframeState kind="empty" title="Você já tem tudo! 🎉" />;
  return (
    <div className="offers-grid">
      {offers.map((product) => (
        <article
          className="offer-card"
          key={product.id}
          data-product={product.id}
        >
          <AssetPlaceholder label={product.cover.slot} />
          <div>
            <span className="offer-badge">Apenas para membros</span>
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <p className="price">
              <span>R$ —,—</span> <s>R$ —,—</s>
            </p>
            <p className="microcopy">Preço a definir</p>
            <button className="button buy" disabled>
              Quero agora
            </button>
            <p className="microcopy">Oferta em preparação</p>
          </div>
        </article>
      ))}
    </div>
  );
}
