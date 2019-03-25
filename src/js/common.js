// prefix for assets (e.g. logo)
const assetPath = './dist/assets/';

const {platforms, variants} = require('../json/config');

// Enables things like 'lookup["X64_MAC"]'
const lookup = {};
platforms.forEach((platform) => lookup[platform.searchableName] = platform);

let variant = module.exports.variant = getQueryByName('variant') || 'openjdk8';
let jvmVariant = module.exports.jvmVariant = getQueryByName('jvmVariant') || 'hotspot';

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

module.exports.getVariantObject = (variantName) => variants.find((variant) => variant.searchableName === variantName);

module.exports.findPlatform = (binaryData) => {
  const matchedPlatform = platforms.filter((platform) => {
      return platform.hasOwnProperty('attributes')
        && Object.keys(platform.attributes).every((attr) => platform.attributes[attr] === binaryData[attr])
    })[0];

  return matchedPlatform === undefined ? null : matchedPlatform.searchableName;
}

// gets the OFFICIAL NAME when you pass in 'searchableName'
module.exports.getOfficialName = (searchableName) => lookup[searchableName].officialName;

module.exports.getPlatformOrder = (searchableName) => {
  return platforms.findIndex((platform) => platform.searchableName == searchableName);
}

module.exports.orderPlatforms = (input, attr = 'thisPlatformOrder') => {
  return sortByProperty(input, attr);
};

const sortByProperty = module.exports.sortByProperty = (input, property, descending) => {
  const invert = descending ? -1 : 1;
  const sorter = (a, b) => {
    return invert * (a[property] > b[property] ? 1 : a[property] < b[property] ? -1 : 0);
  };

  if (Array.isArray(input)) {
    return input.sort(sorter);
  } else {
    // Preserve the source object key as '_key'
    return Object.keys(input)
      .map(_key => Object.assign(input[_key], {_key}))
      .sort(sorter);
  }
};

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
    // Workaround for Firefox on macOS which is 32 bit only
    if (platform.os.family == 'OS X') {
      platform.os.architecture = 64
    }
    return aPlatform.osDetectionString.toUpperCase().includes(platform.os.family.toUpperCase())
      && aPlatform.attributes.architecture.endsWith(platform.os.architecture); // 32 or 64 int
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

// build the menu twisties
module.exports.buildMenuTwisties = () => {
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

module.exports.persistUrlQuery = () => {
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

module.exports.setRadioSelectors = () => {
  const jdkSelector = document.getElementById('jdk-selector');
  const jvmSelector = document.getElementById('jvm-selector');
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
        if (variant.lts === true){
          btnLabel.innerHTML += `<span>${variant.label} (LTS)</span>`;
        } else if (variant.lts === 'latest') {
          btnLabel.innerHTML += `<span>${variant.label} (Latest)</span>`;
        } else {
          btnLabel.innerHTML += `<span>${variant.label}</span>`;
        }
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
