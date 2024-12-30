import $ from 'jquery';
import 'nanogallery2';

function initNanoGallery() {
    // Initialization from post.html
    try {
        $("#my_nanogallery2").nanogallery2();
    } catch (error) {
        console.error("Error initializing nanogallery2:", error);
    }
}

export { initNanoGallery };