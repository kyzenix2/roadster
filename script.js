const SITE = {
  contract: "0xca9f238b7adce9499434df005fb91754e0e74a43",
  chainSlug: "robinhood",
  twitter: "https://x.com/flyroadster_X",
  telegram: "",
};

function realContract() {
  const value = (SITE.contract || "").trim();
  if (!value || value.toUpperCase() === "TBA") return "";
  return value;
}

function setExternal(node, enabled) {
  if (enabled) {
    node.target = "_blank";
    node.rel = "noopener noreferrer";
    node.removeAttribute("aria-disabled");
    return;
  }
  node.removeAttribute("target");
  node.removeAttribute("rel");
  node.setAttribute("aria-disabled", "true");
}

function applyContract() {
  const ca = realContract();
  const label = ca || "TBA";

  document.querySelectorAll("[data-ca]").forEach((node) => {
    node.textContent = label;
    node.title = label;
  });

  const buyHref = ca
    ? `https://app.uniswap.org/swap?chain=robinhood&outputCurrency=${encodeURIComponent(ca)}`
    : "#";

  document.querySelectorAll("[data-buy]").forEach((node) => {
    node.href = buyHref;
    setExternal(node, Boolean(ca));
  });

  const chartHref = ca ? `https://dexscreener.com/${SITE.chainSlug}/${encodeURIComponent(ca)}` : "#";

  document.querySelectorAll("[data-chart]").forEach((node) => {
    node.href = chartHref;
    setExternal(node, Boolean(ca));
  });

  const slot = document.getElementById("chart-slot");
  if (!slot || !ca) return;

  slot.textContent = "";
  const frame = document.createElement("iframe");
  frame.src = `${chartHref}?embed=1&theme=dark&trades=0&info=0`;
  frame.title = "Flying Tesla Roadster live chart on DexScreener";
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer-when-downgrade";
  slot.appendChild(frame);
}

function applySocial() {
  const twitter = (SITE.twitter || "").trim();
  document.querySelectorAll("[data-x]").forEach((node) => {
    node.href = twitter || "#";
    setExternal(node, Boolean(twitter));
  });

  if ((SITE.telegram || "").trim()) return;
  document.querySelectorAll("[data-telegram]").forEach((node) => node.remove());
}

function fallbackCopy(value) {
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

function bindCopy() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = document.querySelector("[data-ca]")?.textContent?.trim() || "TBA";
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        fallbackCopy(value);
      }

      const status = document.getElementById("copy-status");
      if (status) status.textContent = `Copied ${value}`;

      const original = button.dataset.label || "Copy";
      button.textContent = "Copied!";
      button.classList.add("is-copied");
      window.clearTimeout(button._copyTimer);
      button._copyTimer = window.setTimeout(() => {
        button.textContent = original;
        button.classList.remove("is-copied");
      }, 1600);
    });
  });
}

function bindPlaceholders() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href='#']");
    if (!link) return;
    event.preventDefault();
  });
}

function bindNav() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  const close = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-lock");
  };

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-lock", open);
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  const links = document.querySelectorAll("[data-nav]");
  const sections = [...document.querySelectorAll("main section[id]")];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

applyContract();
applySocial();
bindCopy();
bindPlaceholders();
bindNav();
