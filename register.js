(function () {
  // לוגו – טעינה ממיקום הדף, ניסיון בכמה נתיבים וסיומות
  var base = (function () {
    var href = window.location.href;
    var last = href.lastIndexOf('/');
    return last === -1 ? '' : href.substring(0, last + 1);
  })();
  var logoPaths = [
    base + 'logo.png',
    base + 'logo.jpg',
    base + 'logo.svg',
    base + 'images/logo.png',
    base + 'images/logo.jpg',
    base + 'images/logo.svg'
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

  var form = document.getElementById('register-form');
  if (!form) return;

  var fields = {
    name: {
      el: document.getElementById('reg-name'),
      validate: function (value) {
        value = (value || '').trim();
        if (value.length < 2) return 'נא להזין שם מלא (לפחות 2 תווים).';
        if (value.length > 100) return 'השם ארוך מדי.';
        return null;
      }
    },
    phone: {
      el: document.getElementById('reg-phone'),
      validate: function (value) {
        var digits = (value || '').replace(/\D/g, '');
        if (digits.length < 9) return 'נא להזין מספר טלפון.';
        if (digits.length > 10) return 'מספר הטלפון ארוך מדי.';
        if (digits.length === 9 && /^[2-9]/.test(digits)) return null;
        if (digits.length === 10 && digits.charAt(0) === '0' && /[2-9]/.test(digits.charAt(1))) return null;
        return 'נא להזין מספר טלפון תקין (למשל 050-1234567).';
      }
    },
    email: {
      el: document.getElementById('reg-email'),
      validate: function (value) {
        value = (value || '').trim();
        if (!value) return 'נא להזין כתובת אימייל.';
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(value)) return 'נא להזין כתובת אימייל תקינה.';
        return null;
      }
    },
    message: {
      el: document.getElementById('reg-message'),
      validate: function (value) {
        return null;
      }
    }
  };

  function getGroup(fieldName) {
    return form.querySelector('.form-group[data-field="' + fieldName + '"]');
  }

  function showError(fieldName, message) {
    var group = getGroup(fieldName);
    var err = group && group.querySelector('.error-message');
    if (group) group.classList.add('has-error');
    if (err) err.textContent = message || '';
  }

  function clearError(fieldName) {
    var group = getGroup(fieldName);
    var err = group && group.querySelector('.error-message');
    if (group) group.classList.remove('has-error');
    if (err) err.textContent = '';
  }

  function validateField(fieldName) {
    var f = fields[fieldName];
    if (!f || !f.el) return null;
    var msg = f.validate(f.el.value);
    if (msg) {
      showError(fieldName, msg);
      return msg;
    }
    clearError(fieldName);
    return null;
  }

  function validateAll() {
    var hasError = false;
    Object.keys(fields).forEach(function (key) {
      if (validateField(key)) hasError = true;
    });
    return !hasError;
  }

  Object.keys(fields).forEach(function (key) {
    var el = fields[key].el;
    if (!el) return;
    el.addEventListener('blur', function () {
      validateField(key);
    });
    el.addEventListener('input', function () {
      if (getGroup(key).classList.contains('has-error')) validateField(key);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateAll()) {
      var firstError = form.querySelector('.form-group.has-error');
      if (firstError) {
        var input = firstError.querySelector('input, textarea');
        if (input) input.focus();
      }
      return;
    }

    var name = (fields.name.el && fields.name.el.value) || '';
    var phone = (fields.phone.el && fields.phone.el.value) || '';
    var email = (fields.email.el && fields.email.el.value) || '';
    var message = (fields.message.el && fields.message.el.value) || '';

    var btn = form.querySelector('.btn-submit');
    var originalText = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'שולח...';
    }

    var formspreeId = (form.dataset && form.dataset.formspreeId) ? form.dataset.formspreeId.trim() : '';
    var whatsappNum = (form.dataset && form.dataset.whatsapp) ? form.dataset.whatsapp.trim() : '972543205622';

    var payload = {
      name: name,
      phone: phone,
      email: email,
      message: message,
      _subject: 'הרשמה חדשה – קורס לק ג\'ל'
    };

    function done(success) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
      if (success) {
        alert('תודה ' + name.trim() + '! ההרשמה התקבלה. נחזור אליך בהקדם.');
        form.reset();
        Object.keys(fields).forEach(clearError);
      } else {
        alert('אירעה שגיאה בשליחה. נסי שוב או צרי קשר בוואטסאפ.');
      }
    }

    if (formspreeId) {
      fetch('https://formspree.io/f/' + formspreeId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          if (r.ok) return r.json();
          throw new Error('Formspree error');
        })
        .then(function () {
          openWhatsApp(whatsappNum, name, phone, email, message);
          done(true);
        })
        .catch(function () {
          openWhatsApp(whatsappNum, name, phone, email, message);
          done(true);
        });
    } else {
      openWhatsApp(whatsappNum, name, phone, email, message);
      done(true);
    }
  });

  function openWhatsApp(num, name, phone, email, message) {
    var text = 'הרשמה חדשה – קורס לק ג\'ל\n\nשם: ' + (name || '') + '\nטלפון: ' + (phone || '') + '\nאימייל: ' + (email || '') + '\nהודעה: ' + (message || '');
    var url = 'https://wa.me/' + num.replace(/\D/g, '') + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  }
})();
