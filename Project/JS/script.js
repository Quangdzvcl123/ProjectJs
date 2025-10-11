const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsDiv = document.getElementById("results");

searchBtn.addEventListener("click", searchWiki);

async function searchWiki() {
  const query = searchInput.value.trim();
  if (!query) return alert("Please enter a keyword!");

  const url = `https://vi.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrsearch=${encodeURIComponent(
    query
  )}&prop=pageimages|extracts&exintro&explaintext&exchars=250&piprop=thumbnail&pithumbsize=400`;

  resultsDiv.innerHTML = "<p>🔎 Đang tìm kiếm...</p>";

  try {
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;

    resultsDiv.innerHTML = "";

    if (!pages) {
      resultsDiv.innerHTML = "<p>Không tìm thấy kết quả nào!</p>";
      return;
    }

    Object.values(pages).forEach((page) => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${page.thumbnail?.source || "https://via.placeholder.com/300"}" alt="${page.title}">
        <h2>${page.title}</h2>
        <p>${page.extract || "Không có mô tả."}</p>
      `;

      // Khi nhấn vào 1 bài viết → hiển thị chi tiết
      card.addEventListener("click", () => showArticleDetail(page.pageid));

      resultsDiv.appendChild(card);
    });
  } catch (err) {
    resultsDiv.innerHTML = `<p style="color:red">Lỗi tải dữ liệu: ${err.message}</p>`;
  }
}

async function showArticleDetail(pageId) {
  const url = `https://vi.wikipedia.org/w/api.php?action=query&origin=*&format=json&pageids=${pageId}&prop=extracts|pageimages&explaintext&piprop=original`;

  resultsDiv.innerHTML = "<p>⏳ Đang tải bài viết...</p>";

  try {
    const res = await fetch(url);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];

    resultsDiv.innerHTML = `
      <div class="article-detail">
        <button id="backBtn">⬅ Quay lại</button>
        <h1>${page.title}</h1>
        ${
          page.original
            ? `<img src="${page.original.source}" alt="${page.title}" />`
            : ""
        }
        <p>${page.extract.replace(/\n/g, "<br>")}</p>
        <a href="https://vi.wikipedia.org/?curid=${page.pageid}" target="_blank">
          🔗 Xem trên Wikipedia
        </a>
      </div>
    `;

    document.getElementById("backBtn").addEventListener("click", () => {
      searchWiki(); // Quay lại danh sách kết quả
    });
  } catch (err) {
    resultsDiv.innerHTML = `<p style="color:red">Không tải được nội dung: ${err.message}</p>`;
  }
}
