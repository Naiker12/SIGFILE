document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("uploadedFilesModal");
  const list = document.getElementById("uploads-list");

  modal.addEventListener("show.bs.modal", loadUploads);

  function loadUploads() {
    fetch("/uploads")
      .then((res) => res.json())
      .then((files) => {
        list.innerHTML = "";

        if (files.length === 0) {
          list.innerHTML =
            "<li class='list-group-item'>No hay archivos en uploads/</li>";
          return;
        }

        files.forEach((file) => {
          const li = document.createElement("li");
          li.className =
            "list-group-item d-flex justify-content-between align-items-center";

          li.innerHTML = `
            <span>${file}</span>
            <button class="btn btn-sm btn-danger" data-filename="${file}">Eliminar</button>
          `;

          li.querySelector("button").addEventListener("click", () => {
            deleteFile(file);
          });

          list.appendChild(li);
        });
      });
  }

  function deleteFile(filename) {
    if (!confirm(`¿Eliminar archivo ${filename}?`)) return;

    fetch("/delete-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          loadUploads();
        } else {
          alert("Error eliminando archivo: " + result.message);
        }
      });
  }
});