import {buildMenuTwisties, persistUrlQuery} from './common';

document.addEventListener('DOMContentLoaded', async () => {
  persistUrlQuery();
  buildMenuTwisties();

  // '/index.html' --> 'index'
  // NOTE: Browserify requires strings in `require()`, so this is intentionally more explicit than
  // it normally would be.
  const pageModule = window.location.pathname.split('/').pop().replace(/\.html$/i, '');
  try {
    switch(pageModule) {
      case '':
      case 'index': {
        const indexModule = await import('./index');
        if (indexModule && typeof indexModule.load === 'function') {
          indexModule.load();
        }
        break;
      }
      case 'archive': {
        const archiveModule = await import('./archive');
        if (archiveModule && typeof archiveModule.load === 'function') {
          archiveModule.load();
        }
        break;
      }
      case 'releases': {
        const releasesModule = await import('./releases');
        if (releasesModule && typeof releasesModule.load === 'function') {
          releasesModule.load();
        }
        break;
      }
      case 'upstream': {
        const upstreamModule = await import('./upstream');
        if (upstreamModule && typeof upstreamModule.load === 'function') {
          upstreamModule.load();
        }
        break;
      }
    }
  } catch (error) {
    console.error('Failed to load page module:', pageModule, error);
  }
});
