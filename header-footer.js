(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var nav = header.querySelector('.dr-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    if (!expanded) {
      nav.classList.add('dr-nav-open');
    } else {
      nav.classList.remove('dr-nav-open');
    }
  });
})();
