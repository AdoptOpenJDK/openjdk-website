global.onIndexLoad = require('./index').onIndexLoad;
global.onArchiveLoad = require('./archive').onArchiveLoad;
global.onInstallationLoad = require('./installation').onInstallationLoad;
global.onNightlyLoad = require('./nightly').onNightlyLoad;
global.onLatestLoad = require('./releases').onLatestLoad;

const {buildMenuTwisties, copyClipboard, persistUrlQuery} = require('./common');
Object.assign(global, {buildMenuTwisties, copyClipboard, persistUrlQuery});

const {selectLatestPlatform, unselectLatestPlatform} = require('./releases');
Object.assign(global, {selectLatestPlatform, unselectLatestPlatform});
