const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const currentPage = document.body.dataset.page || "home";
const activeRoute = currentPage === "home" ? "index.html" : `${currentPage}.html`;

$$(".nav-shell nav a").forEach(link => {
  if (link.getAttribute("href") === activeRoute) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

$$("main > section[id]").forEach(section => {
  const seal = document.createElement("img");
  seal.className = "section-seal-watermark";
  seal.src = "assets/brand/personal-seal.jpg";
  seal.alt = "";
  seal.setAttribute("aria-hidden", "true");
  section.append(seal);
});

if (currentPage !== "home") {
  const pageSection = $("main > section[id]");
  const openingParagraph = pageSection
    ? $("p:not(.eyebrow):not(.map-credit):not(.journal-status)", pageSection)
    : null;
  if (pageSection && openingParagraph) {
    const identity = document.createElement("div");
    identity.className = "page-signature-identity reveal";
    identity.innerHTML = '<img src="assets/brand/signature-hero.png" alt="Signature of Dr. SHUBHAN GANDHI, B.D.S. (FPFA, USA)">';
    openingParagraph.insertAdjacentElement("afterend", identity);
  }
}

const pageRoutes = [
  ["home", "Home", "index.html"],
  ["journey", "Profile", "journey.html"],
  ["clinical", "Clinical", "clinical.html"],
  ["research", "Research", "research.html"],
  ["leadership", "Leadership", "leadership.html"],
  ["global", "Global", "global.html"],
  ["journal", "Journal", "journal.html"],
  ["archive", "Archive", "archive.html"],
  ["contact", "Contact", "contact.html"],
  ["vision", "Vision", "vision.html"]
];
const currentRouteIndex = Math.max(0, pageRoutes.findIndex(([id]) => id === currentPage));
const previousRoute = pageRoutes[(currentRouteIndex - 1 + pageRoutes.length) % pageRoutes.length];
const nextRoute = pageRoutes[(currentRouteIndex + 1) % pageRoutes.length];
const mobilePageSwitcher = document.createElement("nav");
mobilePageSwitcher.className = "mobile-page-switcher";
mobilePageSwitcher.setAttribute("aria-label", "Quick page navigation");
mobilePageSwitcher.innerHTML = `
  <a href="${previousRoute[2]}" aria-label="Previous page: ${previousRoute[1]}">←</a>
  <label>
    <span class="sr-only">Go directly to another page</span>
    <select aria-label="Go directly to another page">
      ${pageRoutes.map(([id, label, href]) => `<option value="${href}"${id === currentPage ? " selected" : ""}>${label}</option>`).join("")}
    </select>
  </label>
  <a href="${nextRoute[2]}" aria-label="Next page: ${nextRoute[1]}">→</a>
`;
document.body.append(mobilePageSwitcher);
const mobilePageSelect = $("select", mobilePageSwitcher);
mobilePageSelect?.addEventListener("change", event => {
  location.href = event.currentTarget.value;
});

const loader = $(".loader");
const dismissLoader = () => setTimeout(() => loader?.classList.add("done"), 420);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", dismissLoader, { once: true });
} else {
  dismissLoader();
}

const header = $(".nav-shell");
const progress = $(".scroll-progress span");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function initialiseSignatureMorph() {
  if (currentPage !== "home" || reducedMotion.matches) return;
  const heroSignature = $(".hero-signature-inline");
  const navigationSignature = $(".signature-logo .nav-signature");
  if (!heroSignature || !navigationSignature) return;

  const proxy = document.createElement("img");
  proxy.className = "signature-morph-proxy";
  proxy.src = heroSignature.currentSrc || heroSignature.src;
  proxy.alt = "";
  proxy.setAttribute("aria-hidden", "true");
  document.body.append(proxy);

  let origin = null;
  const measure = () => {
    const heroRect = heroSignature.getBoundingClientRect();
    origin = {
      left: heroRect.left + scrollX,
      top: heroRect.top + scrollY,
      width: heroRect.width,
      height: heroRect.height
    };
  };
  const render = () => {
    if (!origin) return;
    const target = navigationSignature.getBoundingClientRect();
    const rawProgress = Math.min(1, Math.max(0, scrollY / Math.max(260, innerHeight * .42)));
    const morphProgress = 1 - Math.pow(1 - rawProgress, 3);
    const source = {
      left: origin.left - scrollX,
      top: origin.top - scrollY,
      width: origin.width,
      height: origin.height
    };
    const blend = (from, to) => from + ((to - from) * morphProgress);
    proxy.style.left = `${blend(source.left, target.left)}px`;
    proxy.style.top = `${blend(source.top, target.top)}px`;
    proxy.style.width = `${blend(source.width, target.width)}px`;
    proxy.style.height = `${blend(source.height, target.height)}px`;
    proxy.style.opacity = String(Math.min(1, .82 + (morphProgress * .18)));
    proxy.classList.toggle("settled", rawProgress >= .995);
    document.body.style.setProperty("--signature-morph-progress", morphProgress.toFixed(3));
  };

  measure();
  document.body.classList.add("signature-morph-ready");
  render();
  window.addEventListener("resize", () => {
    measure();
    render();
  }, { passive: true });
  window.addEventListener("scroll", render, { passive: true });
}

setTimeout(initialiseSignatureMorph, 520);

let scrollFrame = 0;
window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    header?.classList.toggle("scrolled", scrollY > 40);
    const total = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${total > 0 ? Math.min(1, scrollY / total) : 0})`;
    scrollFrame = 0;
  });
}, { passive: true });

const menuButton = $(".menu-button");
const menu = $("#site-menu");
const compactNavigationWidth = 1120;
function closeMenu(restoreFocus = false) {
  if (!menu || !menuButton) return;
  menu.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("locked");
  if (innerWidth <= compactNavigationWidth) menu.inert = true;
  if (restoreFocus) menuButton.focus();
}
function syncMenuMode() {
  if (menu) menu.inert = innerWidth <= compactNavigationWidth && !menu.classList.contains("open");
}
if (menu && menuButton) {
  menuButton.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("locked", open);
    menu.inert = !open;
    if (open) $("a", menu)?.focus();
  });
  $$("a", menu).forEach(link => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.classList.contains("open")) closeMenu(true);
  });
  window.addEventListener("resize", syncMenuMode, { passive: true });
  syncMenuMode();
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.1 });
$$(".reveal").forEach(element => observer.observe(element));

let archiveItems = [];
let visibleArchiveItems = [];
let visibleJournal = [];

const dialog = $("#lightbox");
const dialogImage = $("#lightbox-image");
let viewerKind = "archive";
let activeIndex = 0;
let returnFocus;

function viewerList() {
  return viewerKind === "journal" ? visibleJournal : archiveItems;
}
function viewerPosition() {
  return Math.max(0, viewerList().findIndex(item => item.index === activeIndex));
}
function updateViewer() {
  if (!dialogImage) return;
  const list = viewerList();
  const position = viewerPosition();
  const item = list[position];
  if (!item) return;
  const src = viewerKind === "journal" ? item.src : item.originalUrl;
  dialogImage.src = src;
  dialogImage.alt = item.title;
  $("#lightbox-title").textContent = item.title;
  $("#lightbox-index").textContent = `${viewerKind.toUpperCase()} ${String(position + 1).padStart(2, "0")} OF ${list.length}`;
  $("#lightbox-original").href = src;
}
function openViewer(kind, index) {
  if (!dialog) return;
  viewerKind = kind;
  activeIndex = index;
  returnFocus = document.activeElement;
  updateViewer();
  dialog.showModal();
  document.body.classList.add("locked");
  $(".lightbox-close")?.focus();
}
function moveViewer(direction) {
  const list = viewerList();
  if (!list.length) return;
  const next = (viewerPosition() + direction + list.length) % list.length;
  activeIndex = list[next].index;
  updateViewer();
}
function closeViewer() {
  if (!dialog) return;
  dialog.close();
  document.body.classList.remove("locked");
  if (dialogImage) dialogImage.src = "";
  returnFocus?.focus();
}
if (dialog) {
  $(".lightbox-close")?.addEventListener("click", closeViewer);
  $(".lightbox-prev")?.addEventListener("click", () => moveViewer(-1));
  $(".lightbox-next")?.addEventListener("click", () => moveViewer(1));
  dialog.addEventListener("click", event => {
    if (event.target === dialog) closeViewer();
  });
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeViewer();
  });
  dialog.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") moveViewer(-1);
    if (event.key === "ArrowRight") moveViewer(1);
  });
}

function initArchive() {
  const archiveGrid = $("#archive-grid");
  if (!archiveGrid || typeof ARCHIVE_ITEMS === "undefined") return;

  const tidyTitle = (file, index) => {
    if (/ADOH2023/i.test(file)) return "ADOH 2023 invitation · Dubai, UAE";
    if (/Invitation Letter AC IADS Basel 2025/i.test(file)) return "IADS Annual Congress 2025 invitation · Basel";
    if (/MYM Azerbaijan Invitation/i.test(file)) return "IADS Mid-Year Meeting invitation · Baku, Azerbaijan";
    if (/Screenshot_20260730_203759_Samsung Notes/i.test(file)) return "IDEX Egypt 2026 presidential invitation · Cairo";
    const generic = /^(scan|doc-|screenshot|img|10000|2026\d+)/i.test(file);
    if (generic) return `Archive record ${String(index + 1).padStart(3, "0")}`;
    return file.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\(\d+\)/g, "").replace(/\b2607\d+\b/g, "").trim();
  };
  const classify = (file, index) => {
    const value = file.toLowerCase();
    if (/award|trophy|medcon|rising|fellow|pfa|recognition/.test(value) || index < 10) return "award";
    if (/iads|delegate|exchange|azer|egypt|visa|invitation|international/.test(value)) return "international";
    if (/samsung notes/.test(value)) return "international";
    if (/president|director|leader|appointment/.test(value)) return "leadership";
    if (/publication|research|conference|workshop|certificate|course|training|dental|medicus/.test(value)) return "academic";
    return "record";
  };

  archiveItems = ARCHIVE_ITEMS.map((item, index) => ({
    ...item,
    originalUrl: encodeURI(item.originalUrl),
    thumbnail: encodeURI(item.thumbnail),
    index,
    title: tidyTitle(item.original, index),
    category: classify(item.original, index)
  }));

  let currentFilter = "all";
  let query = "";
  const resultCount = $("#result-count");
  const archiveCard = item => `<button type="button" class="archive-card" data-index="${item.index}" aria-label="${item.type === "document" ? "Open document" : "View"} ${item.title}">
    <span class="image-wrap"><img src="${item.thumbnail}" alt="" loading="lazy" decoding="async"><span class="number">${String(item.index + 1).padStart(3, "0")}</span></span>
    <small>${item.category}</small><h3>${item.title}</h3>
  </button>`;
  const render = () => {
    visibleArchiveItems = archiveItems.filter(item => {
      const filterMatch = currentFilter === "all" || item.category === currentFilter;
      const queryMatch = `${item.title} ${item.original} ${item.category}`.toLowerCase().includes(query);
      return filterMatch && queryMatch;
    });
    archiveGrid.innerHTML = visibleArchiveItems.map(archiveCard).join("");
    if (resultCount) resultCount.textContent = `${visibleArchiveItems.length} of ${archiveItems.length} records shown`;
    $$(".archive-card", archiveGrid).forEach(card => card.addEventListener("click", () => {
      const item = archiveItems[Number(card.dataset.index)];
      if (item.type === "document") window.open(item.originalUrl, "_blank", "noopener");
      else openViewer("archive", item.index);
    }));
  };

  $("#archive-search")?.addEventListener("input", event => {
    query = event.target.value.trim().toLowerCase();
    render();
  });
  $$(".filters button").forEach(button => button.addEventListener("click", () => {
    $$(".filters button").forEach(item => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    currentFilter = button.dataset.filter;
    render();
  }));
  if ($("#all-count")) $("#all-count").textContent = archiveItems.length;
  render();
}

function initFeaturedCredentials() {
  const featuredGrid = $("#featured-grid");
  if (!featuredGrid || typeof ARCHIVE_ITEMS === "undefined") return;
  if (!archiveItems.length) {
    archiveItems = ARCHIVE_ITEMS.map((item, index) => ({
      ...item,
      originalUrl: encodeURI(item.originalUrl),
      thumbnail: encodeURI(item.thumbnail),
      index,
      title: `Archive record ${String(index + 1).padStart(3, "0")}`
    }));
  }
  const featuredIndices = [1, 2, 4, 7];
  featuredGrid.innerHTML = featuredIndices.map(index => {
    const item = archiveItems[index];
    return `<button type="button" class="featured-card reveal visible" data-index="${index}" aria-label="View ${item.title}">
      <img src="${item.thumbnail}" alt="" loading="lazy"><div><small>Featured credential</small><h3>${item.title}</h3></div>
    </button>`;
  }).join("");
  $$(".featured-card", featuredGrid).forEach(card => {
    card.addEventListener("click", () => openViewer("archive", Number(card.dataset.index)));
  });
}

function initJournal() {
  const journalGrid = $("#journal-grid");
  const tools = $(".journal-tools");
  if (!journalGrid || !tools || typeof JOURNAL_ITEMS === "undefined") return;

  const status = $("#journal-status");
  const categories = ["All", ...new Set(JOURNAL_ITEMS.map(item => item.category))];
  let filter = "All";
  tools.innerHTML = categories.map((category, index) =>
    `<button type="button" data-category="${category}" class="${index === 0 ? "active" : ""}" aria-pressed="${index === 0}">${category}</button>`
  ).join("");

  const render = () => {
    visibleJournal = JOURNAL_ITEMS.map((item, index) => ({ ...item, index }))
      .filter(item => filter === "All" || item.category === filter);
    journalGrid.innerHTML = visibleJournal.map((item, index) => {
      const featureClass = index % 11 === 0 ? " journal-feature" : index % 7 === 0 ? " journal-tall" : "";
      return `<button type="button" class="journal-card${featureClass}" data-index="${item.index}" aria-label="Open ${item.title}">
        <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" style="object-position:${item.focal}">
        <span><small>${item.category}</small><strong>${item.title}</strong></span>
      </button>`;
    }).join("");
    if (status) status.textContent = `${visibleJournal.length} photographs · ${filter === "All" ? "complete journal" : filter}`;
    $$(".journal-card", journalGrid).forEach(card => {
      card.addEventListener("click", () => openViewer("journal", Number(card.dataset.index)));
    });
  };
  $$("button", tools).forEach(button => button.addEventListener("click", () => {
    $$("button", tools).forEach(item => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    filter = button.dataset.category;
    render();
  }));
  render();
}

function initFilms() {
  const filmGrid = $("#film-grid");
  if (!filmGrid) return;
  const sources = ["01", "02", "03", "04", "06", "07", "09"];
  filmGrid.innerHTML = sources.map((sourceNumber, index) => {
    const number = String(index + 1).padStart(2, "0");
    return `<article class="film-card reveal visible">
      <video controls playsinline preload="metadata" aria-label="Professional field film ${number}">
        <source src="public/films/film-${sourceNumber}.mp4" type="video/mp4">
        Your browser does not support embedded video.
      </video>
      <div><strong>Field film ${number}</strong><span>ORIGINAL MEDIA</span></div>
    </article>`;
  }).join("");
  $$("video", filmGrid).forEach(video => video.addEventListener("play", () => {
    $$("video", filmGrid).forEach(other => {
      if (other !== video) other.pause();
    });
  }));
}

function initMap() {
  const worldLand = $("#world-land");
  const mapTabs = $(".map-tabs");
  const markers = $("#markers");
  const routes = $("#routes");
  if (!worldLand || !mapTabs || !markers || !routes || typeof WORLD_PATH === "undefined") return;

  const project = (longitude, latitude) => ({
    x: ((longitude + 180) / 360) * 1200,
    y: ((90 - latitude) / 180) * 600
  });
  const places = [
    { name: "New Delhi, India", lon: 77.2090, lat: 28.6139, note: "Clinical, academic and leadership foundation" },
    { name: "Strasbourg, France", lon: 7.7521, lat: 48.5734, note: "International clinical learning and professional engagement" },
    { name: "Geneva, Switzerland", lon: 6.1432, lat: 46.2044, note: "International professional engagement" },
    { name: "Istanbul, Türkiye", lon: 28.9784, lat: 41.0082, note: "International assembly engagement" },
    { name: "Alexandria, Egypt", lon: 29.9187, lat: 31.2001, note: "International clinical exchange and dialogue" },
    { name: "Baku, Azerbaijan", lon: 49.8671, lat: 40.4093, note: "Delegate correspondence preserved in the archive" },
    { name: "Dubai, UAE", lon: 55.2708, lat: 25.2048, note: "ADOH 2023 invitation preserved in the evidence archive" }
  ].map(place => ({ ...place, ...project(place.lon, place.lat) }));

  const home = places[0];
  worldLand.setAttribute("d", WORLD_PATH);
  places.forEach((place, index) => {
    mapTabs.insertAdjacentHTML("beforeend", `<button type="button" data-place="${index}" class="${index === 0 ? "active" : ""}" aria-pressed="${index === 0}">${place.name.split(",")[0]}</button>`);
    markers.insertAdjacentHTML("beforeend", `<g class="map-marker ${index === 0 ? "active" : ""}" data-place="${index}" tabindex="0" role="button" aria-label="${place.name}: ${place.note}" transform="translate(${place.x.toFixed(2)} ${place.y.toFixed(2)})"><circle r="6"></circle><text x="13" y="5">${place.name.split(",")[0]}</text></g>`);
    if (index) {
      const controlX = (home.x + place.x) / 2;
      const controlY = Math.min(home.y, place.y) - 68;
      routes.insertAdjacentHTML("beforeend", `<path class="route" d="M${home.x.toFixed(2)} ${home.y.toFixed(2)} Q${controlX.toFixed(2)} ${controlY.toFixed(2)} ${place.x.toFixed(2)} ${place.y.toFixed(2)}"></path>`);
    }
  });
  const selectPlace = index => {
    const place = places[index];
    $$(".map-marker").forEach((marker, markerIndex) => marker.classList.toggle("active", markerIndex === index));
    $$(".map-tabs button").forEach((button, buttonIndex) => {
      button.classList.toggle("active", buttonIndex === index);
      button.setAttribute("aria-pressed", String(buttonIndex === index));
    });
    $("#map-status").innerHTML = `<strong>${place.name}</strong><span>${place.note}</span>`;
  };
  $$(".map-tabs button").forEach((button, index) => button.addEventListener("click", () => selectPlace(index)));
  $$(".map-marker").forEach((marker, index) => {
    marker.addEventListener("click", () => selectPlace(index));
    marker.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectPlace(index);
      }
    });
  });
}

function initContact() {
  const contactForm = $("#contact-form");
  if (!contactForm) return;
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const values = Object.fromEntries(new FormData(contactForm).entries());
    const subject = `${values.type} enquiry from ${values.name}`;
    const body = [
      "Dear Dr. SHUBHAN GANDHI, B.D.S. (FPFA, USA),",
      "",
      values.message,
      "",
      "Contact details",
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Organisation: ${values.organisation || "Not provided"}`,
      `Enquiry type: ${values.type}`
    ].join("\n");
    $("#contact-form-status").textContent = "Your email application is opening with the completed message.";
    window.location.href = `mailto:dr.shubhangandhi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

initArchive();
initFeaturedCredentials();
initJournal();
initFilms();
initMap();
initContact();
