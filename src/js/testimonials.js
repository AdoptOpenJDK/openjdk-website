module.exports.load = () => {
  showSlides(slideIndex);

  function myTimer() {
    plusSlides(1)
  }

  let timer = setInterval(myTimer, 4000);

  $(".quote").mouseenter(function() {
    clearTimeout(timer);
  })

  $(".quote").mouseout(function() {
    timer = setInterval(myTimer, 4000);
  })
}

let slideIndex = 1;

function showSlides(n) {
  let i;
  const slides = document.getElementsByClassName("testimonial");
  const dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1
  }
  if (n < 1) {
    slideIndex = slides.length
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}

global.plusSlides = function(n) {
  showSlides(slideIndex += n);
}

global.currentSlide = function(n) {
  showSlides(slideIndex = n);
}
