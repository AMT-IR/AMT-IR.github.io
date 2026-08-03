const loaderStyle = document.createElement('style');
loaderStyle.textContent = `
  #page-loader {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100vh;
    background-color: #0f172a;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    transition: opacity 0.4s ease, visibility 0.4s ease;
  }
  .page-spinner {
    width: 45px;
    height: 45px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: loader-spin 0.8s linear infinite;
  }
  @keyframes loader-spin {
    to { transform: rotate(360deg); }
  }
  #page-loader.hidden {
    opacity: 0;
    visibility: hidden;
  }
`;
document.head.appendChild(loaderStyle);

document.addEventListener('DOMContentLoaded', () => {
  const loaderEl = document.createElement('div');
  loaderEl.id = 'page-loader';
  loaderEl.innerHTML = '<div class="page-spinner"></div>';
  document.body.prepend(loaderEl);

  window.addEventListener('load', () => {
    loaderEl.classList.add('hidden');
  });
});
