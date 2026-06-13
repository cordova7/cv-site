// Initialize startup effects
const initStartup = () => {
  const audio = document.querySelector("audio");
  const video = document.querySelector("#startup-video");

  if (audio) {
    audio.autoplay = true;
    audio.addEventListener("ended", () => {
      audio.remove();
    });
  }

  if (video) {
    video.autoplay = true;
    video.addEventListener("ended", () => {
      video.remove();
    });
  }
};

// Run startup initialization
document.addEventListener('DOMContentLoaded', initStartup);
