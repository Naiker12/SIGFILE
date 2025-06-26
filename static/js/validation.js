document.addEventListener("DOMContentLoaded", () => {
  const exportForm = document.querySelector('form[action="/export"]');
  const duplicateForm = document.getElementById("duplicateForm");
  const duplicateCountInput = document.getElementById("duplicateCount");
  const rowSelectInput = document.getElementById("rowId");

  function validateExportForm() {
    const selectedColumns = document.querySelectorAll('input[name="columns"]:checked');
    
    if (selectedColumns.length === 0) {
      showError("Error de Validación", "Debes seleccionar al menos una columna para exportar", {
        duration: 3000
      });
      return false;
    }

    const filename = document.querySelector('input[name="filename"]').value;
    if (!filename || filename.trim() === '') {
      showError("Error de Validación", "No se ha especificado un archivo válido", {
        duration: 3000
      });
      return false;
    }

    return true;
  }

  function validateDuplicateForm() {
    const selectedRowId = rowSelectInput.value;
    const count = parseInt(duplicateCountInput.value);

    if (!selectedRowId || selectedRowId.trim() === '') {
      showError("Error", "Selecciona una fila para duplicar", {
        duration: 2000
      });
      return false;
    }

    if (!count || isNaN(count) || count < 1) {
      showError("Error", "Ingresa un número válido de copias", {
        duration: 2000
      });
      duplicateCountInput.focus();
      return false;
    }
     

    if (count > 50) {
      showError("Error", "No puedes duplicar más de 50 filas a la vez", {
        duration: 2000
      });
      duplicateCountInput.focus();
      return false;
    }

    return true;
  }

  function validateRowExists(rowId) {
    if (!window.previewModule || !window.previewModule.allRows) {
      return false;
    }

    const targetRow = window.previewModule.allRows.find((row) => row.dataset.rowId == rowId);
    return targetRow !== undefined;
  }

  function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>]/g, '');
  }

  function validateNumericInput(value, min = 1, max = 50) {
    const num = parseInt(value);
    if (isNaN(num)) return { valid: false, message: "Debe ser un número válido" };
    if (num < min) return { valid: false, message: `El valor mínimo es ${min}` };
    if (num > max) return { valid: false, message: `El valor máximo es ${max}` };
    return { valid: true, value: num };
  }

  if (exportForm) {
    exportForm.addEventListener("submit", (e) => {
      if (!validateExportForm()) {
        e.preventDefault();
        return false;
      }
    });
  }

  if (duplicateCountInput) {
    duplicateCountInput.addEventListener("input", (e) => {
      const value = e.target.value;
      const validation = validateNumericInput(value);
      
      if (value && !validation.valid) {
        e.target.setCustomValidity(validation.message);
      } else {
        e.target.setCustomValidity('');
      }
    });

    duplicateCountInput.addEventListener("blur", (e) => {
      const value = e.target.value;
      if (value) {
        const validation = validateNumericInput(value);
        if (validation.valid) {
          e.target.value = validation.value;
        }
      }
    });
  }

  if (rowSelectInput) {
    rowSelectInput.addEventListener("change", (e) => {
      const selectedRowId = e.target.value;
      if (selectedRowId && !validateRowExists(selectedRowId)) {
        showError("Error", `La fila con ID ${selectedRowId} no existe`, {
          duration: 2000
        });
        e.target.value = '';
      }
    });
  }

  window.validationModule = {
    validateExportForm,
    validateDuplicateForm,
    validateRowExists,
    sanitizeInput,
    validateNumericInput
  };
});