(function() {
    const style = document.createElement('style');
    style.textContent = `
        #hfs-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #484e55;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        }
        
        .hfs-loader-spinner {
            border: 64px solid;
            border-color: rgba(255,255,255,0.15) rgba(255,255,255,0.25) rgba(255,255,255,0.35) rgba(255,255,255,0.5);
            border-radius: 50%;
            animation: hfsSpin 1s linear infinite;
        }
        
        @keyframes hfsSpin {
            0% { 
                border-color: rgba(255,255,255,0.15) rgba(255,255,255,0.25) rgba(255,255,255,0.35) rgba(255,255,255,0.75); 
                transform: rotate(0deg); 
            }
            100% { 
                border-color: rgba(255,255,255,0.25) rgba(255,255,255,0.35) rgba(255,255,255,0.75) rgba(255,255,255,0.15); 
                transform: rotate(360deg); 
            }
        }
        
        #root {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
        #root.hfs-allowed {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: all !important;
        }
    `;
    document.head.appendChild(style);

    const loader = document.createElement('div');
    loader.id = 'hfs-loader';
    loader.innerHTML = '<div class="hfs-loader-spinner"></div>';
    document.body.appendChild(loader);
    
    localStorage.setItem('hfs_hide_root_loading', 'true');
})();

function showContent() {
    const loader = document.getElementById('hfs-loader');
    if (loader) {
        loader.style.display = 'none';
    }
    
    const root = document.getElementById('root');
    if (root) {
        root.classList.add('hfs-allowed');
    }
}

function reloadLikeHFS() {
    console.log('Recarregando usando técnica HFS (/#)');
    
    window.location.hash = '';
    window.location.reload();
}

function waitForCompleteLoad() {
    function cleanRootElement() {
        const root = document.getElementById('root');
        if (root) {
            if (root.innerHTML.includes('Loading') || root.innerHTML.includes('Wait for loading')) {
                root.innerHTML = '';
                root.style.display = 'none';
            }
        }
    }
    
    function checkHFSLoaded() {
        if (typeof HFS !== 'undefined') {
            const root = document.getElementById('root');
            if (root && !root.innerHTML.includes('Loading') && !root.innerHTML.includes('Wait for loading')) {
                return true;
            }
        }
        return false;
    }

    cleanRootElement();
    
    if (checkHFSLoaded()) {
        setTimeout(showContent, 300);
        return;
    }

    window.addEventListener('load', function() {
        cleanRootElement();
        
        const checkInterval = setInterval(function() {
            cleanRootElement();
            
            if (checkHFSLoaded()) {
                clearInterval(checkInterval);
                setTimeout(showContent, 300);
            }
        }, 100);
        
        setTimeout(function() {
            clearInterval(checkInterval);
            showContent();
        }, 3000);
    });
    
    setTimeout(function() {
        cleanRootElement();
        showContent();
    }, 5000);
}

function setupPullToRefresh() {
    let startY = 0;
    let isPullDown = false;
    
    document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
        isPullDown = (window.scrollY <= 10);
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!isPullDown) return;
        
        const currentY = e.touches[0].pageY;
        const diff = currentY - startY;
        
        if (diff > 0 && window.scrollY <= 10) {
            e.preventDefault();
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (!isPullDown) return;
        
        const currentY = e.changedTouches[0].pageY;
        const diff = currentY - startY;
        
        if (diff > 300 && window.scrollY <= 10) {
            console.log('Pull-to-refresh acionado - puxou', diff, 'pixels');
            
            const loader = document.getElementById('hfs-loader');
            if (loader) {
                loader.style.display = 'flex';
            }
            
            const root = document.getElementById('root');
            if (root) {
                root.classList.remove('hfs-allowed');
            }
            
            setTimeout(() => {
                reloadLikeHFS();
            }, 300);
        }
        
        isPullDown = false;
        startY = 0;
    });
}

(function initialize() {
    if (localStorage.getItem('hfs_hide_root_loading') === 'true') {
        const root = document.getElementById('root');
        if (root) {
            root.style.display = 'none';
            root.classList.remove('hfs-allowed');
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            waitForCompleteLoad();
            setupPullToRefresh();
        });
    } else {
        waitForCompleteLoad();
        setupPullToRefresh();
    }
})();

window.addEventListener("orientationchange", () => {
  const isLandscape = screen.orientation?.angle === 90 || screen.orientation?.angle === -90;

  if (isLandscape) {
    const video = document.querySelector("video");
    if (video && video.requestFullscreen) {
      video.requestFullscreen().catch((e) => console.warn("Error when trying to full screen:", e));
    }
  }
});
