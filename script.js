(function () {
  function resolveAsset(relativePath) {
    try {
      return new URL(relativePath, window.location.href).href;
    } catch (e) {
      return relativePath;
    }
  }

  // לוגו: נתיבים יחסיים images/... (תקין ל-Vercel, GitHub Pages ותיקיית משנה)
  var logoPaths = [
    resolveAsset('images/logo.png'),
    resolveAsset('images/logo.jpg'),
    resolveAsset('images/logo.svg'),
    resolveAsset('logo.png'),
    resolveAsset('logo.jpg'),
    resolveAsset('logo.svg')
  ];
  var logoIndex = 0;
  document.querySelectorAll('.logo-img').forEach(function (img) {
    function tryNextLogo() {
      if (logoIndex >= logoPaths.length) {
        img.style.display = 'none';
        return;
      }
      img.onerror = tryNextLogo;
      img.onload = function () {
        img.onerror = null;
        var text = img.nextElementSibling;
        if (text && text.classList.contains('logo-text')) text.style.display = 'none';
      };
      img.src = logoPaths[logoIndex];
      logoIndex += 1;
    }
    img.onerror = tryNextLogo;
    img.onload = function () {
      img.onerror = null;
      var text = img.nextElementSibling;
      if (text && text.classList.contains('logo-text')) text.style.display = 'none';
    };
    img.src = logoPaths[0];
    logoIndex = 1;
  });

  // טעינת תמונת המרצה: מנסים כמה נתיבים (אותה תיקייה כמו index.html או תיקיית images)
  var instructorImg = document.getElementById('instructor-photo');
  if (instructorImg) {
    var pathsToTry = [
      resolveAsset('images/afek-dudik.png'),
      resolveAsset('images/afek-dudik.jpg'),
      resolveAsset('afek-dudik.png'),
      resolveAsset('afek-dudik.jpg')
    ];
    var index = 0;

    function tryNext() {
      if (index >= pathsToTry.length) {
        showFallback();
        return;
      }
      instructorImg.onerror = tryNext;
      instructorImg.onload = function () { instructorImg.onerror = null; };
      instructorImg.src = pathsToTry[index];
      index += 1;
    }

    function showFallback() {
      instructorImg.style.display = 'none';
      instructorImg.onerror = null;
      var wrap = instructorImg.parentElement;
      wrap.classList.add('instructor-img-fallback');
      if (!wrap.querySelector('.instructor-fallback-text')) {
        var text = document.createElement('span');
        text.className = 'instructor-fallback-text';
        text.textContent = 'אפק דודיק';
        wrap.appendChild(text);
      }
    }

    instructorImg.onerror = tryNext;
    instructorImg.onload = function () { instructorImg.onerror = null; };
    instructorImg.src = pathsToTry[0];
    index = 1;
  }

  // Mobile menu toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
      });
    });
  }

  // Form submit: prevent default (no backend yet), show message
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#name').value;
      if (name) {
        alert('תודה ' + name + '! הפרטים נשלחו. נחזור אליך בהקדם.');
      }
    });
  }
})();
