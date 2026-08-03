const loaderStyle = document.createElement('style');
loaderStyle.textContent = `
  #page-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #e2e8f0;
    z-index: 99999;
    overflow: hidden;
    transition: opacity 0.5s ease, visibility 0.5s ease;
  }

  #page-loader .progress-bar {
    position: absolute;
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #a855f7, #6366f1);
    background-size: 200% 100%;
    animation: progress-loading 1.5s infinite linear;
    width: 0;
  }

  @keyframes progress-loading {
    0% { width: 0; left: -5%; }
    50% { width: 30%; }
    100% { width: 100%; left: 100%; }
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
  const barEl = document.createElement('div');
  barEl.className = 'progress-bar';
  loaderEl.appendChild(barEl);
  document.body.prepend(loaderEl);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loaderEl.classList.add('hidden');
    }, 200); 
  });
});
