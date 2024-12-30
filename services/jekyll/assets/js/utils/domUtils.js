function hideLoadingScreen() {
    var loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen.classList.contains('slide-up')) {
        loadingScreen.classList.add('slide-up');
    }
}

function addLoadingScreenListeners() {
    document.getElementById('loading-screen').addEventListener('animationend', function() {
        this.style.display = 'none';
    });

    // Hide loading screen on click
    document.getElementById('loading-screen').addEventListener('click', hideLoadingScreen);

    // Hide loading screen on scroll
    window.addEventListener('scroll', hideLoadingScreen, { once: true });
}

export { hideLoadingScreen, addLoadingScreenListeners };