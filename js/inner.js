var swiper = new Swiper(".vision-slider", {
    loop: true,
    speed: 800,
    spaceBetween: 20,
    freeMode: true,

    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },

    slidesPerView: 2.5, // default for large screens
    
    breakpoints: {
        0: {            // mobile
            slidesPerView: 1.2,
            spaceBetween: 12,
        },
        576: {          // small devices
            slidesPerView: 1.5,
            spaceBetween: 15,
        },
        768: {          // tablets
            slidesPerView: 2,
            spaceBetween: 18,
        },
        992: {          // medium desktops
            slidesPerView: 2.3,
            spaceBetween: 20,
        },
        1200: {         // large desktops
            slidesPerView: 2.5,
            spaceBetween: 20,
        }
    }
});


const textBox = document.getElementById('textBox');
const textBox2 = document.getElementById('textBox2');
const mediaImage = document.getElementById('mediaImage');
const playOverlay = document.getElementById('playOverlay');
const videoContainer = document.getElementById('videoContainer');
const videoFrame = document.getElementById('videoFrame');

const videoBaseSrc = 'https://www.youtube-nocookie.com/embed/m052DKJVnts';

function playVideo() {
    if (textBox) textBox.classList.add('hidden');
    if (textBox2) textBox2.classList.add('hidden');
    if (mediaImage) mediaImage.classList.add('hidden');
    if (playOverlay) playOverlay.classList.add('hidden');
    if (videoContainer) videoContainer.classList.remove('hidden');
   if (videoFrame) {
    videoFrame.src = `${videoBaseSrc}?autoplay=1&loop=1&playlist=m052DKJVnts&mute=1&controls=0&modestbranding=1`;
}
}

function closeVideo() {
    if (videoFrame) videoFrame.src = '';
    if (videoContainer) videoContainer.classList.add('hidden');
    if (mediaImage) mediaImage.classList.remove('hidden');
    if (playOverlay) playOverlay.classList.remove('hidden');
    if (textBox) textBox.classList.remove('hidden');
    if (textBox2) textBox2.classList.remove('hidden');
}

window.playVideo = playVideo;
window.closeVideo = closeVideo;





document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.content-section');

    // Function to check if an element is in the viewport
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        // Trigger the animation when the top of the element is 75% up the viewport
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75 && 
            rect.bottom >= 0
        );
    };

    const handleScroll = () => {
        sections.forEach(section => {
            if (isInViewport(section)) {
                // Check if the animation has already run for this section
                if (!section.classList.contains('is-visible')) {
                    // This class triggers the text-box CSS transition (opacity & transform)
                    section.classList.add('is-visible');
                    
                    // Note: The number will now just appear instantly with the text box
                }
            } 
        });
    };

    // Initial check on page load
    handleScroll(); 

    // Add scroll event listener with a small debounce for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 10);
    });
});

        var swiper = new Swiper(".dance-swiper", {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 20,
    speed: 800, 
    freeMode: true, 
  navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});


// init thumbnail swiper first


// main swiper
const mainSwiper = new Swiper('.main-swiper', {
  loop: true,
  centeredSlides: true,
  speed: 600,

  keyboard: { enabled: true },
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },

  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

});
