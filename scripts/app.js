(function () {
  "use strict";

  const entryList = document.querySelector("#entryList");
  const tagFilter = document.querySelector("#tagFilter");
  const searchInput = document.querySelector("#searchInput");
  const statsCounter = document.querySelector("#statsCounter");
  const totalRecords = document.querySelector("#totalRecords");
  const tagCount = document.querySelector("#tagCount");
  const latestDate = document.querySelector("#latestDate");

  const diarySources = [
    "./data/diary.json",
    "./data/agentdiary.json",
  ];

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

  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);

  const normalize = (value = "") => String(value).trim().toLowerCase();

  const formatDate = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().slice(0, 10);
  };

  const loadDiarySource = (source) => fetch(source)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${source}: HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((entries) => {
      if (!Array.isArray(entries)) {
        throw new Error(`${source}: JSON root must be an array`);
      }
      return entries;
    });

  const getAllTags = (entries) => [...new Set(entries.flatMap((entry) => entry.tags || []))].sort();

  const getSearchText = (entry) => [
    entry.title,
    entry.summary,
    entry.type,
    ...(entry.tags || []),
    ...(entry.notes || []),
  ].join(" ");

  const renderTags = (tags = []) => tags
    .slice(0, 6)
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");

  const renderEvidence = (screenshots = []) => {
    const validShots = screenshots.filter((shot) => shot && shot.src);
    if (!validShots.length) return "";

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

  const renderEntry = (entry) => {
    const typeLabel = typeLabels[entry.type] || entry.type || "记录";
    const notes = Array.isArray(entry.notes) ? entry.notes.slice(0, 3) : [];

    return `
      <article id="${escapeHtml(entry.id)}" class="entry-card">
        <div class="entry-top">
          <span class="entry-date">${escapeHtml(formatDate(entry.date))}</span>
          <span class="entry-type">${escapeHtml(typeLabel)}</span>
        </div>
        <h3>${escapeHtml(entry.title)}</h3>
        <p>${escapeHtml(entry.summary)}</p>
        <ul class="entry-notes">
          ${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
        </ul>
        ${renderEvidence(entry.screenshots || [])}
        <div class="tag-row">${renderTags(entry.tags || [])}</div>
      </article>
    `;
  };

  const renderArchive = (entries) => {
    if (!entryList) return;

    const selectedTag = tagFilter ? tagFilter.value : "all";
    const query = normalize(searchInput ? searchInput.value : "");
    const limitRaw = entryList.dataset.limit || "all";
    const limit = limitRaw === "all" ? Number.POSITIVE_INFINITY : Number(limitRaw);

    const filtered = entries.filter((entry) => {
      const matchesTag = selectedTag === "all" || (entry.tags || []).includes(selectedTag);
      const matchesQuery = !query || normalize(getSearchText(entry)).includes(query);
      return matchesTag && matchesQuery;
    });

    const visible = filtered.slice(0, limit);

    if (statsCounter) {
      const suffix = Number.isFinite(limit) && filtered.length > visible.length
        ? ` / 显示 ${visible.length}`
        : "";
      statsCounter.textContent = `${filtered.length} 条记录${suffix}`;
    }

    if (!visible.length) {
      entryList.innerHTML = `
        <article class="entry-card empty-state">
          <div class="entry-top">
            <span class="entry-date">Archive</span>
            <span class="entry-type">Empty</span>
          </div>
          <h3>没有匹配记录</h3>
          <p>换一个关键词或信号，档案会重新展开。</p>
        </article>
      `;
      return;
    }

    entryList.innerHTML = visible.map(renderEntry).join("");
  };

  const hydrateFilters = (entries) => {
    if (!tagFilter) return;
    const tags = getAllTags(entries);
    tags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      tagFilter.appendChild(option);
    });

    tagFilter.addEventListener("change", () => renderArchive(entries));
    if (searchInput) {
      searchInput.addEventListener("input", () => renderArchive(entries));
    }
  };

  const hydrateHeroStats = (entries) => {
    const tags = getAllTags(entries);
    if (totalRecords) totalRecords.textContent = String(entries.length);
    if (tagCount) tagCount.textContent = String(tags.length);
    if (latestDate) latestDate.textContent = formatDate(entries[0] && entries[0].date);
  };

  const initTilt = () => {
    const panels = document.querySelectorAll("[data-tilt]");
    panels.forEach((panel) => {
      panel.addEventListener("pointermove", (event) => {
        const rect = panel.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        panel.style.setProperty("--ry", `${x * 4}deg`);
        panel.style.setProperty("--rx", `${y * -4}deg`);
      });

      panel.addEventListener("pointerleave", () => {
        panel.style.setProperty("--ry", "0deg");
        panel.style.setProperty("--rx", "0deg");
      });
    });
  };

  initTilt();

  Promise.all(diarySources.map(loadDiarySource))
    .then((groups) => groups.flat())
    .then((entries) => entries
      .filter((entry) => entry && entry.id && entry.title)
      .sort((a, b) => new Date(b.date) - new Date(a.date)))
    .then((entries) => {
      hydrateHeroStats(entries);
      hydrateFilters(entries);
      renderArchive(entries);
    })
    .catch((error) => {
      if (statsCounter) statsCounter.textContent = "载入失败";
      if (entryList) {
        entryList.innerHTML = `
          <article class="entry-card empty-state">
            <div class="entry-top">
              <span class="entry-date">Archive</span>
              <span class="entry-type">Error</span>
            </div>
            <h3>记录加载失败</h3>
            <p>${escapeHtml(error.message)}</p>
          </article>
        `;
      }
    });
}());
