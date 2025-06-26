document.addEventListener("DOMContentLoaded", () => {
  const duplicateModal = document.getElementById("duplicateModal");
  const rowSelect = document.getElementById("rowId");
  const confirmDuplicateBtn = document.getElementById("confirmDuplicate");

  function updateRowSelect() {
    if (!rowSelect) return;
    
    rowSelect.innerHTML = '<option value="">Seleccionar fila...</option>';
    
    if (window.previewModule && window.previewModule.allRows) {
      window.previewModule.allRows.forEach((row, index) => {
        const rowId = row.dataset.rowId || index + 1;
        const option = document.createElement("option");
        option.value = rowId;
        option.textContent = `Fila ${rowId}`;
        rowSelect.appendChild(option);
      });
    }
  }

  function duplicateRow(rowId, count) {
    if (!window.previewModule || !window.previewModule.allRows) {
      showError("Error", "No se pudo acceder a los datos de la tabla", {
        duration: 2000
      });
      return;
    }

    const targetRow = window.previewModule.allRows.find((row) => row.dataset.rowId == rowId);

    if (!targetRow) {
      showError("Error", `No se encontró la fila con ID ${rowId}`, {
        duration: 2000
      });
      return;
    }

    let copies = count - 1;

    if (copies < 1) {
      const confirmToast = showInfo(
        "Confirmación",
        "Solo se duplicará una vez. ¿Deseas continuar?",
        0
      );

      setTimeout(() => {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'toast-actions';
        actionsDiv.innerHTML = `
          <button class="btn btn-success">Sí</button>
          <button class="btn btn-danger">No</button>
        `;

        confirmToast.element.appendChild(actionsDiv);

        const yesBtn = actionsDiv.querySelector(".btn-success");
        const noBtn = actionsDiv.querySelector(".btn-danger");

        yesBtn.addEventListener("click", () => {
          hideToast(confirmToast);
          performDuplication(rowId, 1);
        });
        
        noBtn.addEventListener("click", () => {
          hideToast(confirmToast);
        });
      }, 50);

      return;
    }

    performDuplication(rowId, copies);
  }

  function performDuplication(rowId, count) {
    if (!window.previewModule || !window.previewModule.allRows) return;

    const targetRow = window.previewModule.allRows.find((row) => row.dataset.rowId == rowId);
    const targetIndex = window.previewModule.allRows.findIndex((row) => row.dataset.rowId == rowId);
    const newRows = [];

    for (let i = 0; i < count; i++) {
      const newRow = targetRow.cloneNode(true);
      const insertAfter = i === 0 ? targetRow : newRows[i - 1];
      insertAfter.parentNode.insertBefore(newRow, insertAfter.nextSibling);
      window.previewModule.allRows.splice(targetIndex + 1 + i, 0, newRow);
      newRows.push(newRow);
    }

    window.previewModule.allRows.forEach((row, index) => {
      const newId = index + 1;
      row.dataset.rowId = newId;
      const rowHeader = row.querySelector(".row-header");
      if (rowHeader) {
        rowHeader.textContent = newId;
      }
    });

    updateRowSelect();

    const rowsPerPage = 10;
    const originalRowPosition = targetIndex + 1;
    const originalRowPage = Math.ceil(originalRowPosition / rowsPerPage);
    const lastDuplicatedPosition = originalRowPosition + count;
    const lastDuplicatedPage = Math.ceil(lastDuplicatedPosition / rowsPerPage);

    if (window.previewModule.currentPage === originalRowPage) {
      if (lastDuplicatedPage === originalRowPage) {
        window.previewModule.displayPage(window.previewModule.currentPage);
      } else {
        window.previewModule.currentPage = lastDuplicatedPage;
        window.previewModule.displayPage(window.previewModule.currentPage);
      }
    } else {
      window.previewModule.currentPage = originalRowPage;
      window.previewModule.displayPage(window.previewModule.currentPage);
    }

    setTimeout(() => {
      newRows.forEach((row) => {
        row.style.backgroundColor = "#d4edda";
        row.style.transition = "background-color 0.3s ease";
        row.style.border = "2px solid #28a745";
      });

      setTimeout(() => {
        newRows.forEach((row) => {
          row.style.backgroundColor = "";
          row.style.border = "";
        });
      }, 3000);
    }, 100);

    showDuplicationSuccess(count, rowId, window.previewModule.allRows.length);
  }

  function showDuplicationSuccess(count, originalRowId, totalRows) {
    const successToast = showSuccess(
      "Éxito",
      `Se duplicaron ${count} fila(s) justo debajo de la fila ${originalRowId}. Total de filas: ${totalRows}`,
      0
    );

    setTimeout(() => {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'toast-actions';
      actionsDiv.innerHTML = `
        <button class="btn btn-primary" id="exportWithDuplicates">Exportar con Duplicados</button>
        <button class="btn btn-outline-primary" id="saveToOriginal">Guardar en Original</button>
      `;

      successToast.element.appendChild(actionsDiv);

      const exportBtn = actionsDiv.querySelector("#exportWithDuplicates");
      const saveBtn = actionsDiv.querySelector("#saveToOriginal");

      exportBtn.addEventListener("click", () => {
        hideToast(successToast);
        handleExportWithDuplicates();
      });

      saveBtn.addEventListener("click", () => {
        hideToast(successToast);
        handleSaveToOriginal();
      });
    }, 50);
  }

  function handleExportWithDuplicates() {
    const form = document.querySelector('form[action="/export"]');
    if (form) {
      const tableData = extractTableData();
      
      let exportModeInput = form.querySelector('input[name="export_mode"]');
      if (!exportModeInput) {
        exportModeInput = document.createElement('input');
        exportModeInput.type = 'hidden';
        exportModeInput.name = 'export_mode';
        form.appendChild(exportModeInput);
      }
      exportModeInput.value = 'new_file';
      
      let tableDataInput = form.querySelector('input[name="table_data"]');
      if (!tableDataInput) {
        tableDataInput = document.createElement('input');
        tableDataInput.type = 'hidden';
        tableDataInput.name = 'table_data';
        form.appendChild(tableDataInput);
      }
      tableDataInput.value = JSON.stringify(tableData);
      
      showInfo("Exportando", "Se creará un nuevo archivo con todas las filas duplicadas", {
        duration: 2000
      });
    }
  }

  function handleSaveToOriginal() {
    const form = document.querySelector('form[action="/export"]');
    if (form) {
      const tableData = extractTableData();
      
      let exportModeInput = form.querySelector('input[name="export_mode"]');
      if (!exportModeInput) {
        exportModeInput = document.createElement('input');
        exportModeInput.type = 'hidden';
        exportModeInput.name = 'export_mode';
        form.appendChild(exportModeInput);
      }
      exportModeInput.value = 'overwrite';
      
      let tableDataInput = form.querySelector('input[name="table_data"]');
      if (!tableDataInput) {
        tableDataInput = document.createElement('input');
        tableDataInput.type = 'hidden';
        tableDataInput.name = 'table_data';
        form.appendChild(tableDataInput);
      }
      tableDataInput.value = JSON.stringify(tableData);
      
      showInfo("Guardando", "El archivo original será actualizado con las filas duplicadas", {
        duration: 2000
      });
    }
  }

  function extractTableData() {
    const tableData = [];
    const table = document.getElementById('preview-table');
    
    if (!table) return tableData;
    
    const headers = [];
    const headerCells = table.querySelectorAll('thead th[data-col]');
    headerCells.forEach(cell => {
      const colIndex = cell.dataset.col;
      const headerName = cell.dataset.header || cell.textContent.trim();
      headers[colIndex] = headerName;
    });
    
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const rowData = {};
      const cells = row.querySelectorAll('td[data-col]');
      cells.forEach(cell => {
        const colIndex = cell.dataset.col;
        const headerName = headers[colIndex];
        if (headerName) {
          rowData[headerName] = cell.textContent.trim();
        }
      });
      if (Object.keys(rowData).length > 0) {
        tableData.push(rowData);
      }
    });
    
    return tableData;
  }

  if (duplicateModal) {
    duplicateModal.addEventListener("show.bs.modal", () => {
      updateRowSelect();
    });
  }

  if (confirmDuplicateBtn) {
    confirmDuplicateBtn.addEventListener("click", () => {
      if (!window.validationModule || !window.validationModule.validateDuplicateForm()) {
        return;
      }

      const selectedRowId = rowSelect.value;
      const count = parseInt(document.getElementById("duplicateCount").value);

      duplicateRow(selectedRowId, count);

      const modalInstance = bootstrap.Modal.getInstance(duplicateModal);
      if (modalInstance) {
        modalInstance.hide();
      }

      document.getElementById("duplicateForm").reset();
    });
  }

  window.duplicateModule = {
    updateRowSelect,
    duplicateRow,
    performDuplication,
    handleExportWithDuplicates,
    handleSaveToOriginal,
    extractTableData
  };
});