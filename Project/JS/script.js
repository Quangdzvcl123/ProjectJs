const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsDiv = document.getElementById("results");

searchBtn.addEventListener("click", searchWiki);

window.addEventListener("DOMContentLoaded", () => {
  loadDailyInfo();
  loadFeaturedArticles();
});

// ======== BÀI VIẾT CHỌN LỌC ========
let featuredArticles = [];
let featuredShown = 1; // chỉ hiển thị 1 bài đầu tiên

async function loadFeaturedArticles() {
  const url =
    "https://vi.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=categorymembers&gcmtitle=Thể_loại:Bài_viết_chọn_lọc&gcmlimit=20&prop=pageimages|extracts&exchars=120&exintro&explaintext&piprop=thumbnail&pithumbsize=100";

  const container = document.getElementById("featuredArticles");
  container.innerHTML = `<div class="text-secondary">Đang tải...</div>`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    featuredArticles = Object.values(data.query?.pages || {});
    showFeaturedArticles();
  } catch {
    container.innerHTML = `<div class="text-danger">Không tải được bài viết chọn lọc.</div>`;
  }
}

function showFeaturedArticles() {
  const container = document.getElementById("featuredArticles");
  container.innerHTML = "";

  if (featuredArticles.length === 0) {
    container.innerHTML = `<div>Không có bài viết chọn lọc.</div>`;
    return;
  }

  // Giới hạn số bài hiển thị
  const toShow = featuredArticles.slice(0, featuredShown);
  toShow.forEach((page) => {
    const img = page.thumbnail
      ? `<img src="${page.thumbnail.source}" class="wiki-thumb" alt="${page.title}">`
      : `<div class="wiki-thumb bg-light d-flex align-items-center justify-content-center">📰</div>`;

    const div = document.createElement("div");
    div.className = "d-flex align-items-center border-bottom pb-2 mb-2";
    div.innerHTML = `${img}<div><strong>${page.title}</strong><br><small>${page.extract || ""}</small></div>`;
    div.addEventListener("click", () => showArticleDetail(page.pageid));
    container.appendChild(div);
  });

  // Cập nhật trạng thái nút
  document.getElementById("addFeaturedBtn").disabled = featuredShown >= featuredArticles.length;
  document.getElementById("hideFeaturedBtn").disabled = featuredShown <= 1;
}

// Nút thêm bài viết
document.getElementById("addFeaturedBtn").addEventListener("click", () => {
  if (featuredShown < featuredArticles.length) {
    featuredShown++;
    showFeaturedArticles();
  }
});

// Nút ẩn bớt bài viết
document.getElementById("hideFeaturedBtn").addEventListener("click", () => {
  if (featuredShown > 1) {
    featuredShown--;
    showFeaturedArticles();
  }
});

 
// ======== NGÀY NÀY NĂM XƯA ========
async function loadDailyInfo() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // ⚠️ dùng tiếng Anh 
  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;

  const container = document.getElementById("dailyInfo");
  if (!container) return;
  container.innerHTML = `<div class="text-secondary">Đang tải...</div>`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    container.innerHTML = "";

    if (!data.events || data.events.length === 0) {
      container.innerHTML = `<p class="text-muted">Không có dữ liệu cho ngày hôm nay.</p>`;
      return;
    }

    
    data.events.slice(0, 6).forEach(event => {
      const title = event.pages?.[0]?.titles?.normalized || event.text.split("–")[0].trim();
      const extract = event.text;
      const pageId = event.pages?.[0]?.pageid;
      const thumb = event.pages?.[0]?.thumbnail?.source;

      const div = document.createElement("div");
      div.className = "card mb-2 p-2 shadow-sm wiki-card";
      div.innerHTML = `
        <div class="d-flex align-items-center">
          ${thumb ? `<img src="${thumb}" class="wiki-thumb me-2" alt="${title}">` :
            `<div class="wiki-thumb bg-light d-flex align-items-center justify-content-center text-secondary">📜</div>`}
          <div>
            <h6 class="mb-1">${title}</h6>
            <p class="text-muted small mb-0">${extract}</p>
          </div>
        </div>`;

      if (pageId) {
        div.addEventListener("click", () => showArticleDetail(pageId));
        div.style.cursor = "pointer";
      }

      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = `<p class="text-danger">❌ Không tải được dữ liệu: ${err.message}</p>`;
  }
}


// ======== TÌM KIẾM ========
async function searchWiki() {
  const query = searchInput.value.trim();
  if (!query) return alert("⚠️ Vui lòng nhập từ khóa!");

  const url = `https://vi.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrsearch=${encodeURIComponent(
    query
  )}&prop=pageimages|extracts&exintro&explaintext&exchars=150&piprop=thumbnail&pithumbsize=100`;

  resultsDiv.innerHTML = `<div class="text-center text-secondary">🔎 Đang tìm kiếm...</div>`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;
    resultsDiv.innerHTML = "";

    if (!pages) {
      resultsDiv.innerHTML = `<div class="text-center text-danger">Không tìm thấy kết quả nào!</div>`;
      return;
    }

    Object.values(pages).forEach((page) => {
      const imgHTML = page.thumbnail
        ? `<img src="${page.thumbnail.source}" class="wiki-thumb" alt="${page.title}">`
        : `<div class="wiki-thumb bg-light d-flex align-items-center justify-content-center text-secondary">📰</div>`;

      const div = document.createElement("div");
      div.classList.add("card", "wiki-card", "mb-2", "p-2", "shadow-sm");
      div.innerHTML = `
        <div class="d-flex align-items-center">
          ${imgHTML}
          <div>
            <h6 class="mb-1">${page.title}</h6>
            <p class="text-muted small mb-0">${page.extract || "Không có mô tả."}</p>
          </div>
        </div>`;
      div.addEventListener("click", () => showArticleDetail(page.pageid));
      resultsDiv.appendChild(div);
    });
  } catch (err) {
    resultsDiv.innerHTML = `<p class="text-danger">❌ Lỗi tải dữ liệu: ${err.message}</p>`;
  }
}

// ======== CHI TIẾT BÀI VIẾT ========
async function showArticleDetail(pageId) {
  const url = `https://vi.wikipedia.org/w/api.php?action=query&origin=*&format=json&pageids=${pageId}&prop=extracts|pageimages&explaintext&piprop=original`;

  resultsDiv.innerHTML = `<div class="text-center text-secondary">⏳ Đang tải bài viết...</div>`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];

    const imgHTML = page.original
      ? `<img src="${page.original.source}" alt="${page.title}" class="img-fluid rounded mb-3">`
      : "";
    
    resultsDiv.innerHTML = `
      <div class="card p-4 shadow-sm">
        <button id="backBtn" class="btn btn-outline-secondary mb-3">⬅ Quay lại</button>
        <h3>${page.title}</h3>
        ${imgHTML}
        <p>${page.extract.replace(/\n/g, "<br>")}</p>
        <div id="relatedArticles" class="mt-4"></div>
      </div>`;
    
    document.getElementById("backBtn").addEventListener("click", () => {
      resultsDiv.innerHTML = "";
      showFeaturedArticles();
    });

    loadRelatedArticles(page.title);
  } catch (err) {
    resultsDiv.innerHTML = `<p class="text-danger">❌ Không tải được nội dung: ${err.message}</p>`;
  }
}

// ======== BÀI LIÊN QUAN ========
async function loadRelatedArticles(title) {
  const relatedDiv = document.getElementById("relatedArticles");
  relatedDiv.innerHTML = `<h5 class="mt-4">🔗 Bài viết liên quan</h5><div class="text-secondary">Đang tải...</div>`;

  const url = `https://vi.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=links&titles=${encodeURIComponent(
    title
  )}&gpllimit=5&prop=pageimages|extracts&exintro&explaintext&exchars=100&piprop=thumbnail&pithumbsize=80`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) {
      relatedDiv.innerHTML += `<p class="text-muted">Không có bài viết liên quan.</p>`;
      return;
    }

    const list = document.createElement("div");
    list.className = "related-list mt-2";

    Object.values(pages).forEach((p) => {
      const item = document.createElement("div");
      item.className = "d-flex align-items-center border-bottom py-2";
      const img = p.thumbnail
        ? `<img src="${p.thumbnail.source}" class="wiki-thumb">`
        : `<div class="wiki-thumb bg-light d-flex align-items-center justify-content-center">📰</div>`;
      item.innerHTML = `${img}<div><strong>${p.title}</strong><br><small>${p.extract || ""}</small></div>`;
      item.addEventListener("click", () => showArticleDetail(p.pageid));
      list.appendChild(item);
    });

    relatedDiv.innerHTML = `<h5 class="mt-4">🔗 Bài viết liên quan</h5>`;
    relatedDiv.appendChild(list);
  } catch {
    relatedDiv.innerHTML += `<p class="text-danger">Không tải được bài liên quan.</p>`;
  }
}
