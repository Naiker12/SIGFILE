document.addEventListener("DOMContentLoaded", () => {
  const exportForm = document.querySelector('form[action="/export"]');
  const duplicateForm = document.getElementById("duplicateForm");
  const duplicateCountInput = document.getElementById("duplicateCount");
  const rowSelectInput = document.getElementById("rowId");

  function validateExportForm() {
    const selectedColumns = document.querySelectorAll('input[name="columns"]:checked');
    
    if (selectedColumns.length === 0) {
      toast.error("Debes seleccionar al menos una columna para exportar", {
        duration: 3000
      });
      return false;
    }

    const filename = document.querySelector('input[name="filename"]').value;
    if (!filename || filename.trim() === '') {
      toast.error("No se ha especificado un archivo válido", {
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
      toast.error("Selecciona una fila para duplicar", {
        duration: 2000
      });
      return false;
    }

    if (!count || isNaN(count) || count < 1) {
      toast.error("Ingresa un número válido de copias", {
        duration: 2000
      });
      duplicateCountInput.focus();
      return false;
    }

    if (count > 50) {
      toast.error("No puedes duplicar más de 50 filas a la vez", {
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

  function showValidationError(message, focusElement = null) {
    toast.error(message, { duration: 3000 });
    if (focusElement) {
      setTimeout(() => focusElement.focus(), 100);
    }
  }

  function showValidationSuccess(message) {
    toast.success(message, { duration: 2000 });
  }

  if (exportForm) {
    exportForm.addEventListener("submit", (e) => {
      if (!validateExportForm()) {
        e.preventDefault();
        return false;
      }
      
      toast.loading("Preparando exportación...", { duration: 1000 });
    });
  }

  if (duplicateCountInput) {
    duplicateCountInput.addEventListener("input", (e) => {
      const value = e.target.value;
      const validation = validateNumericInput(value);
      
      if (value && !validation.valid) {
        e.target.setCustomValidity(validation.message);
        e.target.classList.add('is-invalid');
      } else {
        e.target.setCustomValidity('');
        e.target.classList.remove('is-invalid');
      }
    });

    duplicateCountInput.addEventListener("blur", (e) => {
      const value = e.target.value;
      if (value) {
        const validation = validateNumericInput(value);
        if (validation.valid) {
          e.target.value = validation.value;
          e.target.classList.add('is-valid');
          setTimeout(() => e.target.classList.remove('is-valid'), 2000);
        } else {
          e.target.classList.add('is-invalid');
        }
      }
    });
  }

  if (rowSelectInput) {
    rowSelectInput.addEventListener("change", (e) => {
      const selectedRowId = e.target.value;
      if (selectedRowId && !validateRowExists(selectedRowId)) {
        toast.error(`La fila con ID ${selectedRowId} no existe`, {
          duration: 2000
        });
        e.target.value = '';
        e.target.classList.add('is-invalid');
      } else if (selectedRowId) {
        e.target.classList.remove('is-invalid');
        e.target.classList.add('is-valid');
        setTimeout(() => e.target.classList.remove('is-valid'), 2000);
      }
    });
  }

  function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
      input.addEventListener('blur', (e) => {
        if (!e.target.value.trim() && e.target.hasAttribute('required')) {
          e.target.classList.add('is-invalid');
        } else {
          e.target.classList.remove('is-invalid');
        }
      });

      input.addEventListener('input', (e) => {
        if (e.target.classList.contains('is-invalid') && e.target.value.trim()) {
          e.target.classList.remove('is-invalid');
        }
      });
    });
  }

  function validateFileInput(input) {
    if (!input.value.trim()) {
      return { valid: false, message: "Selecciona un archivo" };
    }
    
    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    const extension = input.value.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      return { 
        valid: false, 
        message: `Formato no válido. Usa: ${allowedExtensions.join(', ')}` 
      };
    }
    
    return { valid: true };
  }

  function validateEmailInput(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value)) {
      return { valid: false, message: "Email no válido" };
    }
    return { valid: true };
  }

  setupRealTimeValidation();

  window.validationModule = {
    validateExportForm,
    validateDuplicateForm,
    validateRowExists,
    sanitizeInput,
    validateNumericInput,
    showValidationError,
    showValidationSuccess,
    validateFileInput,
    validateEmailInput
  };
});