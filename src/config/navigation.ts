import type { Screen } from "./members";
export const navigation: {
  screen: Screen;
  label: string;
  icon: string;
  path: string;
}[] = [
  { screen: "home", label: "Início", icon: "⌂", path: "/area" },
  {
    screen: "products",
    label: "Meus Produtos",
    icon: "▦",
    path: "/area/produtos",
  },
  { screen: "bonus", label: "Bônus", icon: "◇", path: "/area/bonus" },
  {
    screen: "offers",
    label: "Ofertas Especiais",
    icon: "◈",
    path: "/area/ofertas",
  },
  { screen: "support", label: "Suporte", icon: "☏", path: "/area/suporte" },
  { screen: "account", label: "Minha conta", icon: "○", path: "/area/conta" },
];
export function screenHref(
  screen: Screen,
  preview: boolean,
  product?: string,
  module?: string,
): string {
  if (preview)
    return `/wireframes?screen=${screen}${product ? "&product=" + encodeURIComponent(product) : ""}${module ? "&module=" + encodeURIComponent(module) : ""}`;
  const entry = navigation.find((n) => n.screen === screen);
  if (entry) return entry.path;
  const id = encodeURIComponent(product ?? "doces-base");
  const paths: Partial<Record<Screen, string>> = {
    login: "/entrar",
    sent: "/entrar/enviado",
    verify: "/entrar/verificar",
    article: "/area/blog/primeiros-passos",
    category: "/area/blog/categoria/dicas",
    product: `/area/produtos/${id}`,
    locked: `/area/produtos/${id}`,
    module: `/area/produtos/${id}/${encodeURIComponent(module ?? "fundamentos")}`,
  };
  return paths[screen] ?? "/area";
}
