document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(".column-toggle");
  const pagination = document.getElementById("pagination");
  const tableBody = document.querySelector("#preview-table tbody");
  const table = document.getElementById("preview-table");
  const mobileCardsContainer = document.getElementById("mobile-cards-container");
  const selectAllBtn = document.getElementById("select-all");
  const deselectAllBtn = document.getElementById("deselect-all");
  const toggleColumnsBtn = document.getElementById("toggle-columns");
  const columnsContainer = document.getElementById("columns-container");
  const toggleIcon = document.getElementById("toggle-icon");

  const rowsPerPage = 10;
  let currentPage = 1;
  let allRows = [];
  let allMobileCards = [];

  if (tableBody) {
    allRows = Array.from(tableBody.querySelectorAll("tr"));
  }
  if (mobileCardsContainer) {
    allMobileCards = Array.from(mobileCardsContainer.querySelectorAll(".mobile-card"));
  }

  function updateColumnVisibility() {
    const visibleCols = {};
    checkboxes.forEach((cb) => {
      visibleCols[cb.dataset.col] = cb.checked;
    });

    if (table) {
      const allCells = table.querySelectorAll("th[data-col], td[data-col]");
      allCells.forEach((cell) => {
        const colIndex = cell.dataset.col;
        if (visibleCols[colIndex]) {
          cell.classList.remove("hidden-col");
        } else {
          cell.classList.add("hidden-col");
        }
      });
    }

    if (mobileCardsContainer) {
      const allCardRows = mobileCardsContainer.querySelectorAll(".card-row[data-col]");
      allCardRows.forEach((row) => {
        const colIndex = row.dataset.col;
        if (visibleCols[colIndex]) {
          row.classList.remove("hidden-col");
        } else {
          row.classList.add("hidden-col");
        }
      });
    }
  }

  function displayPage(page) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    if (allRows.length > 0) {
      allRows.forEach((row, i) => {
        row.style.display = i >= start && i < end ? "" : "none";
      });
    }

    if (allMobileCards.length > 0) {
      allMobileCards.forEach((card, i) => {
        card.style.display = i >= start && i < end ? "block" : "none";
      });
    }

    updatePaginationButtons(page);
  }

  function updatePaginationButtons(activePage) {
    if (!pagination) return;

    pagination.innerHTML = "";
    const totalItems = Math.max(allRows.length, allMobileCards.length);
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    if (totalPages <= 1) return;

    if (activePage > 1) {
      const prevLi = document.createElement("li");
      prevLi.classList.add("page-item");
      const prevA = document.createElement("a");
      prevA.className = "page-link";
      prevA.href = "#";
      prevA.innerHTML = "&laquo;";
      prevA.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = activePage - 1;
        displayPage(currentPage);
      });
      prevLi.appendChild(prevA);
      pagination.appendChild(prevLi);
    }

    const maxVisiblePages = 5;
    let startPage = Math.max(1, activePage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement("li");
      li.classList.add("page-item");
      if (i === activePage) li.classList.add("active");

      const a = document.createElement("a");
      a.className = "page-link";
      a.href = "#";
      a.innerText = i;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        displayPage(i);
      });

      li.appendChild(a);
      pagination.appendChild(li);
    }

    if (activePage < totalPages) {
      const nextLi = document.createElement("li");
      nextLi.classList.add("page-item");
      const nextA = document.createElement("a");
      nextA.className = "page-link";
      nextA.href = "#";
      nextA.innerHTML = "&raquo;";
      nextA.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = activePage + 1;
        displayPage(currentPage);
      });
      nextLi.appendChild(nextA);
      pagination.appendChild(nextLi);
    }
  }

  function initializeHorizontalScroll() {
    const tableContainer = document.querySelector(".table-scroll");
    if (tableContainer && window.innerWidth <= 768) {
      let isDown = false;
      let startX;
      let scrollLeft;

      tableContainer.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - tableContainer.offsetLeft;
        scrollLeft = tableContainer.scrollLeft;
      });

      tableContainer.addEventListener("mouseleave", () => {
        isDown = false;
      });

      tableContainer.addEventListener("mouseup", () => {
        isDown = false;
      });

      tableContainer.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tableContainer.offsetLeft;
        const walk = (x - startX) * 2;
        tableContainer.scrollLeft = scrollLeft - walk;
      });

      let startTouchX = 0;
      let startScrollLeft = 0;

      tableContainer.addEventListener("touchstart", (e) => {
        startTouchX = e.touches[0].clientX;
        startScrollLeft = tableContainer.scrollLeft;
      });

      tableContainer.addEventListener("touchmove", (e) => {
        const touchX = e.touches[0].clientX;
        const diffX = startTouchX - touchX;
        tableContainer.scrollLeft = startScrollLeft + diffX;
      });
    }
  }

  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      checkboxes.forEach((cb) => {
        cb.checked = true;
      });
      updateColumnVisibility();
    });
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener("click", () => {
      checkboxes.forEach((cb) => {
        cb.checked = false;
      });
      updateColumnVisibility();
    });
  }

  if (toggleColumnsBtn && columnsContainer && toggleIcon) {
    toggleColumnsBtn.addEventListener("click", () => {
      if (columnsContainer.classList.contains("collapsed")) {
        columnsContainer.classList.remove("collapsed");
        toggleIcon.className = "fas fa-eye";
        toggleColumnsBtn.innerHTML = '<i class="fas fa-eye" id="toggle-icon"></i> Ocultar Columnas';
      } else {
        columnsContainer.classList.add("collapsed");
        toggleIcon.className = "fas fa-eye-slash";
        toggleColumnsBtn.innerHTML = '<i class="fas fa-eye-slash" id="toggle-icon"></i> Mostrar Columnas';
      }
    });
  }

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", updateColumnVisibility);
  });

  if (allRows.length > 0 || allMobileCards.length > 0) {
    displayPage(currentPage);
    updateColumnVisibility();
  }

  initializeHorizontalScroll();

  window.addEventListener("resize", () => {
    initializeHorizontalScroll();
  });

  window.previewModule = {
    allRows,
    currentPage,
    displayPage,
    updateColumnVisibility
  };
});

function showSpinner() {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) {
    spinner.style.display = "block";
  }

  const exportBtn = document.querySelector('button[type="submit"]');
  if (exportBtn) {
    exportBtn.disabled = true;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Exportando...';
  }
}