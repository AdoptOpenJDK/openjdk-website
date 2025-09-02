// prefix for assets (e.g. logo)

import { platforms, installCommands, variants } from '../json/config';

// Enables things like 'lookup["X64_MAC"]'
const lookup = {};
platforms.forEach((platform) => (lookup[platform.searchableName] = platform));

let defaultVariant;

// Set the default JDK based on config.json
for (let variant of variants) {
  if (variant.default) {
    defaultVariant = variant.searchableName;
  }
}

const variant = getQueryByName('variant') || defaultVariant;
const jvmVariant = getQueryByName('jvmVariant') || 'hotspot';

export const getVariantObject = (variantName) =>
  variants.find((variant) => variant.searchableName === variantName);

export const findPlatform = (binaryData) => {
  const matchedPlatform = platforms.filter((platform) => {
    return (
      Object.prototype.hasOwnProperty.call(platform, 'attributes') &&
      Object.keys(platform.attributes).every(
        (attr) => platform.attributes[attr] === binaryData[attr]
      )
    );
  })[0];

  return matchedPlatform === undefined ? null : matchedPlatform.searchableName;
};

// gets the OFFICIAL NAME when you pass in 'searchableName'
export const getOfficialName = (searchableName) =>
  lookup[searchableName].officialName;

export const getPlatformOrder = (searchableName) =>
  platforms.findIndex((platform) => platform.searchableName === searchableName);

export const orderPlatforms = (input, attr = 'thisPlatformOrder') => {
  return sortByProperty(input, attr);
};

const sortByProperty = (input, property, descending) => {
  const invert = descending ? -1 : 1;
  const sorter = (a, b) => {
    return invert * (a[property] > b[property] ? 1 : a[property] < b[property] ? -1 : 0);
  };

  if (Array.isArray(input)) {
    return input.sort(sorter);
  } else {
    // Preserve the source object key as '_key'
    return Object.keys(input)
      .map((_key) => Object.assign(input[_key], { _key }))
      .sort(sorter);
  }
};

// gets the Supported Version WITH PATH when you pass in 'searchableName'
// Version numbers use >= logic and need to be specified in ascending order
export const getSupportedVersion = (searchableName) => {
  let supported_version = lookup[searchableName].supported_version;
  if (typeof supported_version === 'object') {
    supported_version = supported_version[jvmVariant];
    if (typeof supported_version === 'object') {
      let major_version = parseInt(variant.replace(/\D/g, ''));
      let supported_version_string;
      for (let version in supported_version) {
        if (major_version >= parseInt(version)) {
          supported_version_string = supported_version[version];
        }
      }
      supported_version = supported_version_string;
    }
  }
  return supported_version;
};

// gets the INSTALLATION COMMANDS when you pass in 'os'
export const getInstallCommands = (os) => {
  let installObject;
  switch (os) {
    case 'windows':
      installObject = fetchInstallObject('powershell');
      break;
    case 'aix':
      installObject = fetchInstallObject('gunzip');
      break;
    case 'solaris':
      installObject = fetchInstallObject('gunzip');
      break;
    default:
      // defaults to tar installation
      installObject = fetchInstallObject('tar');
  }
  return installObject;
};

function fetchInstallObject(command) {
  for (let installCommand of installCommands) {
    if (command == installCommand.name) {
      return installCommand;
    }
  }
}

// This function returns an object containing all information about the user's OS.
// The OS info comes from the 'platforms' array, which in turn comes from 'config.json'.
// `platform` comes from `platform.js`, which should be included on the page where `detectOS` is used.
export const detectOS = () => {
  return (
    platforms.find((aPlatform) => {
      /*global platform*/
      // Workaround for Firefox on macOS which is 32 bit only
      if (platform.os.family == 'OS X') {
        platform.os.architecture = 64;
      }
      return (
        aPlatform.osDetectionString.toUpperCase().includes(
          platform.os.family.toUpperCase()
        ) &&
        aPlatform.attributes.architecture.endsWith(platform.os.architecture)
      ); // 32 or 64 int
    }) || null
  );
};

export const detectLTS = (version) => {
  for (let variant of variants) {
    if (variant.searchableName == version) {
      if (variant.lts == true) {
        return 'LTS';
      } else if (variant.lts == false) {
        return null;
      } else {
        return variant.lts;
      }
    }
  }
};

export const detectEA = (version) => {
  if (version.pre && version.pre == 'ea') {
    return true;
  } else {
    return false;
  }
};

function toJson(response) {
  while (typeof response === 'string') {
    try {
      response = JSON.parse(response);
    } catch {
      return null;
    }
  }
  return response;
}

// load latest_nightly.json/nightly.json/releases.json/latest_release.json files
// This will first try to load from openjdk<X>-binaries repos and if that fails
// try openjdk<X>-release, i.e will try the following:

// https://github.com/AdoptOpenJDK/openjdk10-binaries/blob/master/latest_release.json
// https://github.com/AdoptOpenJDK/openjdk10-releases/blob/master/latest_release.json
function queryAPI(release, url, openjdkImp, vendor, errorHandler, handleResponse) {
  if (!url.endsWith('?') && !url.endsWith('&')) {
    url += '?';
  }
  if (release !== undefined) {
    url += `release=${release}&`;
  }
  if (openjdkImp !== undefined) {
    url += `jvm_impl=${openjdkImp}&`;
  }

  if (vendor !== undefined) {
    url += `vendor=${vendor}&`;
  }

  if (vendor === 'openjdk') {
    url += 'page_size=1';
  }

  loadUrl(url, (response) => {
    if (response === null) {
      errorHandler();
    } else {
      handleResponse(toJson(response), false);
    }
  });
}

export const loadAssetInfo = (
  variant,
  openjdkImp,
  releaseType,
  pageSize,
  datePicker,
  release,
  vendor,
  handleResponse,
  errorHandler
) => {
  if (variant === 'amber') {
    variant = 'openjdk-amber';
  }

  let url = `https://api.adoptopenjdk.net/v3/assets/feature_releases/${variant.replace(
    /\D/g,
    ''
  )}/${releaseType}`;

  if (pageSize) {
    url += `?page_size=${pageSize}&`;
  }

  if (datePicker) {
    url += `before=${datePicker}&`;
  }

  queryAPI(release, url, openjdkImp, vendor, errorHandler, handleResponse);
};

export const loadLatestAssets = (
  variant,
  openjdkImp,
  release,
  handleResponse,
  errorHandler
) => {
  if (variant === 'amber') {
    variant = 'openjdk-amber';
  }
  let vendor = 'adoptopenjdk';
  let base = 'https://api.adoptopenjdk.net/v3/assets/latest/';
  // if openjdkImp == hotspot and version = 8,11 or 16 change vendor to eclipse
  if (
    openjdkImp === 'hotspot' &&
    (variant === 'openjdk8' || variant === 'openjdk11' || variant === 'openjdk16')
  ) {
    vendor = 'eclipse';
    base = 'https://api.adoptium.net/v3/assets/latest/';
  }
  const url = `${base}/${variant.replace(/\D/g, '')}/${openjdkImp}`;
  queryAPI(release, url, openjdkImp, vendor, errorHandler, handleResponse);
};

function loadUrl(url, callback) {
  const xobj = new XMLHttpRequest();
  xobj.open('GET', url, true);
  xobj.onreadystatechange = () => {
    if (xobj.readyState == 4 && xobj.status == '200') {
      callback(xobj.responseText);
    } else if (xobj.status != '200' && xobj.status != '0') {
      callback(null);
    }
  };
  xobj.send(null);
}

// build the menu twisties
export const buildMenuTwisties = () => {
  const submenus = document
    .getElementById('menu-content')
    .getElementsByClassName('submenu');

  for (let i = 0; i < submenus.length; i++) {
    const twisty = document.createElement('span');
    const twistyContent = document.createTextNode('>');
    twisty.appendChild(twistyContent);
    twisty.className = 'twisty';

    const thisLine = submenus[i].getElementsByTagName('a')[0];
    thisLine.appendChild(twisty);

    thisLine.onclick = function () {
      this.parentNode.classList.toggle('open');
    };
  }
};

export const setTickLink = () => {
  const ticks = document.getElementsByClassName('tick');
  for (let i = 0; i < ticks.length; i++) {
    ticks[i].addEventListener('click', (event) => {
      var win = window.open(
        'https://en.wikipedia.org/wiki/Technology_Compatibility_Kit',
        '_blank'
      );
      if (win) {
        win.focus();
      } else {
        alert('New tab blocked - please allow popups.');
      }
      event.preventDefault();
    });
  }
};

// builds up a query string (e.g. "variant=openjdk8&jvmVariant=hotspot")
export const makeQueryString = (params) => {
  return Object.keys(params)
    .map((key) => key + '=' + params[key])
    .join('&');
};

export const setUrlQuery = (params) => {
  window.location.search = makeQueryString(params);
};

function getQueryByName(name) {
  const url = window.location.href;
  const regex = new RegExp('[?&]' + name.replace(/[[]]/g, '\\$&') + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);

  if (!results) return null;
  if (!results[2]) return '';

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export const persistUrlQuery = () => {
  const links = Array.from(document.getElementsByTagName('a'));
  const link =
    (window.location.hostname !== 'localhost' ? 'https://' : '') +
    window.location.hostname;

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
};

export const setRadioSelectors = () => {
  const jdkSelector = document.getElementById('jdk-selector');
  const jvmSelector = document.getElementById('jvm-selector');
  const listedVariants = [];

  function createRadioButtons(name, group, variant, element) {
    if (
      !listedVariants.length ||
      !listedVariants.some((aVariant) => aVariant === name)
    ) {
      const btnLabel = document.createElement('label');
      btnLabel.setAttribute('class', 'btn-label');

      const input = document.createElement('input');
      input.setAttribute('type', 'radio');
      input.setAttribute('name', group);
      input.setAttribute('value', name);
      input.setAttribute('class', 'radio-button');
      input.setAttribute('lts', variant.lts);

      btnLabel.appendChild(input);

      if (group === 'jdk') {
        if (variant.lts === true) {
          btnLabel.innerHTML += `<span>${variant.label} (LTS)</span>`;
        } else if (variant.lts === 'latest') {
          btnLabel.innerHTML += `<span>${variant.label} (Latest)</span>`;
        } else {
          btnLabel.innerHTML += `<span>${variant.label}</span>`;
        }
      } else {
        btnLabel.innerHTML += `<span>${variant}</span>`;
      }

      element.appendChild(btnLabel);
      listedVariants.push(name);
    }
  }

  for (let variant of variants) {
    for (let jvmVariantOption of variant.jvm) {
      const jdkName = variant.searchableName;
      const jvmName = jvmVariantOption.toLowerCase();
      createRadioButtons(jdkName, 'jdk', variant, jdkSelector);
      if (jvmSelector) {
        createRadioButtons(jvmName, 'jvm', jvmVariantOption, jvmSelector);
      }
    }
  }

  const jdkButtons = document.getElementsByName('jdk');
  const jvmButtons = document.getElementsByName('jvm');

  jdkSelector.onchange = () => {
    const jdkButton = Array.from(jdkButtons).find((button) => button.checked);
    setUrlQuery({
      variant: jdkButton.value.match(/(openjdk\d+|amber)/)[1],
      jvmVariant,
    });
  };

  if (jvmSelector) {
    jvmSelector.onchange = () => {
      const jvmButton = Array.from(jvmButtons).find((button) => button.checked);
      setUrlQuery({
        variant,
        jvmVariant: jvmButton.value.match(/([a-zA-Z0-9]+)/)[1],
      });
    };
  }

  for (let jdkButton of jdkButtons) {
    if (jdkButton.value === variant) {
      jdkButton.setAttribute('checked', 'checked');
      break;
    }
  }

  for (let i = 0; i < jvmButtons.length; i++) {
    if (jvmButtons[i].value === jvmVariant) {
      jvmButtons[i].setAttribute('checked', 'checked');
      break;
    }
  }
};

window.renderChecksum = function (checksum) {
  var modal = document.getElementById('myModal');
  document.getElementById('modal-body').innerHTML = checksum;
  modal.style.display = 'inline';
};

window.hideChecksum = function () {
  var modal = document.getElementById('myModal');
  modal.style.display = 'none';
};

window.showHideReleaseNotes = function (notes_id) {
  var notes_div = document.getElementById(notes_id);
  if (notes_div.classList.contains('softHide')) {
    notes_div.classList.remove('softHide');
  } else {
    notes_div.classList.add('softHide');
  }
};

window.copyStringToClipboard = function () {
  const modalBody = document.getElementById('modal-body');
  if (modalBody && typeof modalBody.select === 'function') {
    modalBody.select();
    document.execCommand('copy');
  } else {
    // Fallback for elements that are not input/textarea
    const range = document.createRange();
    range.selectNodeContents(modalBody);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  }
};

export { variant, jvmVariant };
