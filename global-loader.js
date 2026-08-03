const loaderStyle = document.createElement('style');
loaderStyle.textContent = `
  #page-loader {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100vh;
    background-color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s;
  }

  .pulse-loader {
    display: flex;
    gap: 8px;
  }

  .pulse-loader div {
    width: 14px;
    height: 14px;
    background-color: #1e293b;
    border-radius: 50%;
    opacity: 0.3;
    animation: pulse-dot 1.4s infinite cubic-bezier(0.4, 0, 0.6, 1);
  }

  .pulse-loader div:nth-child(1) { animation-delay: -0.32s; }
  .pulse-loader div:nth-child(2) { animation-delay: -0.16s; }

  @keyframes pulse-dot {
    0%, 80%, 100% { 
      transform: scale(0.8);
      opacity: 0.3;
    } 
    40% { 
      transform: scale(1.2);
      opacity: 1;
    }
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
  
  const pulseContainer = document.createElement('div');
  pulseContainer.className = 'pulse-loader';
  pulseContainer.innerHTML = '<div></div><div></div><div></div>';
  
  loaderEl.appendChild(pulseContainer);
  document.body.prepend(loaderEl);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loaderEl.classList.add('hidden');
    }, 500); 
  });
});
