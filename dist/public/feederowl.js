document.addEventListener('keydown', function(event) {
    if (event.key === 'Backspace' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        event.preventDefault();
        history.back();
    }
});

window.addEventListener("orientationchange", () => {
  const isLandscape = screen.orientation?.angle === 90 || screen.orientation?.angle === -90;

  if (isLandscape) {
    const video = document.querySelector("video");
    if (video && video.requestFullscreen) {
      video.requestFullscreen().catch((e) => console.warn("Error when trying to full screen:", e));
    }
  }
});
