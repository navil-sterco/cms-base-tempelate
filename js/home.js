document.addEventListener('DOMContentLoaded', () => {
    const mainImage = document.getElementById('main-school-image');
    const schoolThumbs = document.querySelectorAll('.school-thumb');

    // ⭐ NEW: Flag to prevent multiple clicks during the animation
    let isAnimating = false;
    const ANIMATION_DURATION = 300; // Must match your CSS transition time (0.3s)

    // Function to find the content block based on the school name
    const findContentBlock = (schoolName) => {
        return document.querySelector(`.school-content[data-school="${schoolName}"]`);
    };

    schoolThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {

            // Check if animation is running or if the thumbnail is already active
            if (thumb.classList.contains('active') || isAnimating) {
                return;
            }

            // ⭐ START ANIMATION: Set flag to true
            isAnimating = true;

            const newSchoolName = thumb.dataset.schoolName;
            const newImageSrc = thumb.dataset.imageSrc;

            const currentActiveThumb = document.querySelector('.school-thumb.active');

            // 1. CONTENT SWAP LOGIC (Handles fade out/in via CSS transition)

            // a. Find the currently visible content block and hide it
            const currentVisibleContent = document.querySelector('.school-content:not(.hidden-content)');
            if (currentVisibleContent) {
                currentVisibleContent.classList.add('hidden-content');
            }

            // b. Find the new content block and show it
            const nextContent = findContentBlock(newSchoolName);
            if (nextContent) {
                nextContent.classList.remove('hidden-content');
            }

            // 2. IMAGE SWAP LOGIC (Animated Fade)

            // a. Start the Fade-Out Animation (mainImage opacity -> 0)
            mainImage.classList.add('fading-out');

            // b. Wait for the fade-out duration before swapping the source
            setTimeout(() => {

                // --- Perform the Instant Swap while opacity is 0 ---
                mainImage.src = newImageSrc;

                // --- Fade In the new image ---
                mainImage.classList.remove('fading-out');

                // ⭐ END ANIMATION: Reset flag to false after the fade-in completes
                // We add another small delay (e.g., 50ms) to ensure the full transition is over
                setTimeout(() => {
                    isAnimating = false;
                }, ANIMATION_DURATION + 50);

            }, ANIMATION_DURATION);


            // 3. THUMBNAIL SWAP LOGIC (Instant Swap for visibility)

            // Make the previously hidden thumb VISIBLE
            if (currentActiveThumb) {
                currentActiveThumb.classList.remove('active');
            }

            // Make the clicked thumb HIDDEN
            thumb.classList.add('active');
        });
    });
});


gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", function () {
    const section = document.querySelector(".home-experience-harrow");
    const steps = gsap.utils.toArray(".exp_link_name");
    const images = gsap.utils.toArray(".home-experience-right > div");

    // 1. Initial State Setup
    gsap.set(images, { opacity: 0, visibility: "hidden" });
    steps[0].classList.add("active");
    images[0].classList.add("active");
    gsap.set(images[0], { opacity: 1, visibility: "visible" });

    // Function to update the UI (classes and image visibility)
    function setActiveState(index) {
        steps.forEach(s => s.classList.remove("active"));
        images.forEach(img => img.classList.remove("active"));
        gsap.set(images, { opacity: 0, visibility: "hidden" });

        if (steps[index]) steps[index].classList.add("active");
        if (images[index]) images[index].classList.add("active");
        if (images[index]) gsap.set(images[index], { opacity: 1, visibility: "visible" });
    }

    // 2. Scroll Animation Timeline
    let tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            // 💡 BEST PRACTICE: Use "top top" when pinning content for sequential steps
            start: "top 10%",

            // 🎯 CORRECTED END VALUE: Use a dynamic calculation based on viewport height (vh)
            // 300vh means the user must scroll 3 times the viewport height per step (duration: 3).
            end: "+=" + steps.length * 180 + "vh",

            scrub: true,
            pin: true,
            ease: "none"
        }
    });

    // Initial call to set the state for the first item at the start of the timeline
    tl.call(setActiveState, [0], 0);

    // Add steps to the timeline
    steps.forEach((step, index) => {
        if (index > 0) {
            // The duration (3) dictates how long the timeline section is. 
            // Paired with 'end: steps.length * 100 + "vh"', this means the user must scroll
            // 300vh (3 * 100vh) to complete the transition for this step.
            tl.to({}, { duration: 3 });

            // Call the function to set the state when the timeline reaches this point
            tl.call(setActiveState, [index]);
        }
    });
});

/*home slider js*/

const swiper = new Swiper(".mySwiper", {
    effect: "fade",
    fadeEffect: { crossFade: true },
    loop: true,
    speed: 1500,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
     navigation: {
        nextEl: '.hero-prv-btn',
        prevEl: '.hero-next-btn',
    },
});


const intswiper = new Swiper('.internationalSwiper', {
     
    effect: "fade",
    direction: 'horizontal',
    loop: true,
    slidesPerView: 1,
       spaceBetween: 30,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
    },

     
    navigation: {
        nextEl: '.int-prv-btn',
        prevEl: '.int-next-btn',
    },
});


// ================= Latest At Harrow Bengaluru slider js 
 
    const lifeswiper = new Swiper('.latest-at-harrow', {
        slidesPerView: 1, // Show one slide at a time
        spaceBetween: 10, // Space between slides
         loop: true, // Loop the slides
        autoplay: {
            delay: 3000, // 3 seconds per slide
        },
        navigation: {
            nextEl: '.latest-prv-btn',
            prevEl: '.latest-next-btn',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
       
    });
 
