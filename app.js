const STORAGE_KEY = "post-studio-data";

const state = {
  chat: [],
  posts: [],
  bots: [],
  channels: [],
};

const elements = {
  chatLog: document.getElementById("chatLog"),
  chatPrompt: document.getElementById("chatPrompt"),
  postCount: document.getElementById("postCount"),
  generatePosts: document.getElementById("generatePosts"),
  postsGrid: document.getElementById("postsGrid"),
  showFavorites: document.getElementById("showFavorites"),
  generateImages: document.getElementById("generateImages"),
  imageStatus: document.getElementById("imageStatus"),
  botName: document.getElementById("botName"),
  addBot: document.getElementById("addBot"),
  botList: document.getElementById("botList"),
  channelName: document.getElementById("channelName"),
  addChannel: document.getElementById("addChannel"),
  channelList: document.getElementById("channelList"),
  publishBot: document.getElementById("publishBot"),
  publishChannel: document.getElementById("publishChannel"),
  queuePosts: document.getElementById("queuePosts"),
  publishLog: document.getElementById("publishLog"),
  resetStorage: document.getElementById("resetStorage"),
};

const templates = [
  "Пять быстрых идей, как {topic} прямо сегодня.",
  "{topic}: три шага, которые повышают результат уже на этой неделе.",
  "Почему сейчас лучшее время, чтобы заняться {topic}.",
  "Чек-лист: что нужно подготовить перед тем, как начать {topic}.",
  "История клиента: как {topic} помогло достичь цели за 30 дней.",
  "Мини-гайд: как объяснить {topic} команде за 5 минут.",
  "Ошибки, которые мы делали в {topic}, и как их избежать.",
  "Тренды: что происходит вокруг {topic} в 2024 году.",
];

const highlights = [
  "Добавьте конкретику: цифры, сроки, метрики.",
  "Призовите к действию: что подписчик должен сделать дальше.",
  "Сделайте текст разговорным и дружелюбным.",
  "Укажите выгоду: что получит аудитория.",
];

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.chat = [
      {
        role: "system",
        text: "Опишите тему постов и нажмите «Сгенерировать».",
      },
    ];
    state.bots = ["SMM-бот", "Контент-мастер"];
    state.channels = ["@news_channel", "@promo_feed"];
    return;
  }

  const data = JSON.parse(raw);
  state.chat = data.chat ?? [];
  state.posts = data.posts ?? [];
  state.bots = data.bots ?? [];
  state.channels = data.channels ?? [];
}

function renderChat() {
  elements.chatLog.innerHTML = "";
  state.chat.forEach((message) => {
    const item = document.createElement("div");
    item.className = "chat-message";
    const author = message.role === "user" ? "Вы" : "GPT";
    item.innerHTML = `<strong>${author}</strong><span>${message.text}</span>`;
    elements.chatLog.appendChild(item);
  });
}

function renderPosts() {
  const showFavorites = elements.showFavorites.checked;
  elements.postsGrid.innerHTML = "";
  const filtered = showFavorites
    ? state.posts.filter((post) => post.favorite)
    : state.posts;

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "status";
    empty.textContent = "Постов пока нет. Начните с генерации через GPT чат.";
    elements.postsGrid.appendChild(empty);
    return;
  }

  filtered.forEach((post) => {
    const card = document.createElement("div");
    card.className = "post-card";

    const header = document.createElement("div");
    header.innerHTML = `<h4>${post.title}</h4>`;

    const meta = document.createElement("div");
    meta.className = "post-meta";
    meta.innerHTML = `<span>${post.date}</span><span>${post.favorite ? "★ избранное" : "☆"}</span>`;

    const image = document.createElement("div");
    image.className = "post-image";
    if (post.image) {
      const img = document.createElement("img");
      img.src = post.image;
      img.alt = "Сгенерированное изображение";
      image.appendChild(img);
    } else {
      image.textContent = "Изображение еще не создано";
    }

    const textarea = document.createElement("textarea");
    textarea.value = post.body;
    textarea.addEventListener("change", () => {
      post.body = textarea.value;
      saveState();
    });

    const actions = document.createElement("div");
    actions.className = "post-actions";

    const selectBtn = document.createElement("button");
    selectBtn.textContent = post.selected ? "Выбран" : "Выбрать";
    selectBtn.className = "secondary";
    selectBtn.addEventListener("click", () => {
      post.selected = !post.selected;
      saveState();
      renderPosts();
    });

    const favBtn = document.createElement("button");
    favBtn.textContent = post.favorite ? "Убрать из избранного" : "В избранное";
    favBtn.className = "secondary";
    favBtn.addEventListener("click", () => {
      post.favorite = !post.favorite;
      saveState();
      renderPosts();
    });

    const imgBtn = document.createElement("button");
    imgBtn.textContent = "Картинка";
    imgBtn.addEventListener("click", () => {
      post.image = createPlaceholderImage(post.title);
      saveState();
      renderPosts();
    });

    actions.append(selectBtn, favBtn, imgBtn);

    card.append(header, meta, image, textarea, actions);
    elements.postsGrid.appendChild(card);
  });
}

function renderSettings() {
  elements.botList.innerHTML = "";
  state.bots.forEach((bot, index) => {
    const item = document.createElement("li");
    item.textContent = bot;
    const remove = document.createElement("button");
    remove.textContent = "Удалить";
    remove.addEventListener("click", () => {
      state.bots.splice(index, 1);
      saveState();
      renderSettings();
    });
    item.appendChild(remove);
    elements.botList.appendChild(item);
  });

  elements.channelList.innerHTML = "";
  state.channels.forEach((channel, index) => {
    const item = document.createElement("li");
    item.textContent = channel;
    const remove = document.createElement("button");
    remove.textContent = "Удалить";
    remove.addEventListener("click", () => {
      state.channels.splice(index, 1);
      saveState();
      renderSettings();
    });
    item.appendChild(remove);
    elements.channelList.appendChild(item);
  });

  renderPublishSelectors();
}

function renderPublishSelectors() {
  elements.publishBot.innerHTML = "";
  elements.publishChannel.innerHTML = "";

  state.bots.forEach((bot) => {
    const option = document.createElement("option");
    option.value = bot;
    option.textContent = bot;
    elements.publishBot.appendChild(option);
  });

  state.channels.forEach((channel) => {
    const option = document.createElement("option");
    option.value = channel;
    option.textContent = channel;
    elements.publishChannel.appendChild(option);
  });
}

function createPost(prompt, index) {
  const template = templates[index % templates.length];
  const highlight = highlights[index % highlights.length];
  const topic = prompt || "контент для вашего бренда";
  const title = template.replace("{topic}", topic);
  return {
    id: crypto.randomUUID(),
    title,
    body: `${title}\n\n${highlight}\n\nИдея: ${topic} — подайте это через историю, цифры и понятный CTA.`,
    date: new Date().toLocaleString("ru-RU"),
    favorite: false,
    selected: false,
    image: "",
  };
}

function addChatMessage(role, text) {
  state.chat.push({ role, text });
  saveState();
  renderChat();
}

function handleGeneratePosts() {
  const prompt = elements.chatPrompt.value.trim();
  if (!prompt) {
    addChatMessage("system", "Сначала опишите тему, чтобы GPT мог предложить идеи.");
    return;
  }

  const count = Math.min(Math.max(parseInt(elements.postCount.value, 10) || 1, 1), 20);

  addChatMessage("user", prompt);
  addChatMessage("assistant", `Создаю ${count} пост(ов) по теме: ${prompt}.`);

  const newPosts = Array.from({ length: count }, (_, index) => createPost(prompt, index));
  state.posts = [...newPosts, ...state.posts];
  saveState();
  renderPosts();
  elements.chatPrompt.value = "";
}

function createPlaceholderImage(title) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5b7cfa" />
        <stop offset="100%" stop-color="#9b6bff" />
      </linearGradient>
    </defs>
    <rect width="640" height="360" fill="url(#bg)" />
    <rect x="32" y="32" width="576" height="296" rx="24" fill="rgba(255,255,255,0.2)" />
    <text x="50%" y="50%" text-anchor="middle" fill="#ffffff" font-size="26" font-family="Inter, sans-serif">
      ${title.slice(0, 60)}
    </text>
    <text x="50%" y="70%" text-anchor="middle" fill="#ffffff" font-size="14" font-family="Inter, sans-serif">
      Gemini • иллюстрация к посту
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function handleGenerateImages() {
  const selected = state.posts.filter((post) => post.selected);
  if (!selected.length) {
    elements.imageStatus.textContent = "Выберите посты в библиотеке, чтобы создать картинки.";
    return;
  }

  selected.forEach((post) => {
    post.image = createPlaceholderImage(post.title);
  });

  elements.imageStatus.textContent = `Готово! Создано изображений: ${selected.length}.`;
  saveState();
  renderPosts();
}

function handleAddBot() {
  const name = elements.botName.value.trim();
  if (!name) return;
  state.bots.push(name);
  elements.botName.value = "";
  saveState();
  renderSettings();
}

function handleAddChannel() {
  const name = elements.channelName.value.trim();
  if (!name) return;
  state.channels.push(name);
  elements.channelName.value = "";
  saveState();
  renderSettings();
}

function handleQueuePosts() {
  const favorites = state.posts.filter((post) => post.favorite);
  if (!favorites.length) {
    elements.publishLog.textContent = "Нет избранных постов для отправки.";
    return;
  }

  const bot = elements.publishBot.value || "не выбран";
  const channel = elements.publishChannel.value || "не выбран";

  elements.publishLog.innerHTML = `Отправка ${favorites.length} постов ботом <strong>${bot}</strong> в канал <strong>${channel}</strong>.`;
}

function handleReset() {
  localStorage.removeItem(STORAGE_KEY);
  state.chat = [];
  state.posts = [];
  state.bots = [];
  state.channels = [];
  loadState();
  renderAll();
}

function renderAll() {
  renderChat();
  renderPosts();
  renderSettings();
}

function init() {
  loadState();
  renderAll();

  elements.generatePosts.addEventListener("click", handleGeneratePosts);
  elements.showFavorites.addEventListener("change", renderPosts);
  elements.generateImages.addEventListener("click", handleGenerateImages);
  elements.addBot.addEventListener("click", handleAddBot);
  elements.addChannel.addEventListener("click", handleAddChannel);
  elements.queuePosts.addEventListener("click", handleQueuePosts);
  elements.resetStorage.addEventListener("click", handleReset);
}

init();
