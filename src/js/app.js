const _ = require('underscore');

const app_global = require('./0-global');

global.onIndexLoad = require('./index').onIndexLoad;
global.onArchiveLoad = require('./archive').onArchiveLoad;
global.onInstallationLoad = require('./installation').onInstallationLoad;
global.onNightlyLoad = require('./nightly').onNightlyLoad;
global.onLatestLoad = require('./releases').onLatestLoad;

global.persistUrlQuery = app_global.persistUrlQuery;
