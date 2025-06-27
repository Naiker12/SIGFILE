class SolidToast {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.defaultDuration = 2000;
    this.position = 'top-right';
    this.init();
  }

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = `toast-container toast-${this.position}`;
      this.container.style.cssText = `
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        top: 16px;
        right: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 420px;
      `;
      document.body.appendChild(this.container);
      this.addStyles();
    }
  }

  addStyles() {
    if (document.getElementById('solid-toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'solid-toast-styles';
    style.textContent = `
      .solid-toast {
        pointer-events: auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(0, 0, 0, 0.1);
        padding: 12px 16px;
        min-height: 48px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 100%;
        word-wrap: break-word;
      }
      
      .solid-toast.show {
        transform: translateX(0);
        opacity: 1;
      }
      
      .solid-toast.hide {
        transform: translateX(100%);
        opacity: 0;
      }
      
      .solid-toast:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }
      
      .solid-toast-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .solid-toast-icon {
        font-size: 18px;
        line-height: 1;
        flex-shrink: 0;
      }
      
      .solid-toast-content {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .solid-toast-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.6;
        padding: 4px;
        line-height: 1;
        flex-shrink: 0;
        color: inherit;
      }
      
      .solid-toast-close:hover {
        opacity: 1;
      }
      
      .toast-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 12px;
      }
      
      .toast-actions button {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s ease;
        min-width: 80px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .toast-actions .btn-success {
        background: #22c55e;
        color: white;
        box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
      }
      
      .toast-actions .btn-success:hover {
        background: #16a34a;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(34, 197, 94, 0.4);
      }
      
      .toast-actions .btn-danger {
        background: #ef4444;
        color: white;
        box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
      }
      
      .toast-actions .btn-danger:hover {
        background: #dc2626;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
      }
      
      .toast-actions .btn-primary {
        background: #3b82f6;
        color: white;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
      }
      
      .toast-actions .btn-primary:hover {
        background: #2563eb;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
      }
      
      .toast-actions .btn-outline-primary {
        background: transparent;
        color: #3b82f6;
        border: 2px solid #3b82f6;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
      }
      
      .toast-actions .btn-outline-primary:hover {
        background: #3b82f6;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
      }
      
      .solid-toast.success {
        background: #f0f9ff;
        border-color: #22c55e;
        color: #166534;
      }
      
      .solid-toast.error {
        background: #fef2f2;
        border-color: #ef4444;
        color: #991b1b;
      }
      
      .solid-toast.warning {
        background: #fffbeb;
        border-color: #f59e0b;
        color: #92400e;
      }
      
      .solid-toast.info {
        background: #f0f9ff;
        border-color: #3b82f6;
        color: #1e40af;
      }
      
      .solid-toast.loading {
        background: #f8fafc;
        border-color: #64748b;
        color: #475569;
      }
      
      .solid-toast.loading .solid-toast-icon {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  generateId() {
    return 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  create(message, options = {}) {
    const id = options.id || this.generateId();
    const type = options.type || 'info';
    const duration = options.duration !== undefined ? options.duration : this.defaultDuration;
    const dismissible = options.dismissible !== false;

    const toast = document.createElement('div');
    toast.className = `solid-toast ${type}`;
    toast.dataset.id = id;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      loading: '⟳'
    };

    toast.innerHTML = `
      <div class="solid-toast-header">
        <div class="solid-toast-icon">${icons[type] || icons.info}</div>
        <div class="solid-toast-content">${message}</div>
        ${dismissible ? '<button class="solid-toast-close" aria-label="Cerrar">×</button>' : ''}
      </div>
    `;

    if (dismissible) {
      const closeBtn = toast.querySelector('.solid-toast-close');
      closeBtn.onclick = () => this.dismiss(id);
    }

    let timeoutId;
    if (duration > 0) {
      const startTimer = () => {
        timeoutId = setTimeout(() => this.dismiss(id), duration);
      };
      
      const pauseTimer = () => {
        clearTimeout(timeoutId);
      };
      
      toast.addEventListener('mouseenter', pauseTimer);
      toast.addEventListener('mouseleave', startTimer);
      
      startTimer();
    }

    this.container.appendChild(toast);
    this.toasts.set(id, { element: toast, timeoutId });

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    return { id, element: toast };
  }

  dismiss(id) {
    const toastData = this.toasts.get(id);
    if (!toastData) return;

    const { element, timeoutId } = toastData;
    clearTimeout(timeoutId);

    element.classList.add('hide');
    
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.toasts.delete(id);
    }, 300);
  }

  success(message, options = {}) {
    return this.create(message, { ...options, type: 'success' });
  }

  error(message, options = {}) {
    return this.create(message, { ...options, type: 'error', duration: options.duration || 7000 });
  }

  warning(message, options = {}) {
    return this.create(message, { ...options, type: 'warning' });
  }

  info(message, options = {}) {
    return this.create(message, { ...options, type: 'info' });
  }

  loading(message, options = {}) {
    return this.create(message, { ...options, type: 'loading', duration: 0, dismissible: false });
  }

  promise(promise, messages) {
    const loadingToast = this.loading(messages.loading || 'Cargando...');
    const loadingId = loadingToast.id;
    
    return promise
      .then(result => {
        this.dismiss(loadingId);
        this.success(messages.success || 'Completado');
        return result;
      })
      .catch(error => {
        this.dismiss(loadingId);
        this.error(messages.error || 'Error');
        throw error;
      });
  }

  clear() {
    this.toasts.forEach((_, id) => this.dismiss(id));
  }
}

const toast = new SolidToast();

window.showSuccess = (title, message, duration) => {
  const fullMessage = title && message ? `<strong>${title}</strong><br>${message}` : title || message;
  return toast.success(fullMessage, { duration });
};

window.showError = (title, message, duration) => {
  const fullMessage = title && message ? `<strong>${title}</strong><br>${message}` : title || message;
  return toast.error(fullMessage, { duration });
};

window.showWarning = (title, message, duration) => {
  const fullMessage = title && message ? `<strong>${title}</strong><br>${message}` : title || message;
  return toast.warning(fullMessage, { duration });
};

window.showInfo = (title, message, duration) => {
  const fullMessage = title && message ? `<strong>${title}</strong><br>${message}` : title || message;
  return toast.info(fullMessage, { duration });
};

window.showLoading = (title, message) => {
  const fullMessage = title && message ? `<strong>${title}</strong><br>${message}` : title || message;
  return toast.loading(fullMessage);
};

window.hideToast = (toastData) => {
  if (typeof toastData === 'string') {
    toast.dismiss(toastData);
  } else if (toastData && toastData.id) {
    toast.dismiss(toastData.id);
  }
};

window.clearToasts = () => toast.clear();

window.toast = toast;