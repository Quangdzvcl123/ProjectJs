const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsDiv = document.getElementById("results");

searchBtn.addEventListener("click", searchWiki);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchWiki();
});

async function searchWiki() {
  const query = searchInput.value.trim();
  if (!query) return alert("⚠️ Vui lòng nhập từ khóa!");

  const url = `https://vi.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrsearch=${encodeURIComponent(
    query
  )}&prop=pageimages|extracts&exintro&explaintext&exchars=150&piprop=thumbnail&pithumbsize=100`;

  resultsDiv.innerHTML = `<div class="text-center text-secondary mt-4">🔎 Đang tìm kiếm...</div>`;

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
      const div = document.createElement("div");
      div.classList.add("card", "wiki-card", "mb-2", "p-2", "shadow-sm", "d-flex", "align-items-center");

      const imgHTML = page.thumbnail
        ? `<img src="${page.thumbnail.source}" class="wiki-thumb" alt="${page.title}">`
        : `<div class="no-thumb">📰</div>`;

      div.innerHTML = `
        ${imgHTML}
        <div>
          <h6 class="mb-1">${page.title}</h6>
          <p class="text-muted small mb-0">${page.extract || "Không có mô tả."}</p>
        </div>
      `;

      div.addEventListener("click", () => showArticleDetail(page.pageid));
      resultsDiv.appendChild(div);
    });
  } catch (err) {
    resultsDiv.innerHTML = `<p class="text-danger">❌ Lỗi tải dữ liệu: ${err.message}</p>`;
  }
}

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
        <a href="https://vi.wikipedia.org/?curid=${page.pageid}" target="_blank" class="btn btn-primary mt-3">Xem trên Wikipedia</a>
      </div>
    `;

    document.getElementById("backBtn").addEventListener("click", searchWiki);

    // ✅ Hiển thị công thức toán học nếu có
    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  } catch (err) {
    resultsDiv.innerHTML = `<p class="text-danger">❌ Không tải được nội dung: ${err.message}</p>`;
  }
}
