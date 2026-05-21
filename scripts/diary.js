const entryList = document.querySelector("#entryList");
const tagFilter = document.querySelector("#tagFilter");
const statsCounter = document.querySelector("#statsCounter");

const escapeHtml = (value = "") =>
  value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);

const formatTags = (tags) =>
  tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

const typeLabels = {
  affective: "情感",
  android: "Android",
  architecture: "架构",
  automation: "自动化",
  boundary: "边界",
  builder: "构建",
  comparison: "对比",
  concept: "概念",
  "code-intelligence": "代码理解",
  engineering: "工程",
  harness: "Harness",
  memory: "记忆",
  "mobile-ui": "移动界面",
  organization: "组织",
  orchestration: "编排",
  proactive: "主动",
  product: "产品",
  recovery: "修复",
  reference: "参照",
  reflection: "思考",
  research: "研究",
  review: "审查",
  skill: "Skill",
  theme: "主线",
  tooling: "工具",
  toolchain: "工具链",
  workflow: "流程",
};

const renderEvidence = (screenshots = []) => {
  const validShots = screenshots.filter((shot) => shot.src);

  if (!validShots.length) {
    return "";
  }

  const visibleShots = validShots.slice(0, 3);
  const remaining = validShots.length - visibleShots.length;

  return `
    <div class="entry-evidence-grid">
      ${visibleShots.map((shot) => {
        const caption = escapeHtml(shot.caption || "脱敏截图");
        return `<img src="${escapeHtml(shot.src)}" alt="${caption}" loading="lazy" />`;
      }).join("")}
      ${remaining > 0 ? `<div class="evidence-more">+${remaining}</div>` : ""}
    </div>
  `;
};

const renderEntries = (entries, selectedTag = "all") => {
  const visibleEntries = selectedTag === "all"
    ? entries
    : entries.filter((entry) => entry.tags.includes(selectedTag));

  statsCounter.textContent = `${visibleEntries.length} 条记录`;

  if (visibleEntries.length === 0) {
    entryList.innerHTML = `
      <div class="card archive-loading">
        <h3>没有匹配记录</h3>
        <p>换一个筛选条件，或稍后继续追加。</p>
      </div>
    `;
    return;
  }

  entryList.innerHTML = visibleEntries.map((entry) => {
    const typeLabel = typeLabels[entry.type] || entry.type;

    return `
      <article id="${escapeHtml(entry.id)}" class="entry-card">
        <div class="entry-top">
          <span class="entry-date">${escapeHtml(entry.date)}</span>
          <span class="entry-type">${escapeHtml(typeLabel)}</span>
        </div>
        <div class="entry-main">
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.summary)}</p>
          <ul class="entry-notes">
            ${entry.notes.slice(0, 3).map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
            ${entry.notes.length > 3 ? `<li class="entry-more-note">还有 ${entry.notes.length - 3} 个复盘点</li>` : ''}
          </ul>
          <div class="tag-row">${formatTags(entry.tags)}</div>
          ${renderEvidence(entry.screenshots)}
        </div>
      </article>
    `;
  }).join("");
};

const hydrateFilters = (entries) => {
  const tags = [...new Set(entries.flatMap((entry) => entry.tags))].sort();
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });

  tagFilter.addEventListener("change", () => renderEntries(entries, tagFilter.value));
};

const diarySources = [
  "./data/diary.json",
  "./data/agentdiary.json",
];

const loadDiarySource = (source) =>
  fetch(source)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`${source}: HTTP ${response.status}`);
    }
    return response.json();
  })
  .then((entries) => {
    if (!Array.isArray(entries)) {
      throw new Error(`${source}: JSON 根节点必须是数组`);
    }
    return entries;
  });

Promise.all(diarySources.map(loadDiarySource))
  .then((entries) => {
    entries = entries.flat();
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    hydrateFilters(entries);
    renderEntries(entries);
  })
  .catch((error) => {
    entryList.innerHTML = `
      <div class="card archive-loading">
        <h3>记录加载失败</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  });
