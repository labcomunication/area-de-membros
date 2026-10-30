import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const production = process.env.TEST_PRODUCTION === "1";
const screens = [
  "login",
  "sent",
  "verify",
  "home",
  "article",
  "category",
  "products",
  "product",
  "module",
  "bonus",
  "offers",
  "locked",
  "support",
  "account",
  "not-found",
];
for (const screen of screens) {
  test(`wireframe ${screen} renders without horizontal page overflow`, async ({
    page,
  }) => {
    test.skip(production, "Local gallery must not exist in production");
    await page.goto(`/wireframes?screen=${screen}`);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByText("Dados fictícios", { exact: false }).first(),
    ).toBeVisible();
  });
}
for (const state of ["empty", "loading", "error", "pending", "expired"]) {
  test(`state ${state} is available on every screen`, async ({ page }) => {
    test.skip(production);
    for (const screen of screens) {
      await page.goto(`/wireframes?screen=${screen}&state=${state}`);
      await expect(
        page.locator(`[data-state="${state}"]:visible`),
      ).toBeVisible();
    }
  });
}
test("shell navigation and mobile drawer work", async ({ page }, info) => {
  test.skip(production);
  await page.goto("/wireframes?screen=home");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Mais opções" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mais opções" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Mais opções" })
      .getByRole("link", { name: "Suporte", exact: true })
      .click();
  } else {
    await page
      .getByRole("navigation", { name: "Principal" })
      .getByRole("link", { name: "Suporte", exact: true })
      .click();
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Como podemos ajudar?",
  );
});
test("owned products and offers are mutually exclusive", async ({ page }) => {
  test.skip(production);
  await page.goto("/wireframes?screen=products");
  await expect(page.locator('[data-product="doces-base"]')).toBeVisible();
  await expect(
    page.locator('.product-card[data-product="precificacao"]'),
  ).toHaveCount(0);
  await page.goto("/wireframes?screen=offers");
  await expect(page.locator('[data-product="precificacao"]')).toBeVisible();
  await expect(page.locator('[data-product="doces-base"]')).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Quero agora" }).first(),
  ).toBeDisabled();
});
test("pending and locked materials expose no viewer or download", async ({
  page,
}) => {
  test.skip(production);
  for (const screen of ["module", "locked"]) {
    await page.goto(`/wireframes?screen=${screen}`);
    await expect(page.locator("iframe,video,a[download]")).toHaveCount(0);
  }
  await page.goto("/wireframes?screen=module");
  await expect(page.getByRole("button", { name: "Baixar PDF" })).toBeDisabled();
});
test("product filters and tabs change content", async ({ page }) => {
  test.skip(production);
  await page.goto("/wireframes?screen=products");
  await page.getByRole("button", { name: "Bônus", exact: true }).click();
  await expect(page.locator('[data-product="doces-base"]')).toHaveCount(0);
  await expect(page.locator('[data-product="guia-medidas"]')).toBeVisible();
  await page.goto("/wireframes?screen=product");
  await page.getByRole("tab", { name: "Bônus", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Guia de medidas");
});
test("representative gallery screens have no serious accessibility violations", async ({
  page,
}) => {
  test.skip(production);
  for (const screen of ["home", "login", "products", "product", "support"]) {
    await page.goto(`/wireframes?screen=${screen}`);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});
test("protected routes deny absent or forged sessions, including deep links", async ({
  request,
}) => {
  for (const url of [
    "/area",
    "/area/produtos",
    "/area/produtos/doces-base/fundamentos",
    "/area/blog/primeiros-passos",
    "/area/blog/categoria/dicas",
    "/area/bonus",
    "/area/ofertas",
    "/area/suporte",
    "/area/conta",
  ]) {
    for (const cookie of ["", "members_session=forged"]) {
      const result = await request.get(url, {
        maxRedirects: 0,
        headers: { cookie },
      });
      expect(result.status()).toBe(307);
      const target = new URL(
        result.headers().location,
        "http://127.0.0.1:3000",
      );
      expect(target.pathname + target.search).toBe("/entrar?expirado=1");
    }
  }
});
test("root routes to login, callback refuses arbitrary token, form does not claim delivery", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/entrar$/);
  await page.goto("/entrar/verificar?token=not-a-valid-session");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Link expirado",
  );
  await page.goto("/entrar");
  await page.getByLabel("E-mail usado na compra").fill("member@example.test");
  await page
    .getByRole("button", { name: "Enviar link de acesso", exact: true })
    .click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "ainda não está disponível",
  );
  expect((await request.get("/area", { maxRedirects: 0 })).status()).toBe(307);
});
test("stubs return 501 without setting cookies", async ({ request }) => {
  for (const path of ["/api/auth/magic-link", "/api/webhooks/cakto"]) {
    const r = await request.post(path, {
      data: { email: "member@example.test" },
    });
    expect(r.status()).toBe(501);
    expect(await r.json()).toEqual({ error: "not_implemented" });
    expect(r.headers()["set-cookie"]).toBeUndefined();
  }
});
test("gallery cannot ship into production, even with query bypass attempts", async ({
  request,
}) => {
  test.skip(!production);
  for (const url of [
    "/wireframes",
    "/wireframes?screen=home",
    "/wireframes?screen=home&preview=1",
  ]) {
    expect((await request.get(url)).status()).toBe(404);
  }
});

test("changing fixture entitlements updates bonuses, catalog and no-offer state", async ({
  page,
}) => {
  test.skip(production);
  await page.goto(
    "/wireframes?screen=product&product=precificacao&profile=organizado",
  );
  await page.getByRole("tab", { name: "Bônus", exact: true }).click();
  await expect(page.locator('[data-product="checklist"]')).toContainText(
    "Ver conteúdo",
  );
  await expect(page.locator('[data-product="guia-medidas"]')).toContainText(
    "Acesso bloqueado",
  );
  await page.goto("/wireframes?screen=products&profile=nenhum");
  await expect(
    page.getByRole("heading", { name: "Você ainda não tem materiais" }),
  ).toBeVisible();
  await page.goto("/wireframes?screen=offers&profile=todos");
  await expect(
    page.getByRole("heading", { name: "Você já tem tudo! 🎉" }),
  ).toBeVisible();
  await expect(page.locator(".offer-card")).toHaveCount(0);
});

test("review regression: selected ownership survives catalog to product to module navigation", async ({
  page,
}) => {
  test.skip(production);
  await page.goto("/wireframes?screen=products&profile=organizado");
  await page
    .locator('[data-product="precificacao"]')
    .first()
    .getByRole("link", { name: "Ver conteúdo", exact: true })
    .click();
  await expect(
    page.getByRole("tab", { name: "Conteúdo", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Bônus", exact: true }).click();
  await page
    .locator('[data-product="checklist"]')
    .getByRole("link", { name: "Ver conteúdo", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Checklist da cozinha",
  );
  await page.getByRole("link", { name: /Ver primeiro módulo/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Checklist de preparo",
  );
  await expect(page).toHaveURL(/profile=organizado/);
});
test("review regression: public support is reachable without a session", async ({
  page,
}) => {
  await page.goto("/entrar");
  await page
    .getByRole("link", { name: "Fale com o suporte", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Como podemos ajudar?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Perguntas frequentes" }),
  ).toBeVisible();
});
test("review regression: a filtered featured story opens that story and its own category", async ({
  page,
}) => {
  test.skip(production);
  await page.goto("/wireframes?screen=home");
  await page.getByLabel("Buscar publicações").fill("caderno");
  await page
    .getByRole("link")
    .filter({
      has: page.getByRole("heading", {
        name: "Um caderno para guardar suas descobertas",
      }),
    })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Um caderno para guardar suas descobertas",
  );
  await page.getByRole("link", { name: "organizacao", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Organização",
  );
});

test("remap: toolbar and navigation stay anchored during page scroll", async ({
  page,
}, info) => {
  test.skip(production);
  await page.goto("/wireframes?screen=home");
  const nav = page.locator(
    info.project.name === "mobile" ? ".bottom-nav" : ".sidebar",
  );
  const before = await nav.boundingBox();
  await page.evaluate(() =>
    window.scrollTo({ top: 1600, behavior: "instant" }),
  );
  const after = await nav.boundingBox();
  expect(Math.abs(after!.y - before!.y)).toBeLessThan(1);
  const toolbar = await page.locator(".gallery-toolbar").boundingBox();
  expect(toolbar!.y).toBeGreaterThanOrEqual(0);
  if (info.project.name === "desktop")
    expect(Math.abs(after!.y - (toolbar!.y + toolbar!.height))).toBeLessThan(1);
});
test("remap: library precedes welcome hero and next action respects ownership", async ({
  page,
}) => {
  test.skip(production);
  await page.goto("/wireframes?screen=home&profile=organizado");
  const library = await page
    .getByRole("heading", { name: "Seus Produtos", exact: true })
    .boundingBox();
  const hero = await page.locator(".welcome-hero").boundingBox();
  expect(library!.y).toBeLessThan(hero!.y);
  await page
    .locator(".learning-next")
    .getByRole("link", { name: "Ver materiais", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Custos e organização",
  );
  await expect(
    page.getByRole("tab", { name: "Conteúdo", exact: true }),
  ).toBeVisible();
});
test("remap: closing mobile navigation restores keyboard focus", async ({
  page,
}, info) => {
  test.skip(production || info.project.name !== "mobile");
  await page.goto("/wireframes?screen=home");
  const trigger = page.getByRole("button", {
    name: "Mais opções",
    exact: true,
  });
  await trigger.click();
  await page.getByRole("button", { name: "Fechar opções" }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#more-navigation")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
