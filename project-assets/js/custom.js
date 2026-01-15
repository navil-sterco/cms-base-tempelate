


// UIAM - 02031998

(function ($) {
  "use strict";
    adjustMaxContent();
  AOS.init();



//  header

    $(window).scroll(function () {
      var scroll = $(window).scrollTop();
      if (scroll >= 100) {
        $(".main_header").addClass("fixed-header");
      } else {
        $(".main_header").removeClass("fixed-header");
      }
    });

   
//  Dropdown

$('.select-dropdown__button').on('click', function(){
	$('.select-dropdown__list').toggleClass('active');
});
$('.select-dropdown__list-item').on('click', function(){
	var itemValue = $(this).data('value');
	console.log(itemValue);
	$('.select-dropdown__button span').text($(this).text()).parent().attr('data-value', itemValue);
	$('.select-dropdown__list').toggleClass('active');
});





  
  // Hamburger Menu Js

  $(".hamb_open").click(function () {
    $(".hamburger_menu").addClass("active");
  });

  $(".ham_close").click(function () {
    $(".hamburger_menu").removeClass("active");
  });
  $(".hambmenu li a").click(function (e) {
    var same = $(this).hasClass("active");
    var siblings = $(this).parent(".hamb_drop").parent().children();
    siblings.find("a.active + .hamb_sub").slideUp();
    siblings.find("a").removeClass("active");
    if ($(this).next().hasClass("hamb_sub") && !same) {
      e.preventDefault();
      $(this).addClass("active");
      $(this).next(".hamb_sub").slideDown();
    }
  });
 
    // Hamburger Menu Js

const hamberger = document.querySelector('.hamberger a');
const sideMenu = document.querySelector('.side-menu');
const closeBtn = document.querySelector('.close-btn');

hamberger.addEventListener('click', (e) => {
  e.preventDefault();
  sideMenu.classList.add('open');
  document.body.classList.add('menu-open');
});

closeBtn.addEventListener('click', () => {
  sideMenu.classList.remove('open');
  document.body.classList.remove('menu-open');
});


function counterUp(el, target, duration = 2000) {
    let start = 0;
    let startTime = null;

    function animateCounter(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = timestamp - startTime;
        let progressRatio = Math.min(progress / duration, 1);
        let current = Math.floor(progressRatio * target);
        el.textContent = current.toLocaleString();

        if (progress < duration) {
            requestAnimationFrame(animateCounter);
        }
    }

    requestAnimationFrame(animateCounter);
}




 // Mobile Bottom Sticky
        $('.togglee').on('click', function () {
            let target = $(this).data('target');
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(target).removeClass('show')
            } else {
                $('.m-pop').removeClass('show');
                $('.togglee.active').removeClass('active')
                $(target).addClass('show');
                $(this).addClass('active')
            }
        });

        $('.drop-menu1>a').click(function (e) {
            setMPopHeight();
            if ($(this).closest('.drop-menu1').hasClass('active')) {
                $(this).closest('.drop-menu1').removeClass('active')
                $(this).siblings('.sub-menu1').slideUp(300)
            } else {

                $('.drop-menu1.active').removeClass('active');
                $('.sub-menu1').slideUp('300');
                $(this).closest('.drop-menu1').addClass('active')
                $(this).siblings('.sub-menu1').slideDown(300)
            }
        });
        // Mobile Bottom Sticky

  

function wipeOn() {
  let width = window.innerWidth;
  if (width < 992) return; // Skip animation on small screens

  var wipers = document.querySelectorAll('.image');
  wipers.forEach(function (wipers) {
    var rect = wipers.getBoundingClientRect();
    if (rect.top < (window.innerHeight - 200)) {
      wipers.classList.add('reveal-image');
    }
  });

  var wipers1 = document.querySelectorAll('.image2');
  wipers1.forEach(function (wipers1) {
    var rect1 = wipers1.getBoundingClientRect();
    if (rect1.top < (window.innerHeight - 200)) {
      wipers1.classList.add('reveal-image2');
    }
  });

  var wipers2 = document.querySelectorAll('.image3');
  wipers2.forEach(function (wipers2) {
    var rect2 = wipers2.getBoundingClientRect();
    if (rect2.top < (window.innerHeight - 200)) {
      wipers2.classList.add('reveal-image3');
    }
  });
}

window.addEventListener('load', wipeOn);
window.addEventListener('scroll', wipeOn);
window.addEventListener('resize', wipeOn);

// AOS init (already handles mobile disabling via 'disable: "mobile"')
if ($('[data-aos]').length > 0) {
  AOS.init({
    easing: 'linear',
    disable: 'mobile',
    duration: 2000,
    once: true
  });
}

  $(window).resize(function () {
        adjustMaxContent();
    });
    function adjustMaxContent() {
        let containerWidth = $(".container").width()
        //console.log([...containerWidth]);
        // containerWidth = $([...containerWidth][2]).width();
        let windowWidth = $("body").width();
        windowWidth = windowWidth > 2700 ? 2700 : windowWidth;
        let maxContentWidth = (windowWidth - (windowWidth - containerWidth) / 2) + 13;
    if (windowWidth >= 2700) {
            $(".max-content-xxl").css("max-width", `${maxContentWidth}px`);
            $(".max-content-xl").css("max-width", `${maxContentWidth}px`);
            $(".max-content-lg").css("max-width", `${maxContentWidth}px`);
            $(".max-content-md").css("max-width", `${maxContentWidth}px`);
            $(".max-content-sm").css("max-width", `${maxContentWidth}px`);
            $(".max-content").css("max-width", `${maxContentWidth}px`);
        }
        else if (windowWidth >= 1400) {
            $(".max-content-xxl").css("max-width", `${maxContentWidth}px`);
            $(".max-content-xl").css("max-width", `${maxContentWidth}px`);
            $(".max-content-lg").css("max-width", `${maxContentWidth}px`);
            $(".max-content-md").css("max-width", `${maxContentWidth}px`);
            $(".max-content-sm").css("max-width", `${maxContentWidth}px`);
            $(".max-content").css("max-width", `${maxContentWidth}px`);
        } else if (windowWidth >= 1200) {
            $(".max-content-xxl").css("max-width", "");
            $(".max-content-xl").css("max-width", `${maxContentWidth}px`);
            $(".max-content-lg").css("max-width", `${maxContentWidth}px`);
            $(".max-content-md").css("max-width", `${maxContentWidth}px`);
            $(".max-content-sm").css("max-width", `${maxContentWidth}px`);
            $(".max-content").css("max-width", `${maxContentWidth}px`);
        } else if (windowWidth >= 992) {
            $(".max-content-xxl").css("max-width", "");
            $(".max-content-xl").css("max-width", "");
            $(".max-content-lg").css("max-width", `${maxContentWidth}px`);
            $(".max-content-md").css("max-width", `${maxContentWidth}px`);
            $(".max-content-sm").css("max-width", `${maxContentWidth}px`);
            $(".max-content").css("max-width", `${maxContentWidth}px`);
        } else if (windowWidth >= 768) {
            $(".max-content-xxl").css("max-width", "");
            $(".max-content-xl").css("max-width", "");
            $(".max-content-lg").css("max-width", "");
            $(".max-content-md").css("max-width", `${maxContentWidth}px`);
            $(".max-content-sm").css("max-width", `${maxContentWidth}px`);
            $(".max-content").css("max-width", `${maxContentWidth}px`);
        } else if (windowWidth >= 575) {
            $(".max-content-xxl").css("max-width", "");
            $(".max-content-xl").css("max-width", "");
            $(".max-content-lg").css("max-width", "");
            $(".max-content-md").css("max-width", "");
            $(".max-content-sm").css("max-width", `${maxContentWidth}px`);
            $(".max-content").css("max-width", `${maxContentWidth}px`);
        } else {
            $(".max-content-xxl").css("width", "");
            $(".max-content-xl").css("width", "");
            $(".max-content-lg").css("width", "");
            $(".max-content-md").css("width", "");
            $(".max-content-sm").css("width", "");
            $(".max-content").css("width", `${maxContentWidth}px`);
        }
    }


function positionSwiperNav() {
  const nav = document.querySelector('.swiper_nav');
  const firstFigure = document.querySelector('.swiper .swiper-slide figure');

  if (nav && firstFigure) {
    const figureHeight = firstFigure.offsetHeight;
    const bottomOffset = 6 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    nav.style.top = (firstFigure.offsetTop + figureHeight - bottomOffset) + 'px';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  positionSwiperNav();
});

window.addEventListener("resize", () => {
  positionSwiperNav();
});



})(jQuery);




