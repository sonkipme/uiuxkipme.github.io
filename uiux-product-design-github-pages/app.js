(function () {
  "use strict";
  const data = window.ROADMAP_DATA;
  if (!data) return;
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const escapeHtml = (v) => String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const textHtml = (v) => escapeHtml(v).replace(/\r?\n/g, "<br>");
  const progressKey = "uiux-product-design-roadmap-completed-v1";
  const monthId = (i) => "month-" + String(i + 1).padStart(2, "0");
  const sectionId = (i) => "section-" + String(i + 1);

  function renderTable(block) {
    const headers = (block.headers || []).map((cell) => "<th scope=\"col\">" + textHtml(cell) + "</th>").join("");
    const rows = (block.rows || []).map((row) => "<tr>" + row.map((cell) => "<td>" + textHtml(cell) + "</td>").join("") + "</tr>").join("");
    return "<div class=\"table-scroll\"><table class=\"content-table\"><thead><tr>" + headers + "</tr></thead><tbody>" + rows + "</tbody></table></div>";
  }

  function renderBlocks(blocks) {
    let html = "";
    let listOpen = false;
    (blocks || []).forEach((block) => {
      if (block.kind === "li") {
        if (!listOpen) { html += "<ul class=\"content-list\">"; listOpen = true; }
        html += "<li>" + textHtml(block.text) + "</li>";
        return;
      }
      if (listOpen) { html += "</ul>"; listOpen = false; }
      if (block.kind === "table") html += renderTable(block);
      else if (block.kind === "heading" || block.kind === "title") html += "<h4 class=\"content-subheading\">" + textHtml(block.text) + "</h4>";
      else if (block.text) html += "<p>" + textHtml(block.text) + "</p>";
    });
    if (listOpen) html += "</ul>";
    return html;
  }

  function renderGenericSection(section, index, extraClass) {
    return "<section class=\"generic-section " + (extraClass || "") + " search-target\" id=\"" + sectionId(index) + "\">" +
      "<p class=\"eyebrow\">PHẦN " + String(index + 1).padStart(2, "0") + "</p>" +
      "<h3>" + textHtml(section.title) + "</h3>" + renderBlocks(section.blocks) + "</section>";
  }

  function renderLesson(session) {
    const digits = String(session.number || "").match(/\d+/);
    const number = digits ? digits[0].padStart(3, "0") : "";
    const practice = session.practice ? "<p>" + textHtml(session.practice) + "</p>" : "";
    const output = session.output ? "<div class=\"lesson-output\"><strong>Đầu ra</strong><p>" + textHtml(session.output) + "</p></div>" : "";
    return "<article class=\"lesson-card search-target\" data-session=\"" + escapeHtml(number) + "\">" +
      "<div class=\"lesson-meta\"><input type=\"checkbox\" aria-label=\"Đánh dấu buổi " + escapeHtml(number) + " đã hoàn thành\" data-completion=\"" + escapeHtml(number) + "\"><span class=\"lesson-number\">" + escapeHtml(number) + "</span></div>" +
      "<div class=\"lesson-main\"><h4>" + textHtml(session.title) + "</h4>" + practice + "</div>" + output + "</article>";
  }

  function renderMonth(month, index) {
    const id = monthId(index);
    const lessons = (month.sessions || []).map(renderLesson).join("");
    const checklist = (month.checklist || []).length
      ? "<div class=\"month-checklist\"><h3>Tiêu chí hoàn tất chặng</h3><ul>" + month.checklist.map((item) => "<li>" + textHtml(item) + "</li>").join("") + "</ul></div>" : "";
    const info = [["Mục tiêu", month.goal], ["Đầu ra tháng", month.output], ["Cổng đánh giá", month.gate]]
      .filter((item) => item[1]).map((item) => "<div class=\"month-info\"><strong>" + escapeHtml(item[0]) + "</strong><p>" + textHtml(item[1]) + "</p></div>").join("");
    const summaryLabel = (month.sessions || []).length + " buổi";
    return "<details class=\"month-card\" id=\"" + id + "\" data-month-index=\"" + index + "\">" +
      "<summary><span class=\"month-number\">" + String(index + 1).padStart(2, "0") + "</span>" +
      "<span class=\"month-title\">" + textHtml(month.title) + "</span>" +
      "<span class=\"month-summary-meta\"><span data-month-progress-label>0 / " + summaryLabel + "</span></span>" +
      "<span class=\"month-chevron\" aria-hidden=\"true\">⌄</span></summary>" +
      "<div class=\"month-progress-line\"><span data-month-progress></span></div>" +
      "<div class=\"month-content\"><div class=\"month-intro-grid\">" + info + "</div>" +
      "<div class=\"lesson-heading\"><h3>Buổi học và thực hành</h3><span>" + summaryLabel + "</span></div>" +
      "<div class=\"lesson-list\">" + lessons + "</div>" + checklist + "</div></details>";
  }

  function renderNavigation() {
    const overview = "<a class=\"nav-link\" href=\"#overview\"><span class=\"nav-index\">00</span><span>Tổng quan</span></a>";
    const roadmap = "<a class=\"nav-link\" href=\"#roadmap\"><span class=\"nav-index\">15</span><span>15 chặng học</span></a>";
    const links = (data.sections || []).map((section, index) =>
      "<a class=\"nav-link\" href=\"#" + sectionId(index) + "\"><span class=\"nav-index\">" + String(index + 1).padStart(2, "0") + "</span><span>" + textHtml(section.title) + "</span></a>"
    );
    $("#main-nav").innerHTML = overview + links.slice(0, 5).join("") + roadmap + links.slice(5).join("");
    $("#month-nav").innerHTML = (data.months || []).map((month, index) =>
      "<a class=\"nav-link\" href=\"#" + monthId(index) + "\"><span class=\"nav-index\">" + String(index + 1).padStart(2, "0") + "</span><span>" + textHtml(month.title.replace(/^Tháng\s*/i, "")) + "</span></a>"
    ).join("");
  }

  function renderPage() {
    $("#page-title").textContent = data.title;
    $("#page-subtitle").textContent = [data.subtitle, data.schedule].filter(Boolean).join(" · ");
    $("#page-intro").textContent = (data.intro || [])[0] || "";
    $("#footer-title").textContent = data.title + " · " + data.schedule;
    $("#intro-copy").innerHTML = (data.intro || []).slice(1).map((item) => "<p>" + textHtml(item) + "</p>").join("");
    const sections = data.sections || [];
    $("#overview-sections").innerHTML = sections.slice(0, 5).map((s, i) => renderGenericSection(s, i, "overview-block")).join("");
    $("#additional-sections").innerHTML = sections.slice(5).map((s, i) => renderGenericSection(s, i + 5, "")).join("");
    $("#month-list").innerHTML = (data.months || []).map(renderMonth).join("");
    renderNavigation();
  }

  function readCompleted() {
    try {
      const stored = JSON.parse(localStorage.getItem(progressKey) || "[]");
      return new Set(Array.isArray(stored) ? stored.map(String) : []);
    } catch (_) { return new Set(); }
  }

  const completed = readCompleted();
  function saveCompleted() {
    try { localStorage.setItem(progressKey, JSON.stringify(Array.from(completed))); } catch (_) { /* storage may be unavailable */ }
  }

  function updateProgress() {
    const total = Number(data.sessionCount) || $$(".lesson-card").length;
    const count = completed.size;
    $("#completed-count").textContent = String(count);
    $("#progress-fill").style.width = (total ? Math.min(100, count / total * 100) : 0) + "%";
    const progressbar = $(".progress-track");
    if (progressbar) progressbar.setAttribute("aria-valuenow", String(count));
    $$(".lesson-card").forEach((card) => {
      const checkbox = $("input[data-completion]", card);
      const done = Boolean(checkbox && completed.has(checkbox.dataset.completion));
      if (checkbox) checkbox.checked = done;
      card.classList.toggle("completed", done);
    });
    $$(".month-card").forEach((month) => {
      const boxes = $$("input[data-completion]", month);
      const done = boxes.filter((box) => completed.has(box.dataset.completion)).length;
      const label = $("[data-month-progress-label]", month);
      const bar = $("[data-month-progress]", month);
      if (label) label.textContent = done + " / " + boxes.length + " buổi";
      if (bar) bar.style.width = (boxes.length ? done / boxes.length * 100 : 0) + "%";
    });
  }

  function bindProgress() {
    document.addEventListener("change", (event) => {
      const checkbox = event.target.closest("input[data-completion]");
      if (!checkbox) return;
      if (checkbox.checked) completed.add(checkbox.dataset.completion);
      else completed.delete(checkbox.dataset.completion);
      saveCompleted();
      updateProgress();
    });
    $("#reset-progress").addEventListener("click", () => {
      if (!completed.size) return;
      if (!window.confirm("Xóa toàn bộ tiến độ đã đánh dấu trên trình duyệt này?")) return;
      completed.clear();
      saveCompleted();
      updateProgress();
    });
  }

  function bindExpandButtons() {
    $("#expand-all").addEventListener("click", () => $$(".month-card").forEach((month) => { if (!month.hidden) month.open = true; }));
    $("#collapse-all").addEventListener("click", () => $$(".month-card").forEach((month) => { month.open = false; }));
    $("#print-button").addEventListener("click", () => window.print());
  }

  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLocaleLowerCase("vi");
  }

  function bindSearch() {
    const input = $("#site-search");
    const status = $("#search-status");
    const empty = $("#empty-search");
    const autoOpened = new Set();

    input.addEventListener("input", () => {
      const raw = input.value.trim();
      const query = normalize(raw);
      let matchedLessons = 0;
      let matchedSections = 0;
      let found = false;

      $$(".generic-section").forEach((section) => {
        const match = !query || normalize(section.textContent).includes(query);
        section.hidden = !match;
        if (query && match) { matchedSections += 1; found = true; }
      });

      $$(".month-card").forEach((month) => {
        const summary = $("summary", month);
        const wholeMatch = !query || normalize(month.textContent).includes(query);
        const titleMatch = !query || normalize(summary.textContent).includes(query);
        const lessons = $$(".lesson-card", month);
        let lessonMatches = 0;
        lessons.forEach((lesson) => {
          const match = !query || normalize(lesson.textContent).includes(query);
          lesson.hidden = !match;
          if (query && match) { lessonMatches += 1; matchedLessons += 1; }
        });
        month.hidden = !wholeMatch;
        if (query && wholeMatch) found = true;
        if (query && wholeMatch && (lessonMatches || titleMatch) && !month.open) {
          month.open = true;
          autoOpened.add(month.id);
        }
      });

      if (!query) {
        autoOpened.forEach((id) => { const month = document.getElementById(id); if (month) month.open = false; });
        autoOpened.clear();
      }

      status.classList.toggle("visible", Boolean(query));
      status.textContent = query
        ? (found ? "Kết quả cho “" + raw + "”: " + matchedLessons + " buổi học, " + matchedSections + " mục nội dung." : "Không tìm thấy nội dung cho “" + raw + "”.")
        : "";
      empty.hidden = !query || found;
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        event.preventDefault();
        input.focus();
      }
      if (event.key === "Escape" && document.activeElement === input) {
        input.value = "";
        input.dispatchEvent(new Event("input"));
        input.blur();
      }
    });
  }

  renderPage();
  bindProgress();
  bindExpandButtons();
  bindSearch();
  updateProgress();
})();

