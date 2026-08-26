(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  var header = document.querySelector('.header');

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

  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  // Active nav highlight
  var sections = document.querySelectorAll('main section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveNav() {
    var current = '';
    sections.forEach(function (section) {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.id;
      }
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      revealObs.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  function createDots(container, count, onSelect) {
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', '第' + (i + 1) + '张');
      dot.dataset.index = String(i);
      dot.addEventListener('click', function () {
        onSelect(Number(this.dataset.index));
      });
      container.appendChild(dot);
    }
  }

  function initSlider(root) {
    var track = root.querySelector('.slider-track');
    var slides = root.querySelectorAll('.slider-slide');
    var prevBtn = root.querySelector('.slider-prev');
    var nextBtn = root.querySelector('.slider-next');
    var dotsContainer = root.querySelector('.slider-dots');
    var progressBar = root.querySelector('.slider-progress-bar');
    var viewport = root.querySelector('.slider-viewport');
    var interval = Number(root.dataset.interval) || 4500;
    var current = 0;
    var timer = null;
    var startX = 0;
    var deltaX = 0;
    var dragging = false;

    if (!track || slides.length === 0) return;

    createDots(dotsContainer, slides.length, function (index) {
      stop();
      goTo(index);
      start();
    });

    function update() {
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      if (dotsContainer) {
        Array.prototype.forEach.call(dotsContainer.children, function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      }
      restartProgress();
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      update();
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function restartProgress() {
      if (!progressBar) return;
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          progressBar.style.transition = 'width ' + interval + 'ms linear';
          progressBar.style.width = '100%';
        });
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

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        stop();
        prev();
        start();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        stop();
        next();
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    // Touch / drag swipe (horizontal only, never scroll the page)
    var startY = 0;
    var lockHorizontal = false;

    function getPoint(e) {
      if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    function onPointerDown(e) {
      var point = getPoint(e);
      dragging = true;
      lockHorizontal = false;
      startX = point.x;
      startY = point.y;
      deltaX = 0;
      stop();
      track.style.transition = 'none';
    }

    function onPointerMove(e) {
      if (!dragging) return;
      var point = getPoint(e);
      deltaX = point.x - startX;
      var deltaY = point.y - startY;

      if (!lockHorizontal && Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        lockHorizontal = true;
      }

      // Only move the track sideways; never trigger page scroll
      if (lockHorizontal) {
        if (e.cancelable) e.preventDefault();
        var percent = (deltaX / root.offsetWidth) * 100;
        track.style.transform = 'translateX(calc(-' + current * 100 + '% + ' + percent + '%))';
      }
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      if (lockHorizontal && Math.abs(deltaX) > root.offsetWidth * 0.18) {
        if (deltaX < 0) next();
        else prev();
      } else {
        update();
      }
      lockHorizontal = false;
      start();
    }

    var dragTarget = viewport || root;
    dragTarget.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dragTarget.addEventListener('touchstart', onPointerDown, { passive: true });
    dragTarget.addEventListener('touchmove', onPointerMove, { passive: false });
    dragTarget.addEventListener('touchend', onPointerUp);

    update();
    start();
  }

  document.querySelectorAll('[data-slider]').forEach(initSlider);
})();
