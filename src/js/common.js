const _ = require('underscore');

// prefix for assets (e.g. logo)
const assetPath = './dist/assets/';

const platforms = module.exports.platforms = [];
const variants = module.exports.platforms = [];
const lookup = module.exports.lookup = {};

let variant = module.exports.variant = getQueryByName('variant') || 'openjdk8';
let jvmVariant = module.exports.jvmVariant = getQueryByName('jvmVariant') || 'hotspot';

const jdkSelector = module.exports.jdkSelector = document.getElementById('jdk-selector');
const jvmSelector = module.exports.jvmSelector = document.getElementById('jvm-selector');

// set value for loading dots
const loading = document.getElementById('loading');

// set value for error container
const errorContainer = document.getElementById('error-container');

// set variable names for menu elements
const menuOpen = document.getElementById('menu-button');
const menuClose = document.getElementById('menu-close');
const menu = document.getElementById('menu-container');

menuOpen.onclick = () => {
  menu.className = menu.className.replace(/(?:^|\s)slideOutLeft(?!\S)/g, ' slideInLeft'); // slide in animation
  menu.className = menu.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated'); // removes initial hidden property, activates animations
}

menuClose.onclick = () => {
  menu.className = menu.className.replace(/(?:^|\s)slideInLeft(?!\S)/g, ' slideOutLeft'); // slide out animation
}



function setLookup() {
  // FUNCTIONS FOR GETTING PLATFORM DATA
  // allows us to use, for example, 'lookup["MAC"];'
  for (let i = 0; i < platforms.length; i++) {
    lookup[platforms[i].searchableName] = platforms[i];
  }
}

module.exports.getVariantObject = (variantName) => variants.find((variant) => variant.searchableName === variantName);

module.exports.findPlatform = (binaryData) => {
  const matchedPlatform = _.chain(platforms)
    .filter(function (platform) {
      return platform.hasOwnProperty('attributes')
    })
    .filter(function (platform) {
      const matches = _.chain(platform.attributes)
        .mapObject(function (attributeValue, attributeKey) {
          return binaryData[attributeKey] === attributeValue
        })
        .reduce(function (memo, attributeMatches) {
          return memo && attributeMatches;
        }, true)
        .value()
      return matches
    })
    .first()
    .value();
  return matchedPlatform === undefined ? null : matchedPlatform.searchableName;
}

// gets the OFFICIAL NAME when you pass in 'searchableName'
module.exports.getOfficialName = (searchableName) => lookup[searchableName].officialName;

module.exports.getPlatformOrder = (searchableName) => {
  return platforms.findIndex((platform) => platform.searchableName == searchableName);
}

module.exports.orderPlatforms = (inputArray, attr = 'thisPlatformOrder') => {
  return inputArray.sort((assetA, assetB) => {
    return assetA[attr] < assetB[attr] ? -1 : assetA[attr] > assetB[attr] ? 1 : 0;
  });
}

// gets the BINARY EXTENSION when you pass in 'searchableName'
module.exports.getBinaryExt = (searchableName) => lookup[searchableName].binaryExtension;

// gets the INSTALLER EXTENSION when you pass in 'searchableName'
module.exports.getInstallerExt = (searchableName) => lookup[searchableName].installerExtension;

// gets the LOGO WITH PATH when you pass in 'searchableName'
module.exports.getLogo = (searchableName) => assetPath + lookup[searchableName].logo;

// gets the INSTALLATION COMMAND when you pass in 'searchableName'
module.exports.getInstallCommand = (searchableName) => lookup[searchableName].installCommand;

// gets the CHECKSUM COMMAND when you pass in 'searchableName'
module.exports.getChecksumCommand = (searchableName) => lookup[searchableName].checksumCommand;

// gets the PATH COMMAND when you pass in 'searchableName'
module.exports.getPathCommand = (searchableName) => lookup[searchableName].pathCommand;

// This function returns an object containing all information about the user's OS.
// The OS info comes from the 'platforms' array, which in turn comes from 'config.json'.
// `platform` comes from `platform.js`, which should be included on the page where `detectOS` is used.
module.exports.detectOS = () => {
  return platforms.find((aPlatform) => {
    /*global platform*/
    return aPlatform.osDetectionString.toUpperCase().includes(platform.os.family.toUpperCase());
  }) || null;
}

function toJson(response) {
  while (typeof response === 'string') {
    try {
      response = JSON.parse(response)
    } catch (e) {
      return null
    }
  }
  return response
}

// load latest_nightly.json/nightly.json/releases.json/latest_release.json files
// This will first try to load from openjdk<X>-binaries repos and if that fails
// try openjdk<X>-release, i.e will try the following:

// https://github.com/AdoptOpenJDK/openjdk10-binaries/blob/master/latest_release.json
// https://github.com/AdoptOpenJDK/openjdk10-releases/blob/master/latest_release.json
function queryAPI(release, url, openjdkImp, type, errorHandler, handleResponse) {
  if (!url.endsWith('?')) {
    url += '?';
  }
  if (release !== undefined) {
    url += `release=${release}&`;
  }
  if (openjdkImp !== undefined) {
    url += `openjdk_impl=${openjdkImp}&`;
  }
  if (type !== undefined) {
    url += `type=${type}&`;
  }

  loadUrl(url, (response) => {
    if (response === null) {
      errorHandler();
    } else {
      handleResponse(toJson(response), false);
    }
  });
}

module.exports.loadAssetInfo = (variant, openjdkImp, releaseType, release, type, handleResponse, errorHandler) => {
  if (variant === 'amber') {
    variant = 'openjdk-amber';
  }

  const url = `https://api.adoptopenjdk.net/v2/info/${releaseType}/${variant}`;
  queryAPI(release, url, openjdkImp, type, errorHandler, handleResponse);
}

module.exports.loadLatestAssets = (variant, openjdkImp, releaseType, release, type, handleResponse, errorHandler) => {
  if (variant === 'amber') {
    variant = 'openjdk-amber';
  }

  const url = `https://api.adoptopenjdk.net/v2/latestAssets/${releaseType}/${variant}`;
  queryAPI(release, url, openjdkImp, type, errorHandler, handleResponse);
}

// when using this function, pass in the name of the repo (options: releases, nightly)
function loadJSON(repo, filename, callback) {
  // the URL of the JSON built in the website back-end
  let url = `https://raw.githubusercontent.com/AdoptOpenJDK/${repo}/master/${filename}.json`;
  if (repo === 'adoptopenjdk.net') {
    url = (filename);
  }
  loadUrl(url, callback);
}

function loadUrl(url, callback) {
  const xobj = new XMLHttpRequest();
  xobj.open('GET', url, true);
  xobj.onreadystatechange = () => {
    if (xobj.readyState == 4 && xobj.status == '200') { // if the status is 'ok', run the callback function that has been passed in.
      callback(xobj.responseText);
    } else if (
      xobj.status != '200' && // if the status is NOT 'ok', remove the loading dots, and display an error:
      xobj.status != '0') { // for IE a cross domain request has status 0, we're going to execute this block fist, than the above as well.
      callback(null)
    }
  };
  xobj.send(null);
}

module.exports.loadPlatformsThenData = (callback) => {
  loadJSON('adoptopenjdk.net', './dist/json/config.json', (response) => {
    const configJson = JSON.parse(response);

    if (typeof configJson !== 'undefined') { // if there are releases...
      platforms.push(...configJson.platforms);
      variants.push(...configJson.variants);
      setRadioSelectors();
      setLookup();
      callback();
    }
    else {
      // report an error
      errorContainer.innerHTML = `<p>Error... there's a problem fetching the releases.
        Please see the <a href='https://github.com/AdoptOpenJDK/openjdk-releases/releases' target='blank'>releases list on GitHub</a>.</p>`;
      loading.innerHTML = ''; // remove the loading dots
    }
  });
}

// build the menu twisties
const submenus = document.getElementById('menu-content').getElementsByClassName('submenu');

for (let i = 0; i < submenus.length; i++) {
  const twisty = document.createElement('span');
  const twistyContent = document.createTextNode('>');
  twisty.appendChild(twistyContent);
  twisty.className = 'twisty';

  const thisLine = submenus[i].getElementsByTagName('a')[0];
  thisLine.appendChild(twisty);

  thisLine.onclick = function () {
    this.parentNode.classList.toggle('open');
  }
}

module.exports.setTickLink = () => {
  const ticks = document.getElementsByClassName('tick');
  for (let i = 0; i < ticks.length; i++) {
    ticks[i].addEventListener('click', (event) => {
      var win = window.open('https://en.wikipedia.org/wiki/Technology_Compatibility_Kit', '_blank');
      if (win) {
        win.focus();
      } else {
        alert('New tab blocked - please allow popups.');
      }
      event.preventDefault();
    });
  }
}

// builds up a query string (e.g. "variant=openjdk8&jvmVariant=hotspot")
const makeQueryString = module.exports.makeQueryString = (params) => {
  return Object.keys(params).map((key) => key + '=' + params[key]).join('&');
}

function setUrlQuery(params) {
  window.location.search = makeQueryString(params);
}

function getQueryByName(name) {
  const url = window.location.href;
  const regex = new RegExp('[?&]' + name.replace(/[[]]/g, '\\$&') + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);

  if (!results) return null;
  if (!results[2]) return '';

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

global.persistUrlQuery = () => {
  const links = Array.from(document.getElementsByTagName('a'));
  const link = (window.location.hostname !== 'localhost' ? 'https://' : '') + window.location.hostname;

  links.forEach((eachLink) => {
    if (eachLink.href.includes(link)) {
      if (eachLink.href.includes('#')) {
        const anchor = '#' + eachLink.href.split('#').pop();
        eachLink.href = eachLink.href.substr(0, eachLink.href.indexOf('#'));
        if (eachLink.href.includes('?')) {
          eachLink.href = eachLink.href.substr(0, eachLink.href.indexOf('?'));
        }
        eachLink.href = eachLink.href + window.location.search + anchor;
      } else {
        eachLink.href = eachLink.href + window.location.search;
      }
    }
  });
}

function setRadioSelectors() {
  const listedVariants = [];
  function createRadioButtons(name, group, variant, element) {
    if (!listedVariants.length || !listedVariants.some((aVariant) => aVariant === name)) {
      const btnLabel = document.createElement('label');
      btnLabel.setAttribute('class', 'btn-label');

      const input = document.createElement('input');
      input.setAttribute('type', 'radio');
      input.setAttribute('name', group);
      input.setAttribute('value', name);
      input.setAttribute('class', 'radio-button');
      input.setAttribute('lts', variant.lts)

      btnLabel.appendChild(input);

      if (group === 'jdk') {
        btnLabel.innerHTML += `<span>${variant.label}${variant.lts ? ' (LTS)' : ''}</span>`;
      } else {
        btnLabel.innerHTML += `<span>${variant.jvm}</span>`;
      }

      element.appendChild(btnLabel);
      listedVariants.push(name);
    }
  }

  for (let x = 0; x < variants.length; x++) {
    const splitVariant = variants[x].searchableName.split('-');
    const jdkName = splitVariant[0];
    const jvmName = splitVariant[1];
    createRadioButtons(jdkName, 'jdk', variants[x], jdkSelector);
    createRadioButtons(jvmName, 'jvm', variants[x], jvmSelector);
  }

  const jdkButtons = document.getElementsByName('jdk');
  const jvmButtons = document.getElementsByName('jvm');

  jdkSelector.onchange = () => {
    const jdkButton = Array.from(jdkButtons).find((button) => button.checked);
    setUrlQuery({
      variant: jdkButton.value.match(/(openjdk\d+|amber)/)[1],
      jvmVariant
    });
  };

  jvmSelector.onchange = () => {
    const jvmButton = Array.from(jvmButtons).find((button) => button.checked);
    setUrlQuery({
      variant,
      jvmVariant: jvmButton.value.match(/([a-zA-Z0-9]+)/)[1]
    });
  };


  for (let i = 0; i < jdkButtons.length; i++) {
    if (jdkButtons[i].value === variant) {
      jdkButtons[i].setAttribute('checked', 'checked');
      break;
    }
  }

  for (let i = 0; i < jvmButtons.length; i++) {
    if (jvmButtons[i].value === jvmVariant) {
      jvmButtons[i].setAttribute('checked', 'checked');
      break;
    }
  }
}

global.copyClipboard = (elementSelector) => {
  const input = document.createElement('input');
  input.value = document.querySelector(elementSelector).textContent;

  document.body.appendChild(input);
  input.select();

  document.execCommand('copy');
  alert('Copied to clipboard');

  document.body.removeChild(input);
}
