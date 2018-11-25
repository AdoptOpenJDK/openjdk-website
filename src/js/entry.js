const {buildMenuTwisties, copyClipboard, persistUrlQuery} = require('./common');
Object.assign(global, {buildMenuTwisties, copyClipboard, persistUrlQuery});

const {selectLatestPlatform, unselectLatestPlatform} = require('./releases');
Object.assign(global, {selectLatestPlatform, unselectLatestPlatform});

document.addEventListener('DOMContentLoaded', () => {
  // '/index.html' --> 'index'
  switch(window.location.pathname.substring(1).replace(/\.html$/i, '')) {
    case '':
    case 'index':
      return require('./index').load();
    case 'archive':
      return require('./archive').load();
    case 'installation':
      return require('./installation').load();
    case 'nightly':
      return require('./nightly').load();
    case 'releases':
      return require('./releases').load();
  }
});
