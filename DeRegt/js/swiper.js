const swiper = new Swiper(".slider-testimonials .swiper-container", {
    slidesPerView: 1.25,
    spaceBetween: 10,
    slidesPerGroup: 1,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    breakpoints: {

        768: {
            slidesPerView: 2.25,
            spaceBetween: 10,
            loop: true,
            centeredSlides: false
        },
        992: {
            slidesPerView: 2.75,
            spaceBetween: 10,
            loop: true,
            centeredSlides: false
        },
        1100: {
            slidesPerView: 3,
            spaceBetween: 10,
            loop: true,
            centeredSlides: false
        },
           1200: {
            slidesPerView: 3,
            spaceBetween: 30,
            loop: true,
            centeredSlides: false
        }
    }
});