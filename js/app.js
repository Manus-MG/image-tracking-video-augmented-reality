/**
 * AR Experience - Target Handler Component
 * 
 * Custom A-Frame component for MindAR image target events.
 * Plays video when target is found, pauses when lost.
 * Includes iOS autoplay workaround.
 */

AFRAME.registerComponent('targethandler', {
  init: function () {
    const el = this.el;
    const video = document.getElementById('ar-video');
    const hint = document.getElementById('scanning-hint');
    const indicator = document.getElementById('target-found-indicator');
    let videoStarted = false;

    // Target found → play video
    el.addEventListener('targetFound', () => {
      console.log('[AR] Target found!');
      
      // Hide scanning hint
      if (hint) hint.classList.add('hidden');
      
      // Show target found indicator
      if (indicator) indicator.classList.add('visible');

      if (video) {
        video.muted = false;
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            videoStarted = true;
            console.log('[AR] Video playing');
          }).catch((err) => {
            console.warn('[AR] Autoplay blocked, showing tap-to-play:', err);
            showTapToPlay(video);
          });
        }
      }
    });

    // Target lost → pause video  
    el.addEventListener('targetLost', () => {
      console.log('[AR] Target lost');
      
      // Show scanning hint again
      if (hint) hint.classList.remove('hidden');
      
      // Hide target found indicator
      if (indicator) indicator.classList.remove('visible');

      if (video && videoStarted) {
        video.pause();
      }
    });
  }
});

/**
 * iOS tap-to-play workaround.
 * On iOS, video autoplay is blocked unless user interacts.
 */
function showTapToPlay(video) {
  const overlay = document.getElementById('tap-to-play');
  if (!overlay) return;
  
  overlay.style.display = 'flex';
  
  overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    video.muted = false;
    video.play().then(() => {
      console.log('[AR] Video started after tap');
    }).catch(err => {
      console.error('[AR] Still cannot play:', err);
    });
  }, { once: true });
}

/**
 * Scene ready handler.
 * Dismisses loading screen when AR is initialized.
 */
document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  const loadingOverlay = document.getElementById('loading-overlay');
  
  if (scene) {
    scene.addEventListener('arReady', () => {
      console.log('[AR] Scene ready');
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    });

    // Fallback: hide loading after 8 seconds in case arReady doesn't fire
    setTimeout(() => {
      if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
        console.log('[AR] Fallback: hiding loading screen');
        loadingOverlay.classList.add('hidden');
      }
    }, 8000);
  }
});
