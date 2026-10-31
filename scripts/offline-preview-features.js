/* Local preview configuration, not application authorization or saved account data. */
(() => {
  const isDev = document.documentElement.dataset.previewAudience !== "user";
  const seed = JSON.parse(
    document.getElementById("preview-feature-config")?.textContent || "{}",
  );
  const features = { notes: seed.notes !== false };
  const previews = new Set();
  const messageType = "members-preview-features";
  const targetOrigin = location.origin === "null" ? "*" : location.origin;
  const enabled = (name) => isDev || features[name] !== false;
  function apply(root) {
    if (enabled("notes")) return;
    document.querySelector(".preview-toast")?.remove();
    root
      .querySelectorAll(
        'a[href="#screen=notes"],a[href*="screen=notes"],[data-action="save-product"]',
      )
      .forEach((element) => element.remove());
  }
  function broadcast() {
    for (const preview of previews) {
      if (preview.closed) previews.delete(preview);
      else preview.postMessage({ type: messageType, features }, targetOrigin);
    }
  }
  function userDocument() {
    const copy = document.documentElement.cloneNode(true);
    copy.dataset.previewAudience = "user";
    copy.querySelector("title").textContent =
      "Wireframe do usuário — prévia offline";
    copy.querySelector("#offline-toolbar")?.remove();
    copy
      .querySelectorAll(
        ".preview-toast,.notes-popover,.notes-resource-picker,.notes-composer",
      )
      .forEach((element) => element.remove());
    copy.querySelector("#offline-view").replaceChildren();
    copy.querySelector("#preview-feature-config").textContent =
      JSON.stringify(features);
    const snapshots = JSON.parse(copy.querySelector("#snapshots").textContent);
    for (const key of Object.keys(snapshots)) {
      const document = new DOMParser().parseFromString(
        snapshots[key],
        "text/html",
      );
      document
        .querySelectorAll(".ai-flow-studio")
        .forEach((element) => element.remove());
      snapshots[key] = document.body.innerHTML;
    }
    copy.querySelector("#snapshots").textContent = JSON.stringify(
      snapshots,
    ).replace(/</g, "\\u003c");
    return "<!doctype html>" + copy.outerHTML;
  }
  document
    .querySelector('[data-dev-feature="notes"]')
    ?.addEventListener("change", (event) => {
      features.notes = event.target.checked;
      broadcast();
      document.getElementById("dev-feature-status").textContent = features.notes
        ? "Minhas anotações ativadas na visão do usuário."
        : "Minhas anotações desativadas na visão do usuário. O Dev mantém acesso para testes.";
    });
  document
    .querySelector("[data-open-user-preview]")
    ?.addEventListener("click", () => {
      const preview = window.open("", "_blank");
      if (!preview) {
        document.getElementById("dev-feature-status").textContent =
          "Permita abrir a nova aba ou baixe a versão do usuário configurada.";
        return;
      }
      previews.add(preview);
      preview.document.open();
      preview.document.write(userDocument());
      preview.document.close();
    });
  document
    .querySelector("[data-download-user-preview]")
    ?.addEventListener("click", () => {
      const url = URL.createObjectURL(
        new Blob([userDocument()], { type: "text/html;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "wireframe.usuario.html";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin) return;
    if (isDev) {
      if (
        previews.has(event.source) &&
        event.data?.type === messageType + "-ready"
      )
        broadcast();
      return;
    }
    if (
      event.source !== window.opener ||
      !window.opener ||
      event.data?.type !== messageType ||
      typeof event.data.features?.notes !== "boolean"
    )
      return;
    if (features.notes === event.data.features.notes) return;
    features.notes = event.data.features.notes;
    document.getElementById("preview-feature-config").textContent =
      JSON.stringify(features);
    window.dispatchEvent(new Event("previewfeatureschange"));
  });
  window.previewFeatures = { isEnabled: enabled, apply };
  if (!isDev && window.opener)
    window.opener.postMessage({ type: messageType + "-ready" }, targetOrigin);
})();
