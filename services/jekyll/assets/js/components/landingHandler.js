function handleLandingPage() {
    const landingImage = document.querySelector('.landing-image');
    if (!landingImage) return;

    // Set image based on screen size immediately before showing
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    landingImage.src = isSmallScreen ? '/assets/svg/landingS.png' : '/assets/svg/landing.png';

    // Create media query listener for dynamic updates
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateImageSource = (e) => {
        landingImage.src = e.matches ? '/assets/svg/landingS.png' : '/assets/svg/landing.png';
    };
    mediaQuery.addListener(updateImageSource);

    const referrer = document.referrer;
    const currentHost = window.location.host;
    const isInternalNavigation = referrer.includes(currentHost);

    if (isInternalNavigation) {
        landingImage.style.display = 'none';
        landingImage.remove();
        mediaQuery.removeListener(updateImageSource);
    } else {
        landingImage.style.display = 'block';
        landingImage.classList.add('slide-out');
        
        setTimeout(() => {
            landingImage.remove();
            mediaQuery.removeListener(updateImageSource);
        }, 1000);
    }
}

export { handleLandingPage }; 