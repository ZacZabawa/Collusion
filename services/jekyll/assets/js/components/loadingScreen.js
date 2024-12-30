export function initLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    
    const video = document.createElement('video');
    video.id = 'loading-video';
    video.src = '/assets/videos/intro.mp4';
    video.autoplay = true;
    video.muted = true;
    
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (!hasVisited) {
        // First visit behavior
        const logo = document.createElement('img');
        logo.id = 'loading-logo';
        logo.src = '/assets/images/logo.svg';
        loadingScreen.appendChild(logo);
        
        // Set up click handler to dismiss
        loadingScreen.addEventListener('click', () => {
            hideLoadingScreen(loadingScreen, video);
        }, { once: true }); // Ensure click handler only fires once

        // Set up automatic dismissal after 10 seconds
        setTimeout(() => {
            hideLoadingScreen(loadingScreen, video);
        }, 10000);

        localStorage.setItem('hasVisited', 'true');
    } else {
        // Returning visitor behavior
        loadingScreen.classList.add('returning-visitor');
        
        // Add 1 second delay before checking if content is loaded
        setTimeout(() => {
            hideLoadingScreen(loadingScreen, video);
        }, 1000);
    }
    
    loadingScreen.appendChild(video);
    document.body.appendChild(loadingScreen);
}

function hideLoadingScreen(loadingScreen, video) {
    if (loadingScreen && !loadingScreen.classList.contains('slide-out')) {
        loadingScreen.classList.add('slide-out');
        
        // Stop and cleanup video
        video.pause();
        video.currentTime = 0;
        
        loadingScreen.addEventListener('animationend', () => {
            video.remove(); // Remove video element
            loadingScreen.remove(); // Remove loading screen
        }, { once: true });
    }
}