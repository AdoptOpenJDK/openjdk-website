const {buildMenuTwisties, persistUrlQuery} = require('./common');

document.addEventListener('DOMContentLoaded', () => {
  persistUrlQuery();
  buildMenuTwisties();

  // '/index.html' --> 'index'
  // NOTE: Browserify requires strings in `require()`, so this is intentionally more explicit than
  // it normally would be.
  switch(window.location.pathname.split('/').pop().replace(/\.html$/i, '')) {
    case '':
    case 'index':
      return require('./index').load();
    case 'archive':
      return require('./archive').load();
    case 'installation':
      return require('./installation').load();
    case 'releases':
      return require('./releases').load();
    case 'testimonials':
      return require('./testimonials').load();
    case 'upstream':
      return require('./upstream').load();
  }
});
