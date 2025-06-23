class SimpleToast {
  constructor() {
    this.container = null;
    this.toasts = new Set();
    this.init();
  }

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(type, title, message, duration = 5000) {
    const toast = this.create(type, title, message);
    this.container.appendChild(toast);
    this.toasts.add(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    if (type !== 'loading' && duration > 0) {
      setTimeout(() => this.hide(toast), duration);
    }

    return toast;
  }

  create(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '✓',
      error: '✕', 
      warning: '⚠',
      info: 'i',
      loading: '⟳'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      ${type !== 'loading' ? '<button class="toast-close">×</button>' : ''}
    `;

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.hide(toast);
    }

    return toast;
  }

  hide(toast) {
    if (!toast || !this.toasts.has(toast)) return;
    
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(toast);
    }, 300);
  }

  update(toast, type, title, message) {
    if (!toast) return;
    
    const iconEl = toast.querySelector('.toast-icon');
    const titleEl = toast.querySelector('.toast-title');
    const messageEl = toast.querySelector('.toast-message');
    
    toast.className = `toast ${type} show`;
    
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'i', loading: '⟳' };
    if (iconEl) iconEl.textContent = icons[type] || icons.info;
    

    if (titleEl && title) titleEl.textContent = title;
    if (messageEl && message) messageEl.textContent = message;
  }

  clear() {
    this.toasts.forEach(toast => this.hide(toast));
  }

  success(title, message, duration) {
    return this.show('success', title, message, duration);
  }

  error(title, message, duration = 7000) {
    return this.show('error', title, message, duration);
  }

  warning(title, message, duration) {
    return this.show('warning', title, message, duration);
  }

  info(title, message, duration) {
    return this.show('info', title, message, duration);
  }

  loading(title, message) {
    return this.show('loading', title, message, 0);
  }
}

const toast = new SimpleToast();

window.showSuccess = (title, message, duration) => toast.success(title, message, duration);
window.showError = (title, message, duration) => toast.error(title, message, duration);
window.showWarning = (title, message, duration) => toast.warning(title, message, duration);
window.showInfo = (title, message, duration) => toast.info(title, message, duration);
window.showLoading = (title, message) => toast.loading(title, message);
window.hideToast = (toastElement) => toast.hide(toastElement);
window.updateToast = (toastElement, type, title, message) => toast.update(toastElement, type, title, message);
window.clearToasts = () => toast.clear();