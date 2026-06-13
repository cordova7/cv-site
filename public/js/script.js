document.addEventListener('DOMContentLoaded', () => {
  const outputTime = () => {
    const options = { weekday: "short", hour: "numeric", minute: "numeric" };
    let dateTime = new Date();

    const timeElement = document.getElementById("time");
    if (timeElement) {
      timeElement.innerHTML = dateTime.toLocaleDateString(
        "en-US",
        options
      );
    }
    setTimeout(outputTime, 1000); // Update every second instead of every millisecond
  };

  outputTime();
  
  // Initialize debug tools if available
  if (typeof PeppleDebug !== 'undefined') {
    PeppleDebug.init();
    console.log("Debug tools available - press Ctrl+Shift+D to open debug panel");
  }
});
