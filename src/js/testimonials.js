module.exports.load = () => {
  showSlides(slideIndex);

  const timer = setInterval(function() {
    showSlides(slideIndex += 1);
  }, 4000);

  $('.testimonials').hover(function() {
    clearTimeout(timer)
  });
}

let slideIndex = 1;

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("testimonial");
  if (n > slides.length) {
    slideIndex = 1
  }
  if (n < 1) {
    slideIndex = slides.length
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "block";
}

global.plusSlides = function(n) {
  showSlides(slideIndex += n);
}
