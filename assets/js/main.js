const APP_DATA_URL = "./data/app-data.json";
const LEGACY_DATA_URL = "./data/catalog-data.json";
const OFFLINE_ASSETS_URL = "./data/offline-assets.json";
const APP_VERSION_URL = "./version.json";
const SHELL_CACHE_NAME = "jianbihua-shell-v9";
const IMAGE_CACHE_NAME = "jianbihua-images-v1";
const SAVED_DATA_KEY = "jianbihua.appDataSnapshot.v1";
const STATS_KEY = "jianbihua.localStats.v1";
const DEFAULT_TERMS = ["企鹅", "蝙蝠", "蠼螋", "航天器"];
const MAX_RESULTS = 160;
const IS_ANDROID_ASSET = location.hostname === "appassets.androidplatform.net";
const IS_LOCAL_PREVIEW = ["127.0.0.1", "localhost", "::1"].includes(location.hostname);
const SECRET_SEARCH_MESSAGES = new Map([
  ["宝", "今天也要一起画点小可爱~"],
  ["杨", "小羊宝~"],
  ["相", "大象"]
]);
const HIDDEN_GALLERY_TERMS = new Set(["我们", "小画册", "宝藏"]);
const HOME_STATUS_LINES = [
  "今天也适合画点小可爱",
  "先画一笔，剩下的交给开心",
  "今天的线条会很乖",
  "搜索一下，看看谁冒出来",
  "小画册正在悄悄发光",
  "一起画画的时候最不无聊",
  "今天也给纸上留一点甜",
  "线条歪一点也很好看",
  "画不完也算认真玩过",
  "今天的灵感在眨眼",
  "先找一个顺眼的小东西",
  "小手一动，画面就醒了",
  "今天适合慢慢画",
  "画错了也可以变可爱",
  "这一页留给好心情",
  "搜索框今天很听话",
  "画一个小小的喜欢",
  "简单几笔，也算礼物",
  "今天的题目藏在书里",
  "给今天加一条线",
  "画画不是任务，是小约会",
  "先别急，先选个可爱的",
  "今天也要认真乱画",
  "小灵感排队等你点名",
  "一笔一画都算数",
  "今天的纸张准备好了",
  "看到喜欢的就点开",
  "让小图案陪你一会儿",
  "画面小小，心情大大",
  "今天也有一点点新鲜",
  "随手一画也可能很好",
  "先画轮廓，再慢慢喜欢",
  "今天的可爱额度已刷新",
  "搜索一个名字，遇见一个图案",
  "小小线条，也会记得今天",
  "画给自己，也画给对方",
  "今天不赶路，画两笔",
  "这本小书在等你翻",
  "灵感今天没有迟到",
  "笔尖一动，就有故事",
  "选一个简单的开始",
  "画得开心最重要",
  "今天也把日子画软一点",
  "一起找一个小目标",
  "可爱不需要画得很复杂",
  "留一页给我们",
  "今天的画题正在招手",
  "慢慢画，慢慢靠近"
];
const HIDDEN_GALLERY = [
  {
    id: "yang-flower-card",
    title: "会开花的小画",
    author: "杨",
    caption: "把花和线条都夹在同一个晴天里。",
    image: "./assets/easter-eggs/yang-flower-card.jpg"
  },
  {
    id: "yang-notebook-face",
    title: "纸边的小表情",
    author: "杨",
    caption: "课本边角也会偷偷长出表情。",
    image: "./assets/easter-eggs/yang-notebook-face.jpg"
  },
  {
    id: "yang-blackboard",
    title: "黑板上的小朋友",
    author: "杨",
    caption: "熊、泡泡和旁边探头的小家伙。",
    image: "./assets/easter-eggs/yang-blackboard.jpg"
  },
  {
    id: "xiang-little-friends",
    title: "小男孩和小女孩",
    author: "相",
    caption: "这一页由相画下。",
    image: "./assets/easter-eggs/xiang-little-friends.jpg"
  }
];

const state = {
  appVersion: null,
  data: null,
  books: [],
  categories: [],
  items: [],
  booksById: new Map(),
  categoriesByBook: new Map(),
  itemsById: new Map(),
  query: "",
  view: "home",
  selectedBookId: null,
  selectedCategoryId: "all",
  detailItem: null,
  detailImageIndex: 0,
  easterImageIndex: 0,
  stats: loadStats(),
  searchTimer: 0,
  lastRecordedQuery: "",
  lastRecordTime: 0,
  homeStatusIndex: -1,
  homeStatusTimer: 0,
  brandTapCount: 0,
  brandTapTimer: 0
};

const el = {
  dataBadge: document.querySelector("#data-badge"),
  brandEasterTrigger: document.querySelector("#brand-easter-trigger"),
  tabs: document.querySelectorAll("[data-view]"),
  views: {
    home: document.querySelector("#view-home"),
    library: document.querySelector("#view-library"),
    settings: document.querySelector("#view-settings")
  },
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#search-input"),
  clearSearch: document.querySelector("#clear-search"),
  searchMeta: document.querySelector("#search-meta"),
  quickTerms: document.querySelector("#quick-terms"),
  homeStatus: document.querySelector("#home-status"),
  dailyTopic: document.querySelector("#daily-topic"),
  quickStats: document.querySelector("#quick-stats"),
  homeBooks: document.querySelector("#home-books"),
  booksMeta: document.querySelector("#books-meta"),
  resultsTitle: document.querySelector("#results-title"),
  resultsSummary: document.querySelector("#results-summary"),
  results: document.querySelector("#results"),
  libraryBookFilters: document.querySelector("#library-book-filters"),
  libraryCategoryFilters: document.querySelector("#library-category-filters"),
  libraryTitle: document.querySelector("#library-title"),
  librarySubtitle: document.querySelector("#library-subtitle"),
  libraryImageStatus: document.querySelector("#library-image-status"),
  libraryItems: document.querySelector("#library-items"),
  settingsDataMeta: document.querySelector("#settings-data-meta"),
  checkUpdate: document.querySelector("#check-update"),
  updateStatus: document.querySelector("#update-status"),
  cacheAll: document.querySelector("#cache-all"),
  clearCache: document.querySelector("#clear-cache"),
  cacheStatus: document.querySelector("#cache-status"),
  cacheProgressBar: document.querySelector("#cache-progress-bar"),
  statsSummary: document.querySelector("#stats-summary"),
  hotKeywords: document.querySelector("#hot-keywords"),
  clearStats: document.querySelector("#clear-stats"),
  appStatus: document.querySelector("#app-status"),
  dialog: document.querySelector("#item-dialog"),
  modalImageStage: document.querySelector("#modal-image-stage"),
  modalTitle: document.querySelector("#modal-title"),
  modalMeta: document.querySelector("#modal-meta"),
  closeDialog: document.querySelector("#close-dialog"),
  prevImage: document.querySelector("#prev-image"),
  nextImage: document.querySelector("#next-image"),
  pagerStatus: document.querySelector("#pager-status"),
  easterDialog: document.querySelector("#easter-dialog"),
  easterImageStage: document.querySelector("#easter-image-stage"),
  easterTitle: document.querySelector("#easter-title"),
  easterMeta: document.querySelector("#easter-meta"),
  closeEasterDialog: document.querySelector("#close-easter-dialog"),
  prevEaster: document.querySelector("#prev-easter"),
  nextEaster: document.querySelector("#next-easter"),
  easterPagerStatus: document.querySelector("#easter-pager-status")
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function normalizeSearch(value) {
  return String(value ?? "").toLowerCase().replace(/\s+/g, "");
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("zh-CN");
}

function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function appVersionLabel(version = state.appVersion) {
  if (!version) return "未记录";
  const name = version.versionName || "0.0.0";
  const code = version.versionCode || "-";
  return `v${name} (${code})`;
}

function formatAppVersion(version = state.appVersion) {
  return `版本：${appVersionLabel(version)}`;
}

function appendCacheBuster(url) {
  const separator = String(url).includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
}

function randomIndex(length) {
  return Math.floor(Math.random() * Math.max(1, length));
}

function hashString(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getDailyBucket(date = new Date()) {
  const bucket = new Date(date);
  if (bucket.getHours() < 8) bucket.setDate(bucket.getDate() - 1);
  return [
    bucket.getFullYear(),
    String(bucket.getMonth() + 1).padStart(2, "0"),
    String(bucket.getDate()).padStart(2, "0")
  ].join("-");
}

function isAnniversary(date = new Date()) {
  return date.getMonth() === 7 && date.getDate() === 26;
}

function highlight(value, query) {
  const text = String(value ?? "");
  if (!query) return escapeHtml(text);
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const index = normalizedText.indexOf(normalizedQuery);
  if (index < 0) return escapeHtml(text);
  return `${escapeHtml(text.slice(0, index))}<mark>${escapeHtml(text.slice(index, index + query.length))}</mark>${escapeHtml(text.slice(index + query.length))}`;
}

function primaryImage(item) {
  return item.images.find(image => image.isPrimary) || item.images[0] || null;
}

function imageThumbHtml(item) {
  const image = primaryImage(item);
  if (!image || !image.url) {
    return `<div class="thumb"><span>无图</span></div>`;
  }
  return `
    <div class="thumb has-image">
      <img src="${escapeHtml(image.url)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async">
      <span>无图</span>
    </div>
  `;
}

function itemCardHtml(item, query, className = "result-card") {
  const imageCount = item.images.length;
  const page = item.pageLabel || item.sourcePage || "";
  return `
    <button class="${className}" type="button" data-open-item="${escapeHtml(item.id)}">
      ${imageThumbHtml(item)}
      <span class="item-body">
        <span class="item-name">${highlight(item.name, query)}</span>
        <span class="item-source">${escapeHtml(item.categoryName || "未分类")} · ${escapeHtml(item.bookTitle || "")}</span>
        <span class="item-tags">
          <span class="tag">页 ${escapeHtml(page)}</span>
          <span class="tag ${imageCount ? "image-ok" : "no-image"}">${imageCount ? `${imageCount} 图` : "无图"}</span>
        </span>
      </span>
    </button>
  `;
}

function normalizeAppData(payload, sourceName) {
  const books = Array.isArray(payload.books) ? payload.books : [];
  const categories = Array.isArray(payload.categories) ? payload.categories : [];
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!books.length || !items.length) {
    throw new Error("数据为空");
  }

  const normalizedBooks = books.map(book => ({
    ...book,
    _searchBlob: normalizeSearch(`${book.title || ""} ${book.id || ""} ${book.kind || ""}`)
  }));
  const booksById = new Map(normalizedBooks.map(book => [book.id, book]));
  const normalizedCategories = categories.map(category => {
    const book = booksById.get(category.bookId) || {};
    return {
      ...category,
      bookTitle: book.title || "",
      _searchBlob: normalizeSearch(`${category.name || ""} ${category.id || ""}`)
    };
  });
  const categoriesById = new Map(normalizedCategories.map(category => [category.id, category]));
  const normalizedItems = items.map((item, index) => {
    const book = booksById.get(item.bookId) || {};
    const category = categoriesById.get(item.categoryId) || {};
    const images = Array.isArray(item.images) ? item.images.filter(image => image && image.url).map(image => ({
      id: String(image.id || `${item.id}_image_${index}`),
      kind: image.kind || "item",
      path: image.path || "",
      url: image.url || "",
      isPrimary: Boolean(image.isPrimary),
      width: image.width || null,
      height: image.height || null,
      bytes: image.bytes || null,
      exists: image.exists !== false,
      sourceRef: image.sourceRef || "",
      note: image.note || ""
    })) : [];
    const pageLabel = String(item.pageLabel ?? item.sourcePage ?? "").trim();
    const aliases = Array.isArray(item.aliases) ? item.aliases.map(String) : [];
    const searchParts = [
      item.name,
      pageLabel,
      item.sourcePage,
      item.searchText,
      aliases.join(" ")
    ];
    return {
      id: String(item.id || `item_${index}`),
      bookId: String(item.bookId || book.id || "unknown"),
      bookTitle: String(item.bookTitle || book.title || "未命名书籍"),
      bookKind: String(item.bookKind || book.kind || "ebook"),
      categoryId: String(item.categoryId || category.id || "uncategorized"),
      categoryName: String(item.categoryName || category.name || "未分类"),
      name: String(item.name || "").trim(),
      pageLabel,
      sourcePage: item.sourcePage ?? null,
      sortOrder: Number(item.sortOrder ?? index),
      searchText: String(item.searchText || ""),
      aliases,
      images,
      sourceRef: item.sourceRef || "",
      ocrStatus: item.ocrStatus || "",
      note: item.note || "",
      _searchBlob: normalizeSearch(searchParts.join(" "))
    };
  }).filter(item => item.name);

  return {
    schemaVersion: payload.schemaVersion || 1,
    generatedAt: payload.generatedAt || "",
    temporary: Boolean(payload.temporary),
    assetMode: payload.assetMode || "",
    sourceName,
    stats: payload.stats || {},
    books: normalizedBooks,
    categories: normalizedCategories,
    items: normalizedItems
  };
}

function normalizeLegacyData(payload) {
  const rawItems = Array.isArray(payload) ? payload : payload.items;
  if (!Array.isArray(rawItems) || !rawItems.length) {
    throw new Error("旧数据为空");
  }

  const book = {
    id: "paper_001",
    title: "纸质书目录",
    kind: "paper",
    sortOrder: 1,
    categoryCount: 1,
    itemCount: rawItems.length,
    imageCount: 0,
    hasImages: false,
    _searchBlob: normalizeSearch("纸质书目录 paper_001 paper")
  };
  const category = {
    id: "cat_paper_001_default",
    bookId: book.id,
    name: "默认分类",
    sortOrder: 1,
    itemCount: rawItems.length,
    imageCount: 0,
    bookTitle: book.title,
    _searchBlob: normalizeSearch("默认分类")
  };
  const items = rawItems.map((item, index) => {
    const pageLabel = String(item.number ?? item.pageLabel ?? "").padStart(3, "0");
    const name = String(item.name || "").trim();
    return {
      id: `legacy_${pageLabel}_${index}`,
      bookId: book.id,
      bookTitle: book.title,
      bookKind: book.kind,
      categoryId: category.id,
      categoryName: category.name,
      name,
      pageLabel,
      sourcePage: null,
      sortOrder: index + 1,
      searchText: normalizeSearch(`${name} ${pageLabel}`),
      aliases: [],
      images: [],
      sourceRef: "",
      ocrStatus: "",
      note: "",
      _searchBlob: normalizeSearch(`${name} ${pageLabel} ${book.title} ${category.name}`)
    };
  }).filter(item => item.name);

  return {
    schemaVersion: 0,
    generatedAt: payload.version || "",
    temporary: true,
    assetMode: "legacy",
        sourceName: "data/catalog-data.json",
    stats: { books: 1, categories: 1, items: items.length, images: 0, imageBytes: 0 },
    books: [book],
    categories: [category],
    items
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status}`);
  return response.json();
}

async function loadAppVersion() {
  try {
    state.appVersion = await fetchJson(appendCacheBuster(APP_VERSION_URL), { cache: "no-store" });
  } catch (error) {
    state.appVersion = null;
  }
  return state.appVersion;
}

function saveSnapshot(payload) {
  try {
    localStorage.setItem(SAVED_DATA_KEY, JSON.stringify(payload));
  } catch (error) {
    localStorage.removeItem(SAVED_DATA_KEY);
  }
}

function loadSnapshot() {
  const raw = localStorage.getItem(SAVED_DATA_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

async function loadData() {
  el.dataBadge.textContent = "加载中";
  try {
    const payload = await fetchJson(APP_DATA_URL);
    saveSnapshot(payload);
    setData(normalizeAppData(payload, "app-data.json"));
    return;
  } catch (appError) {
    try {
      const snapshot = loadSnapshot();
      if (snapshot) {
        setData(normalizeAppData(snapshot, "本机快照"));
        return;
      }
    } catch (snapshotError) {
      localStorage.removeItem(SAVED_DATA_KEY);
    }
    try {
      const legacyPayload = await fetchJson(LEGACY_DATA_URL);
      setData(normalizeLegacyData(legacyPayload));
      return;
    } catch (legacyError) {
      renderFatal(`数据加载失败：${legacyError.message || appError.message || "未知错误"}`);
    }
  }
}

function setData(data) {
  state.data = data;
  state.books = data.books.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.id).localeCompare(String(b.id)));
  state.categories = data.categories.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.id).localeCompare(String(b.id)));
  state.items = data.items.slice().sort((a, b) => {
    const bookA = state.books.find(book => book.id === a.bookId)?.sortOrder || 0;
    const bookB = state.books.find(book => book.id === b.bookId)?.sortOrder || 0;
    return bookA - bookB || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "zh-CN");
  });
  state.booksById = new Map(state.books.map(book => [book.id, book]));
  state.itemsById = new Map(state.items.map(item => [item.id, item]));
  state.categoriesByBook = groupBy(state.categories, "bookId");
  if (state.selectedBookId && !state.booksById.has(state.selectedBookId)) {
    state.selectedBookId = null;
  }
  if (!state.selectedBookId) state.selectedCategoryId = null;
  renderAll();
}

function groupBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const value = item[key];
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(item);
  }
  return map;
}

function renderFatal(message) {
  el.dataBadge.textContent = "无数据";
  el.results.innerHTML = `<div class="empty-state"><div class="empty-title">${escapeHtml(message)}</div></div>`;
}

function renderAll() {
  renderHeader();
  renderQuickTerms();
  renderHomeStatus();
  renderDailyTopic();
  renderQuickStats();
  renderHomeBooks();
  renderResults();
  renderLibrary();
  renderSettings();
  attachImageFallbacks();
  startHomeStatusRotation();
}

function renderHeader() {
  const stats = state.data?.stats || {};
  const temporary = state.data?.temporary ? "临时" : "正式";
  el.dataBadge.textContent = `${temporary} · ${formatNumber(stats.items || state.items.length)} 条`;
  el.searchMeta.textContent = `${formatNumber(state.books.length)} 本书 · ${formatNumber(stats.images || 0)} 图`;
  if (el.booksMeta) el.booksMeta.textContent = `${formatNumber(stats.categories || state.categories.length)} 类`;
  el.settingsDataMeta.textContent = state.data?.generatedAt ? formatDateTime(state.data.generatedAt) : state.data?.sourceName || "";
}

function renderQuickTerms() {
  const hot = topKeywords(4).map(entry => entry.term);
  const terms = (hot.length ? hot : DEFAULT_TERMS).filter(Boolean);
  el.quickTerms.innerHTML = terms.map(term => `
    <button class="chip ${state.query === term ? "is-active" : ""}" type="button" data-search-term="${escapeHtml(term)}">${escapeHtml(term)}</button>
  `).join("");
}

function renderHomeStatus() {
  if (!el.homeStatus || !HOME_STATUS_LINES.length) return;
  let nextIndex = randomIndex(HOME_STATUS_LINES.length);
  if (HOME_STATUS_LINES.length > 1 && nextIndex === state.homeStatusIndex) {
    nextIndex = (nextIndex + 1) % HOME_STATUS_LINES.length;
  }
  state.homeStatusIndex = nextIndex;
  el.homeStatus.textContent = HOME_STATUS_LINES[nextIndex];
}

function startHomeStatusRotation() {
  if (!el.homeStatus || state.homeStatusTimer) return;
  state.homeStatusTimer = window.setInterval(renderHomeStatus, 18000);
}

function getDailyTopicItem() {
  const candidatesWithImages = state.items.filter(item => item.images.length);
  const candidates = candidatesWithImages.length ? candidatesWithImages : state.items;
  if (!candidates.length) return null;
  const bucket = getDailyBucket();
  const index = hashString(`daily-topic:${bucket}:${candidates.length}`) % candidates.length;
  return candidates[index];
}

function anniversaryCardHtml() {
  return `
    <button class="anniversary-card" type="button" data-open-hidden-gallery>
      <span class="daily-label">8 月 26 日</span>
      <span class="anniversary-title">给我们的小画册多留一页</span>
      <span class="anniversary-copy">今天适合把日子画得软一点。</span>
    </button>
  `;
}

function renderDailyTopic() {
  if (!el.dailyTopic) return;
  const item = getDailyTopicItem();
  const anniversary = isAnniversary() ? anniversaryCardHtml() : "";
  if (!item && !anniversary) {
    el.dailyTopic.innerHTML = "";
    return;
  }
  const image = item ? primaryImage(item) : null;
  const topic = item ? `
    <button class="daily-card" type="button" data-open-item="${escapeHtml(item.id)}">
      <span class="daily-label">今日画题</span>
      <span class="daily-main">${escapeHtml(item.name)}</span>
      <span class="daily-meta">${escapeHtml(item.bookTitle)}${item.categoryName ? ` · ${escapeHtml(item.categoryName)}` : ""}</span>
      ${image ? `<span class="daily-thumb"><img src="${escapeHtml(image.url)}" alt="" loading="lazy" decoding="async"></span>` : ""}
    </button>
  ` : "";
  el.dailyTopic.innerHTML = `${anniversary}${topic}`;
}

function renderQuickStats() {
  const stats = state.data?.stats || {};
  const imageItems = state.items.filter(item => item.images.length).length;
  el.quickStats.innerHTML = `
    <div class="stat-tile"><span class="stat-value">${formatNumber(stats.items || state.items.length)}</span><span class="stat-label">条目</span></div>
    <div class="stat-tile"><span class="stat-value">${formatNumber(imageItems)}</span><span class="stat-label">有图条目</span></div>
    <div class="stat-tile"><span class="stat-value">${formatNumber(state.stats.totalQueries || 0)}</span><span class="stat-label">本机查询</span></div>
  `;
}

function renderHomeBooks() {
  if (!el.homeBooks) return;
  el.homeBooks.innerHTML = state.books.map(book => bookCardHtml(book)).join("");
}

function bookCardHtml(book) {
  const imageLabel = book.imageCount ? `${formatNumber(book.imageCount)} 图` : "无图";
  const kind = book.kind === "paper" ? "纸质" : "电子";
  return `
    <article class="book-card">
      <div>
        <h3 class="book-title">${escapeHtml(book.title)}</h3>
        <div class="book-meta">
          <span>${escapeHtml(kind)}</span>
          <span>${formatNumber(book.categoryCount || 0)} 类</span>
          <span>${formatNumber(book.itemCount || 0)} 条</span>
          <span>${escapeHtml(imageLabel)}</span>
        </div>
      </div>
      <button class="book-action" type="button" data-open-book="${escapeHtml(book.id)}">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>
        打开
      </button>
    </article>
  `;
}

function searchScore(item, query) {
  if (!query) return 20;
  const page = normalizeSearch(item.pageLabel || item.sourcePage || "");
  const name = normalizeSearch(item.name);
  const category = normalizeSearch(item.categoryName);
  const book = normalizeSearch(item.bookTitle);
  if (name === query || page === query) return 0;
  if (name.startsWith(query)) return 1;
  if (category.startsWith(query)) return 2;
  if (name.includes(query)) return 3;
  if (page.includes(query)) return 4;
  if (category.includes(query)) return 5;
  if (book.includes(query)) return 6;
  return 9;
}

function getSearchMatches() {
  const query = normalizeSearch(state.query);
  if (!query) return { books: [], categories: [], items: [] };
  const books = state.books
    .filter(book => book._searchBlob?.includes(query))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const categories = state.categories
    .filter(category => category._searchBlob?.includes(query))
    .sort((a, b) => {
      const bookA = state.booksById.get(a.bookId)?.sortOrder || 0;
      const bookB = state.booksById.get(b.bookId)?.sortOrder || 0;
      return bookA - bookB || (a.sortOrder || 0) - (b.sortOrder || 0);
    })
    .slice(0, 40);
  const items = state.items
    .filter(item => item._searchBlob.includes(query))
    .sort((a, b) => searchScore(a, query) - searchScore(b, query) || a.sortOrder - b.sortOrder)
    .slice(0, MAX_RESULTS);
  return { books, categories, items };
}

function categoryCardHtml(category, query) {
  const book = state.booksById.get(category.bookId) || {};
  const categoryItems = state.items.filter(item => item.categoryId === category.id);
  const preview = categoryItems.slice(0, 5).map(item => item.name).join("、");
  const imageItem = categoryItems.find(item => item.images.length);
  const image = imageItem ? primaryImage(imageItem) : null;
  const thumb = image && image.url
    ? `<div class="thumb has-image"><img src="${escapeHtml(image.url)}" alt="${escapeHtml(category.name)}" loading="lazy" decoding="async"><span>分类</span></div>`
    : `<div class="thumb"><span>分类</span></div>`;
  return `
    <button class="category-card" type="button" data-open-category="${escapeHtml(category.id)}" data-category-book="${escapeHtml(category.bookId)}">
      ${thumb}
      <span class="item-body">
        <span class="item-name">${highlight(category.name, query)}</span>
        <span class="item-source">${escapeHtml(book.title || category.bookTitle || "")}${preview ? ` · ${escapeHtml(preview)}` : ""}</span>
        <span class="item-tags">
          <span class="tag">分类</span>
          <span class="tag">${formatNumber(category.itemCount || categoryItems.length)} 条</span>
          <span class="tag ${category.imageCount ? "image-ok" : "no-image"}">${category.imageCount ? `${formatNumber(category.imageCount)} 图` : "无图"}</span>
        </span>
      </span>
    </button>
  `;
}

function messageCardHtml(message) {
  return `
    <section class="result-group">
      <div class="special-message-card">
        <span class="daily-label">小彩蛋</span>
        <span>${escapeHtml(message)}</span>
      </div>
    </section>
  `;
}

function hiddenGalleryResultsHtml() {
  return `
    <section class="result-group">
      <div class="group-head">
        <span class="group-title">隐藏小画册</span>
        <span>${formatNumber(HIDDEN_GALLERY.length)} 张</span>
      </div>
      <div class="easter-grid">
        ${HIDDEN_GALLERY.map(entry => `
          <button class="easter-card" type="button" data-open-easter-image="${escapeHtml(entry.id)}">
            <span class="easter-thumb">
              <img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.title)}" loading="lazy" decoding="async">
            </span>
            <span class="easter-card-body">
              <span class="item-name">${escapeHtml(entry.title)}</span>
              <span class="item-source">${escapeHtml(entry.author)} · ${escapeHtml(entry.caption)}</span>
            </span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function getSpecialResults(query) {
  const exact = query.trim();
  const normalized = normalizeSearch(exact);
  const groups = [];
  let count = 0;
  if (SECRET_SEARCH_MESSAGES.has(exact)) {
    groups.push(messageCardHtml(SECRET_SEARCH_MESSAGES.get(exact)));
    count += 1;
  }
  if (normalized === "0826") {
    groups.push(`
      <section class="result-group">
        ${anniversaryCardHtml()}
      </section>
    `);
    count += 1;
  }
  if (HIDDEN_GALLERY_TERMS.has(exact)) {
    groups.push(hiddenGalleryResultsHtml());
    count += HIDDEN_GALLERY.length;
  }
  return { count, html: groups.join("") };
}

function renderResults() {
  const query = state.query.trim();
  if (!query) {
    el.resultsTitle.textContent = "快速入口";
    el.resultsSummary.textContent = "";
    const recent = state.stats.recentQueries.slice(0, 6);
    const terms = recent.length ? recent.map(entry => entry.term) : DEFAULT_TERMS;
    el.results.innerHTML = `
      <div class="empty-state">
        <div class="empty-title">最近</div>
        <div class="toolbar">
          ${terms.map(term => `<button class="chip" type="button" data-search-term="${escapeHtml(term)}">${escapeHtml(term)}</button>`).join("")}
        </div>
      </div>
    `;
    return;
  }

  const matches = getSearchMatches();
  const special = getSpecialResults(query);
  const total = matches.books.length + matches.categories.length + matches.items.length + special.count;
  el.resultsTitle.textContent = "结果";
  el.resultsSummary.textContent = total ? `${formatNumber(total)} 个命中` : `未找到“${query}”`;
  if (!total) {
    el.results.innerHTML = `<div class="empty-state"><div class="empty-title">未找到“${escapeHtml(query)}”</div></div>`;
    return;
  }

  const groups = [];
  if (special.html) groups.push(special.html);
  if (matches.books.length) {
    groups.push(`
      <section class="result-group">
        <div class="group-head">
          <span class="group-title">书籍</span>
          <span>${formatNumber(matches.books.length)} 本</span>
        </div>
        <div class="book-grid">
          ${matches.books.map(book => bookCardHtml(book)).join("")}
        </div>
      </section>
    `);
  }
  if (matches.categories.length) {
    const byCategoryBook = groupBy(matches.categories, "bookId");
    for (const book of state.books.filter(book => byCategoryBook.has(book.id))) {
      const categories = byCategoryBook.get(book.id);
      groups.push(`
        <section class="result-group">
          <div class="group-head">
            <span class="group-title">分类 · ${escapeHtml(book.title)}</span>
            <span>${formatNumber(categories.length)} 类</span>
          </div>
          <div class="result-list">
            ${categories.map(category => categoryCardHtml(category, query)).join("")}
          </div>
        </section>
      `);
    }
  }

  const byBook = groupBy(matches.items, "bookId");
  groups.push(...state.books
    .filter(book => byBook.has(book.id))
    .map(book => {
      const items = byBook.get(book.id);
      return `
        <section class="result-group">
          <div class="group-head">
            <span class="group-title">${escapeHtml(book.title)}</span>
            <span>${formatNumber(items.length)} 条</span>
          </div>
          <div class="result-list">
            ${items.map(item => itemCardHtml(item, query)).join("")}
          </div>
        </section>
      `;
    }));
  el.results.innerHTML = groups.join("");
}

function renderLibrary() {
  if (!state.books.length) return;
  const selectedBook = state.selectedBookId ? state.booksById.get(state.selectedBookId) : null;

  el.libraryBookFilters.innerHTML = state.books.map(book => `
    <button class="book-filter ${book.id === state.selectedBookId ? "is-active" : ""}" type="button" data-book-id="${escapeHtml(book.id)}">
      <span>${escapeHtml(book.title)}</span>
      <span class="filter-count">${formatNumber(book.itemCount || 0)}</span>
    </button>
  `).join("");

  if (!selectedBook) {
    const stats = state.data?.stats || {};
    el.libraryCategoryFilters.innerHTML = "";
    el.libraryTitle.textContent = "书库";
    el.librarySubtitle.textContent = `${formatNumber(state.books.length)} 本书 · ${formatNumber(stats.categories || state.categories.length)} 类`;
    el.libraryImageStatus.textContent = `${formatNumber(stats.images || 0)} 图`;
    el.libraryItems.innerHTML = `
      <div class="empty-state">
        <div class="empty-title">未选择书籍</div>
        <div>${formatNumber(stats.items || state.items.length)} 条 · ${formatNumber(stats.images || 0)} 图</div>
      </div>
    `;
    return;
  }

  const categories = state.categoriesByBook.get(selectedBook.id) || [];
  const selectedCategory = state.selectedCategoryId === "all" ? null : categories.find(category => category.id === state.selectedCategoryId);
  const items = state.items.filter(item => item.bookId === selectedBook.id && (!selectedCategory || item.categoryId === selectedCategory.id));
  const imageCount = items.reduce((sum, item) => sum + item.images.length, 0);

  el.libraryCategoryFilters.innerHTML = `
    <button class="category-filter ${state.selectedCategoryId === "all" ? "is-active" : ""}" type="button" data-category-id="all">
      <span>全部</span>
      <span class="filter-count">${formatNumber(selectedBook.itemCount || items.length)}</span>
    </button>
    ${categories.map(category => `
      <button class="category-filter ${category.id === state.selectedCategoryId ? "is-active" : ""}" type="button" data-category-id="${escapeHtml(category.id)}">
        <span>${escapeHtml(category.name)}</span>
        <span class="filter-count">${formatNumber(category.itemCount || 0)}</span>
      </button>
    `).join("")}
  `;

  el.libraryTitle.textContent = selectedCategory ? selectedCategory.name : selectedBook.title;
  el.librarySubtitle.textContent = `${formatNumber(items.length)} 条 · ${formatNumber(categories.length)} 类`;
  el.libraryImageStatus.textContent = imageCount ? `${formatNumber(imageCount)} 图` : "无图";
  el.libraryItems.innerHTML = items.map(item => itemCardHtml(item, "", "item-card")).join("");
}

function renderSettings() {
  const stats = state.data?.stats || {};
  const generatedAt = state.data?.generatedAt ? formatDateTime(state.data.generatedAt) : "未记录";
  const imageBytes = formatBytes(stats.imageBytes || 0);
  const versionLine = formatAppVersion();
  el.updateStatus.textContent ||= IS_ANDROID_ASSET
    ? `${versionLine} · APK 内置数据：${generatedAt}`
    : `${versionLine} · 当前：${state.data?.sourceName || "app-data.json"} · ${generatedAt}`;
  el.cacheStatus.textContent ||= IS_ANDROID_ASSET
    ? builtInImageStatus()
    : `${formatNumber(stats.images || 0)} 张图片 · ${imageBytes}`;
  el.cacheAll.disabled = false;
  el.cacheAll.title = IS_ANDROID_ASSET ? "APK 已内置图片，点击可恢复状态提示" : "";
  el.appStatus.innerHTML = `
    <div>${escapeHtml(versionLine)}</div>
    <div>数据：${escapeHtml(state.data?.sourceName || "")}</div>
    <div>模式：${escapeHtml(state.data?.assetMode || "")}${state.data?.temporary ? " · 临时" : ""}${IS_ANDROID_ASSET ? " · APK 内置资源" : ""}</div>
    <div>生成：${escapeHtml(generatedAt)}</div>
    <div>图片：${formatNumber(stats.images || 0)} · ${escapeHtml(imageBytes)}</div>
    <div>更新：${escapeHtml(state.appVersion?.updateManifestUrl || "未配置远程地址")}</div>
  `;
  renderStats();
}

function builtInImageStatus(prefix = "图片已内置在 APK") {
  const stats = state.data?.stats || {};
  const imageBytes = formatBytes(stats.imageBytes || 0);
  return `${prefix}：${formatNumber(stats.images || 0)} 张 · ${imageBytes} · 可断网查看`;
}

function attachImageFallbacks() {
  document.querySelectorAll(".thumb img").forEach(image => {
    image.addEventListener("error", () => image.parentElement?.classList.add("image-error"), { once: true });
  });
}

function setView(view) {
  state.view = view;
  Object.entries(el.views).forEach(([name, node]) => {
    node.hidden = name !== view;
  });
  el.tabs.forEach(tab => {
    const active = tab.dataset.view === view;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", active ? "true" : "false");
  });
  if (view === "home") el.searchInput.focus();
  if (view === "settings") renderSettings();
}

function selectSearchTerm(term) {
  state.query = term;
  el.searchInput.value = term;
  setView("home");
  recordSearch(term, true);
  renderQuickTerms();
  renderResults();
  attachImageFallbacks();
}

function openBook(bookId) {
  if (!state.booksById.has(bookId)) return;
  state.selectedBookId = bookId;
  state.selectedCategoryId = "all";
  setView("library");
  renderLibrary();
  attachImageFallbacks();
}

function openCategory(bookId, categoryId) {
  if (!state.booksById.has(bookId)) return;
  state.selectedBookId = bookId;
  state.selectedCategoryId = categoryId;
  setView("library");
  renderLibrary();
  attachImageFallbacks();
}

function openItem(itemId) {
  const item = state.itemsById.get(itemId);
  if (!item) return;
  state.detailItem = item;
  state.detailImageIndex = 0;
  renderDialog();
  if (!el.dialog.open) el.dialog.showModal();
}

function renderDialog() {
  const item = state.detailItem;
  if (!item) return;
  const image = item.images[state.detailImageIndex] || null;
  el.modalTitle.textContent = item.name;
  el.modalMeta.innerHTML = "";
  if (image) {
    el.modalImageStage.innerHTML = `<img src="${escapeHtml(image.url)}" alt="${escapeHtml(item.name)}" decoding="async">`;
    const modalImage = el.modalImageStage.querySelector("img");
    modalImage.addEventListener("error", () => {
      el.modalImageStage.innerHTML = `<div class="empty-state"><div class="empty-title">图片未找到</div><div>${escapeHtml(image.path || image.url)}</div></div>`;
    }, { once: true });
  } else {
    el.modalImageStage.innerHTML = `<div class="empty-state"><div class="empty-title">无图</div><div>${escapeHtml(item.bookTitle)}</div></div>`;
  }
  const total = item.images.length;
  const showPager = total > 1;
  el.prevImage.hidden = !showPager;
  el.nextImage.hidden = !showPager;
  el.pagerStatus.hidden = !showPager;
  el.prevImage.disabled = !showPager || state.detailImageIndex <= 0;
  el.nextImage.disabled = !showPager || state.detailImageIndex >= total - 1;
  el.pagerStatus.textContent = showPager ? `${state.detailImageIndex + 1} / ${total}` : "";
}

function changeDetailImage(delta) {
  const item = state.detailItem;
  if (!item || item.images.length < 2) return;
  state.detailImageIndex = Math.min(item.images.length - 1, Math.max(0, state.detailImageIndex + delta));
  renderDialog();
}

function openHiddenGallery(index = 0) {
  state.easterImageIndex = Math.min(HIDDEN_GALLERY.length - 1, Math.max(0, index));
  renderEasterDialog();
  if (!el.easterDialog.open) el.easterDialog.showModal();
}

function openHiddenGalleryImage(id) {
  const index = HIDDEN_GALLERY.findIndex(entry => entry.id === id);
  openHiddenGallery(index >= 0 ? index : 0);
}

function renderEasterDialog() {
  const entry = HIDDEN_GALLERY[state.easterImageIndex] || HIDDEN_GALLERY[0];
  if (!entry) return;
  el.easterTitle.textContent = entry.title;
  el.easterMeta.innerHTML = `
    <div>作者：${escapeHtml(entry.author)}</div>
    <div>${escapeHtml(entry.caption)}</div>
  `;
  el.easterImageStage.innerHTML = `<img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.title)}" decoding="async">`;
  const image = el.easterImageStage.querySelector("img");
  image.addEventListener("error", () => {
    el.easterImageStage.innerHTML = `<div class="empty-state"><div class="empty-title">图片未找到</div></div>`;
  }, { once: true });
  el.prevEaster.disabled = state.easterImageIndex <= 0;
  el.nextEaster.disabled = state.easterImageIndex >= HIDDEN_GALLERY.length - 1;
  el.easterPagerStatus.textContent = `${state.easterImageIndex + 1} / ${HIDDEN_GALLERY.length}`;
}

function changeEasterImage(delta) {
  state.easterImageIndex = Math.min(HIDDEN_GALLERY.length - 1, Math.max(0, state.easterImageIndex + delta));
  renderEasterDialog();
}

function handleAndroidBack() {
  if (el.easterDialog.open) {
    el.easterDialog.close();
    return true;
  }
  if (el.dialog.open) {
    el.dialog.close();
    return true;
  }
  return false;
}

window.jianbihuaHandleAndroidBack = handleAndroidBack;

function loadStats() {
  try {
    const saved = JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
    return {
      totalQueries: Number(saved.totalQueries || 0),
      recentQueries: Array.isArray(saved.recentQueries) ? saved.recentQueries : [],
      keywords: saved.keywords && typeof saved.keywords === "object" ? saved.keywords : {}
    };
  } catch (error) {
    localStorage.removeItem(STATS_KEY);
    return { totalQueries: 0, recentQueries: [], keywords: {} };
  }
}

function saveStats() {
  localStorage.setItem(STATS_KEY, JSON.stringify(state.stats));
}

function recordSearch(term, immediate = false) {
  const normalized = term.trim();
  if (!normalized) return;
  const now = Date.now();
  if (!immediate && state.lastRecordedQuery === normalized && now - state.lastRecordTime < 2500) return;
  state.lastRecordedQuery = normalized;
  state.lastRecordTime = now;

  state.stats.totalQueries += 1;
  const keyword = state.stats.keywords[normalized] || { count: 0, lastAt: 0 };
  keyword.count += 1;
  keyword.lastAt = now;
  state.stats.keywords[normalized] = keyword;
  state.stats.recentQueries = [
    { term: normalized, lastAt: now },
    ...state.stats.recentQueries.filter(entry => entry.term !== normalized)
  ].slice(0, 10);
  saveStats();
  renderQuickTerms();
  renderQuickStats();
  renderStats();
}

function topKeywords(limit = 8) {
  return Object.entries(state.stats.keywords)
    .map(([term, value]) => ({ term, count: Number(value.count || 0), lastAt: Number(value.lastAt || 0) }))
    .sort((a, b) => b.count - a.count || b.lastAt - a.lastAt || a.term.localeCompare(b.term, "zh-CN"))
    .slice(0, limit);
}

function renderStats() {
  const recent = state.stats.recentQueries.slice(0, 6);
  const hot = topKeywords(10);
  el.statsSummary.innerHTML = `
    <div>总查询：${formatNumber(state.stats.totalQueries || 0)}</div>
    <div>最近：${recent.length ? recent.map(entry => escapeHtml(entry.term)).join("、") : "无"}</div>
  `;
  el.hotKeywords.innerHTML = hot.length
    ? hot.map(entry => `<button class="stats-pill" type="button" data-search-term="${escapeHtml(entry.term)}"><span>${escapeHtml(entry.term)}</span><span>${formatNumber(entry.count)}</span></button>`).join("")
    : `<span class="stats-pill">无</span>`;
}

async function refreshCurrentData() {
  const payload = await fetchJson(appendCacheBuster(APP_DATA_URL), { cache: "no-store" });
  saveSnapshot(payload);
  await putJsonInCache(APP_DATA_URL, payload);
  try {
    const offlinePayload = await fetchJson(appendCacheBuster(OFFLINE_ASSETS_URL), { cache: "no-store" });
    await putJsonInCache(OFFLINE_ASSETS_URL, offlinePayload);
  } catch (error) {
    // The app can still run when only the catalog is updated.
  }
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) await registration.update();
  }
  setData(normalizeAppData(payload, "app-data.json"));
  return payload;
}

function renderRemoteUpdateStatus(remoteVersion, currentVersion) {
  const remoteCode = Number(remoteVersion?.versionCode || 0);
  const currentCode = Number(currentVersion?.versionCode || 0);
  if (remoteCode <= currentCode) {
    el.updateStatus.textContent = `已是最新：${appVersionLabel(currentVersion)}`;
    return;
  }

  const notes = Array.isArray(remoteVersion.releaseNotes)
    ? remoteVersion.releaseNotes.slice(0, 3)
    : [];
  const apkUrl = remoteVersion.apkUrl || "";
  el.updateStatus.innerHTML = `
    <div>发现新版本：${escapeHtml(appVersionLabel(remoteVersion))}</div>
    ${apkUrl ? `<div><a href="${escapeHtml(apkUrl)}" target="_blank" rel="noopener">下载新版 APK</a></div>` : "<div>新版 APK 下载地址尚未填写。</div>"}
    ${notes.length ? `<div>${notes.map(note => escapeHtml(note)).join("；")}</div>` : ""}
  `;
}

async function checkForUpdates() {
  el.checkUpdate.disabled = true;
  el.updateStatus.textContent = "正在检查版本";
  try {
    const currentVersion = state.appVersion || await loadAppVersion();
    const payload = await refreshCurrentData();
    const updateUrl = currentVersion?.updateManifestUrl || "";
    if (!updateUrl) {
      el.updateStatus.textContent = `${formatAppVersion(currentVersion)} · 已重读本地数据：${formatDateTime(payload.generatedAt)} · 尚未配置远程 version.json`;
      return;
    }

    const remoteVersion = await fetchJson(appendCacheBuster(updateUrl), { cache: "no-store" });
    renderRemoteUpdateStatus(remoteVersion, currentVersion);
  } catch (error) {
    el.updateStatus.textContent = `${formatAppVersion()} · 检查失败：${error.message || "网络不可用或远程清单未发布"}`;
  } finally {
    el.checkUpdate.disabled = false;
  }
}

async function putJsonInCache(url, payload) {
  if (!("caches" in window)) return;
  const cache = await caches.open(SHELL_CACHE_NAME);
  const response = new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
  await cache.put(url, response);
}

async function cacheAllImages() {
  if (IS_ANDROID_ASSET) {
    el.cacheProgressBar.style.width = "100%";
    el.cacheStatus.textContent = builtInImageStatus();
    return;
  }
  if (!("caches" in window)) {
    el.cacheStatus.textContent = "当前浏览器不支持缓存管理";
    return;
  }
  el.cacheAll.disabled = true;
  el.cacheProgressBar.style.width = "0%";
  try {
    const manifest = await fetchJson(`${OFFLINE_ASSETS_URL}?t=${Date.now()}`);
    const assets = (Array.isArray(manifest.images) ? manifest.images : [])
      .filter(asset => asset && asset.url && asset.exists !== false);
    const total = assets.length;
    const cache = await caches.open(IMAGE_CACHE_NAME);
    let done = 0;
    let failed = 0;
    for (const asset of assets) {
      try {
        const request = new Request(asset.url, { cache: "no-store" });
        const cached = await cache.match(asset.url);
        if (!cached) {
          const response = await fetch(request);
          if (!response.ok) throw new Error(String(response.status));
          await cache.put(asset.url, response);
        }
      } catch (error) {
        failed += 1;
      }
      done += 1;
      const percent = total ? Math.round((done / total) * 100) : 100;
      el.cacheProgressBar.style.width = `${percent}%`;
      el.cacheStatus.textContent = `已缓存 ${formatNumber(done)} / ${formatNumber(total)}${failed ? `，失败 ${formatNumber(failed)}` : ""}`;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    el.cacheStatus.textContent = `完成：${formatNumber(done - failed)} / ${formatNumber(total)} 张`;
  } catch (error) {
    el.cacheStatus.textContent = `缓存失败：${error.message || "读取清单失败"}`;
  } finally {
    el.cacheAll.disabled = false;
  }
}

async function clearImageCache() {
  if (!("caches" in window)) {
    el.cacheStatus.textContent = "当前浏览器不支持缓存管理";
    return;
  }
  el.clearCache.disabled = true;
  try {
    await caches.delete(IMAGE_CACHE_NAME);
    el.cacheProgressBar.style.width = IS_ANDROID_ASSET ? "100%" : "0%";
    el.cacheStatus.textContent = IS_ANDROID_ASSET
      ? builtInImageStatus("浏览器图片缓存已清理；图片仍内置在 APK")
      : "图片缓存已清理；需要离线预加载时可再次点击“缓存全部图片”";
  } catch (error) {
    el.cacheStatus.textContent = `清理失败：${error.message || "未知错误"}`;
  } finally {
    el.clearCache.disabled = false;
  }
}

async function disableLocalPreviewServiceWorker() {
  if (!IS_LOCAL_PREVIEW || !("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(registration => registration.unregister()));

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith("jianbihua-shell-"))
        .map(key => caches.delete(key))
    );
  }
}

el.searchForm.addEventListener("submit", event => {
  event.preventDefault();
  recordSearch(state.query, true);
  renderQuickTerms();
  renderResults();
  attachImageFallbacks();
});

el.searchInput.addEventListener("input", () => {
  state.query = el.searchInput.value.trim();
  renderQuickTerms();
  renderResults();
  attachImageFallbacks();
  window.clearTimeout(state.searchTimer);
  state.searchTimer = window.setTimeout(() => {
    if (state.query) recordSearch(state.query);
  }, 850);
});

el.clearSearch.addEventListener("click", () => {
  state.query = "";
  el.searchInput.value = "";
  renderQuickTerms();
  renderResults();
  el.searchInput.focus();
});

document.addEventListener("click", event => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    setView(viewButton.dataset.view);
    return;
  }
  const termButton = event.target.closest("[data-search-term]");
  if (termButton) {
    selectSearchTerm(termButton.dataset.searchTerm || termButton.textContent.trim());
    return;
  }
  const openBookButton = event.target.closest("[data-open-book]");
  if (openBookButton) {
    openBook(openBookButton.dataset.openBook);
    return;
  }
  const openCategoryButton = event.target.closest("[data-open-category]");
  if (openCategoryButton) {
    openCategory(openCategoryButton.dataset.categoryBook, openCategoryButton.dataset.openCategory);
    return;
  }
  const bookButton = event.target.closest("[data-book-id]");
  if (bookButton) {
    const nextBookId = bookButton.dataset.bookId;
    if (state.selectedBookId === nextBookId) {
      state.selectedBookId = null;
      state.selectedCategoryId = null;
    } else {
      state.selectedBookId = nextBookId;
      state.selectedCategoryId = "all";
    }
    renderLibrary();
    attachImageFallbacks();
    return;
  }
  const categoryButton = event.target.closest("[data-category-id]");
  if (categoryButton) {
    if (!state.selectedBookId) return;
    state.selectedCategoryId = categoryButton.dataset.categoryId;
    renderLibrary();
    attachImageFallbacks();
    return;
  }
  const itemButton = event.target.closest("[data-open-item]");
  if (itemButton) {
    openItem(itemButton.dataset.openItem);
    return;
  }
  const hiddenGalleryButton = event.target.closest("[data-open-hidden-gallery]");
  if (hiddenGalleryButton) {
    openHiddenGallery();
    return;
  }
  const easterImageButton = event.target.closest("[data-open-easter-image]");
  if (easterImageButton) {
    openHiddenGalleryImage(easterImageButton.dataset.openEasterImage);
  }
});

el.brandEasterTrigger.addEventListener("click", () => {
  window.clearTimeout(state.brandTapTimer);
  state.brandTapCount += 1;
  if (state.brandTapCount >= 5) {
    state.brandTapCount = 0;
    openHiddenGallery();
    return;
  }
  state.brandTapTimer = window.setTimeout(() => {
    state.brandTapCount = 0;
  }, 4000);
});

el.closeDialog.addEventListener("click", () => el.dialog.close());
el.prevImage.addEventListener("click", () => changeDetailImage(-1));
el.nextImage.addEventListener("click", () => changeDetailImage(1));
el.closeEasterDialog.addEventListener("click", () => el.easterDialog.close());
el.prevEaster.addEventListener("click", () => changeEasterImage(-1));
el.nextEaster.addEventListener("click", () => changeEasterImage(1));
el.checkUpdate.addEventListener("click", checkForUpdates);
el.cacheAll.addEventListener("click", cacheAllImages);
el.clearCache.addEventListener("click", clearImageCache);
el.clearStats.addEventListener("click", () => {
  state.stats = { totalQueries: 0, recentQueries: [], keywords: {} };
  saveStats();
  renderQuickTerms();
  renderQuickStats();
  renderStats();
});

el.dialog.addEventListener("click", event => {
  if (event.target === el.dialog) el.dialog.close();
});

el.easterDialog.addEventListener("click", event => {
  if (event.target === el.easterDialog) el.easterDialog.close();
});

document.addEventListener("keydown", event => {
  if (el.dialog.open) {
    if (event.key === "ArrowLeft") changeDetailImage(-1);
    if (event.key === "ArrowRight") changeDetailImage(1);
    return;
  }
  if (el.easterDialog.open) {
    if (event.key === "ArrowLeft") changeEasterImage(-1);
    if (event.key === "ArrowRight") changeEasterImage(1);
  }
});

async function initApp() {
  await loadAppVersion();
  await loadData();
}

initApp();

if (IS_LOCAL_PREVIEW) {
  window.addEventListener("load", () => {
    disableLocalPreviewServiceWorker().catch(() => {});
  });
} else if ("serviceWorker" in navigator && !IS_ANDROID_ASSET) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
