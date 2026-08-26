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
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  // Active nav highlight
  var sections = document.querySelectorAll('main section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveNav() {
    var current = '';
    sections.forEach(function (section) {
      if (window.scrollY >= section.offsetTop - 140) {
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
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Back to top
  var backTop = document.getElementById('back-top');
  function updateBackTop() {
    if (!backTop) return;
    backTop.classList.toggle('is-visible', window.scrollY > 500);
  }
  window.addEventListener('scroll', updateBackTop, { passive: true });
  updateBackTop();
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Toast
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.hidden = true;
    }, 2200);
  }

  // Copy address
  var copyBtn = document.getElementById('copy-address');
  var addressEl = document.getElementById('company-address');
  if (copyBtn && addressEl) {
    copyBtn.addEventListener('click', function () {
      var text = addressEl.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast('地址已复制');
        }).catch(function () {
          showToast('请手动复制地址');
        });
      } else {
        showToast('请手动复制地址');
      }
    });
  }

  // Product filter tabs
  var tabs = document.querySelectorAll('.product-tab');
  var productCards = document.querySelectorAll('.products-grid .product-card');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      var filter = tab.dataset.filter;
      productCards.forEach(function (card) {
        var show = filter === 'all' || card.dataset.category === filter;
        card.hidden = !show;
      });
    });
  });

  // Inquiry form
  var form = document.getElementById('inquiry-form');
  var formTip = document.getElementById('form-tip');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var need = form.need.value;
      var message = form.message.value.trim();

      if (!name || !phone || !message) {
        showToast('请填写完整信息');
        return;
      }
      if (!/^1\d{10}$/.test(phone.replace(/[-\s]/g, ''))) {
        showToast('请输入有效手机号');
        return;
      }

      var summary =
        '【布神纺织官网咨询】\n姓名：' + name +
        '\n电话：' + phone +
        '\n需求：' + need +
        '\n留言：' + message;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summary).catch(function () {});
      }

      if (formTip) formTip.hidden = false;
      showToast('提交成功，我们会尽快联系您');
      form.reset();
    });
  }

  // Lightbox
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
  var lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
  var lightboxItems = [];
  var lightboxIndex = 0;

  function collectLightboxItems() {
    lightboxItems = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  }

  function openLightbox(index) {
    if (!lightbox || !lightboxImg || !lightboxItems.length) return;
    lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
    var item = lightboxItems[lightboxIndex];
    lightboxImg.src = item.dataset.src || (item.querySelector('img') && item.querySelector('img').src) || '';
    lightboxImg.alt = item.dataset.caption || '';
    if (lightboxCaption) lightboxCaption.textContent = item.dataset.caption || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  collectLightboxItems();
  lightboxItems.forEach(function (item, index) {
    item.addEventListener('click', function (e) {
      // Avoid conflicting with carousel buttons
      if (e.target.closest('.carousel-btn') || e.target.closest('.thumb')) return;
      collectLightboxItems();
      var freshIndex = lightboxItems.indexOf(item);
      openLightbox(freshIndex >= 0 ? freshIndex : index);
    });
  });

  if (lightbox) {
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () {
      openLightbox(lightboxIndex - 1);
    });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function () {
      openLightbox(lightboxIndex + 1);
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightbox(lightboxIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(lightboxIndex + 1);
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

    function next() { goTo(current + 1); }

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

    function goTo(index) {
      slides[current].classList.remove('is-active');
      if (thumbs[current]) thumbs[current].classList.remove('is-active');

      current = (index + slides.length) % slides.length;

      slides[current].classList.add('is-active');
      if (thumbs[current]) {
        thumbs[current].classList.add('is-active');
        var thumbsContainer = root.querySelector('.showcase-thumbs');
        if (thumbsContainer) {
          var thumb = thumbs[current];
          var left = thumb.offsetLeft - (thumbsContainer.clientWidth - thumb.offsetWidth) / 2;
          thumbsContainer.scrollTo({ left: left, behavior: 'smooth' });
        }
      }
      restartProgress();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function restartProgress() {
      if (!progressBar) return;
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
      if (progressBar) progressBar.style.transition = 'none';
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
