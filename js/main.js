(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }

  function createDots(container, count, onSelect) {
    container.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', '第' + (i + 1) + '张');
      dot.dataset.index = String(i);
      dot.addEventListener('click', function () {
        onSelect(Number(this.dataset.index));
      });
      container.appendChild(dot);
    }
  }

  function initHeroCarousel(root) {
    var slides = root.querySelectorAll('.carousel-slide');
    var dotsContainer = root.querySelector('.carousel-dots');
    var interval = Number(root.dataset.interval) || 5000;
    var current = 0;
    var timer = null;

    createDots(dotsContainer, slides.length, goTo);

    function goTo(index) {
      slides[current].classList.remove('is-active');
      if (dotsContainer.children[current]) {
        dotsContainer.children[current].classList.remove('is-active');
      }

      current = (index + slides.length) % slides.length;

      slides[current].classList.add('is-active');
      if (dotsContainer.children[current]) {
        dotsContainer.children[current].classList.add('is-active');
      }
    }

    function next() {
      goTo(current + 1);
    }

    function start() {
      stop();
      timer = setInterval(next, interval);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initShowcaseCarousel(root) {
    var slides = root.querySelectorAll('.showcase-slide');
    var thumbs = root.querySelectorAll('.showcase-thumbs .thumb');
    var prevBtn = root.querySelector('.carousel-prev');
    var nextBtn = root.querySelector('.carousel-next');
    var progressBar = root.querySelector('.showcase-progress-bar');
    var interval = Number(root.dataset.interval) || 4000;
    var current = 0;
    var timer = null;
    var progressTimer = null;

    function goTo(index) {
      slides[current].classList.remove('is-active');
      if (thumbs[current]) {
        thumbs[current].classList.remove('is-active');
      }

      current = (index + slides.length) % slides.length;

      slides[current].classList.add('is-active');
      if (thumbs[current]) {
        thumbs[current].classList.add('is-active');
        // Only scroll the thumb strip horizontally — never scroll the page
        var thumbsContainer = root.querySelector('.showcase-thumbs');
        if (thumbsContainer) {
          var thumb = thumbs[current];
          var left = thumb.offsetLeft - (thumbsContainer.clientWidth - thumb.offsetWidth) / 2;
          thumbsContainer.scrollTo({ left: left, behavior: 'smooth' });
        }
      }

      restartProgress();
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function restartProgress() {
      if (!progressBar) return;
      if (progressTimer) {
        clearTimeout(progressTimer);
      }
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      requestAnimationFrame(function () {
        progressBar.style.transition = 'width ' + interval + 'ms linear';
        progressBar.style.width = '100%';
      });
    }

    function start() {
      stop();
      restartProgress();
      timer = setInterval(next, interval);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (progressBar) {
        progressBar.style.transition = 'none';
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { stop(); prev(); start(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stop(); next(); start(); });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        stop();
        goTo(Number(this.dataset.index));
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  var heroCarousel = document.querySelector('[data-carousel="hero"]');
  if (heroCarousel) initHeroCarousel(heroCarousel);

  var showcaseCarousel = document.querySelector('[data-carousel="showcase"]');
  if (showcaseCarousel) initShowcaseCarousel(showcaseCarousel);
})();
