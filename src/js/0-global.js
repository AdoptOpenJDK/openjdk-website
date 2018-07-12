/* eslint-disable no-unused-vars */
var platforms = [];
var variants = [];
var lookup = {};
var i = 0;
var variant = getQueryByName('variant');
var jvmVariant = getQueryByName('jvmVariant');
var variantSelector = document.getElementById('variant-selector');
var platformSelector = document.getElementById('platform-selector');

if(jvmVariant === undefined || jvmVariant === null) {
  jvmVariant = 'hotspot';
}

function setLookup() {
  // FUNCTIONS FOR GETTING PLATFORM DATA
  // allows us to use, for example, 'lookup["MAC"];'
  for (i = 0; i < platforms.length; i++) {
    lookup[platforms[i].searchableName] = platforms[i];
  }
}

function getVariantObject(variant) {
  var variantObject = '';
  variants.forEach(function(eachVariant) {
    if(eachVariant.searchableName === variant){
      variantObject = eachVariant;
    }
  });
  return variantObject;
}

// gets the 'searchableName' when you pass in the full filename.
// If the filename does not match a known platform, returns false. (E.g. if a new or incorrect file appears in a repo)
function getSearchableName(filename) {
  var platform = null;
  platforms.forEach(function(eachPlatform) {
    if(filename.indexOf(eachPlatform.searchableName) >= 0) {
      platform = eachPlatform.searchableName;
    }
  });
  if(platform) {
    return platform;
  }
  else {
    return null;
  }
}

// set path to logos
var logoPath = './dist/assets/';

// gets the OFFICIAL NAME when you pass in 'searchableName'
function getOfficialName(searchableName) {
  return (lookup[searchableName].officialName);
}


function getPlatformOrder(searchableName) {
  var index = platforms.findIndex(function(platform) {
    return platform.searchableName == searchableName;
  });
  return index;
}

function orderPlatforms(inputArray) {
  function compareOrder(thisAsset,nextAsset) {
    if (thisAsset.thisPlatformOrder < nextAsset.thisPlatformOrder)
      return -1;
    if (thisAsset.thisPlatformOrder > nextAsset.thisPlatformOrder)
      return 1;
    return 0;
  }
  var orderedArray = inputArray.sort(compareOrder);
  return orderedArray;
}

// gets the BINARY EXTENSION when you pass in 'searchableName'
function getBinaryExt(searchableName) {
  return (lookup[searchableName].binaryExtension);
}

// gets the INSTALLER EXTENSION when you pass in 'searchableName'
function getInstallerExt(searchableName) {
  return (lookup[searchableName].installerExtension);
}

// gets the LOGO WITH PATH when you pass in 'searchableName'
function getLogo(searchableName) {
  return (logoPath + (lookup[searchableName].logo));
}

// gets the INSTALLATION COMMAND when you pass in 'searchableName'
function getInstallCommand(searchableName) {
  return (lookup[searchableName].installCommand);
}

// gets the CHECKSUM COMMAND when you pass in 'searchableName'
function getChecksumCommand(searchableName) {
  return (lookup[searchableName].checksumCommand);
}

// gets the PATH COMMAND when you pass in 'searchableName'
function getPathCommand(searchableName) {
  return (lookup[searchableName].pathCommand);
}

// set value for loading dots on every page
var loading = document.getElementById('loading');

// set value for error container on every page
var errorContainer = document.getElementById('error-container');

// set variable names for menu elements
const menuOpen = document.getElementById('menu-button');
const menuClose = document.getElementById('menu-close');
const menu = document.getElementById('menu-container');

menuOpen.onclick = function() {
  menu.className = menu.className.replace( /(?:^|\s)slideOutLeft(?!\S)/g , ' slideInLeft' ); // slide in animation
  menu.className = menu.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated' ); // removes initial hidden property, activates animations
}

menuClose.onclick = function() {
  menu.className = menu.className.replace( /(?:^|\s)slideInLeft(?!\S)/g , ' slideOutLeft' ); // slide out animation
}

// this function returns an object containing all information about the user's OS (from the 'platforms' array)
function detectOS() {
  // if the platform detection library's output matches the 'osDetectionString' of any platform object in the 'platforms' array...
  // ...set the variable 'matchedOS' as the whole object. Else, 'matchedOS' will be null.
  var matchedOS = null;
  platforms.forEach(function(eachPlatform) {
    var thisPlatformMatchingString = eachPlatform.osDetectionString.toUpperCase();
    /* eslint-disable */
    var platformFamily = platform.os.family.toUpperCase(); // platform.os.family is dependent on 'platform.js', loaded by index.html (injected in index.handlebars)
    /* eslint-enable */
    if(thisPlatformMatchingString.indexOf(platformFamily) >= 0) { // if the detected 'platform family' string appears in the osDetectionString value of a platform...
      matchedOS = eachPlatform;
    }
  });

  if(matchedOS){ return matchedOS; } else { return null; }
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
function loadAssetInfo(variant, releaseType, filename, handleResponse, errorHandler) {
  loadJSON(variant + '-binaries', filename, function (response) {

    response = toJson(response);

    var validResponse = response !== null && typeof response === 'object';

    if (!validResponse || !handleResponse(response, false)) {

      var jvmTypeUrl = jvmVariant === 'hotspot' ? '' : jvmVariant + '-';

      loadJSON(variant + '-' + jvmTypeUrl + releaseType, filename, function (response) {
        response = toJson(response);

        validResponse = response !== null && typeof response === 'object';
        if (!validResponse || !handleResponse(response, true)) {
          if (errorHandler) {
            errorHandler();
          }
        }
      });
    }
  });
}

// when using this function, pass in the name of the repo (options: releases, nightly)
function loadJSON(repo, filename, callback) {
  var url = ('https://raw.githubusercontent.com/AdoptOpenJDK/' + repo + '/master/' + filename + '.json'); // the URL of the JSON built in the website back-end
  if(repo === 'adoptopenjdk.net') {
    url = (filename);
  }
  var xobj = new XMLHttpRequest();
  xobj.open('GET', url, true);
  xobj.onreadystatechange = function () {
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

function loadPlatformsThenData(callback) {
  loadJSON('adoptopenjdk.net', './dist/json/config.json', function(response) {
    var configJson = JSON.parse(response);

    if (typeof configJson !== 'undefined') { // if there are releases...
      platforms = configJson.platforms;
      variants = configJson.variants;
      setVariantSelector();
      setLookup();
      callback();
    }
    else {
      // report an error
      errorContainer.innerHTML = '<p>Error... there\'s a problem fetching the releases. Please see the <a href=\'https://github.com/AdoptOpenJDK/openjdk-releases/releases\' target=\'blank\'>releases list on GitHub</a>.</p>';
      loading.innerHTML = ''; // remove the loading dots
    }
  });
}

// build the menu twisties
var submenus = document.getElementById('menu-content').getElementsByClassName('submenu');

for (i = 0; i < submenus.length; i++) {
  var twisty = document.createElement('span');
  var twistyContent = document.createTextNode('>');
  twisty.appendChild(twistyContent);
  twisty.className = 'twisty';

  var thisLine = submenus[i].getElementsByTagName('a')[0];
  thisLine.appendChild(twisty);

  thisLine.onclick = function(){
    this.parentNode.classList.toggle('open');
  }
}

function setTickLink() {
  var ticks = document.getElementsByClassName('tick');
  for (i = 0; i < ticks.length; i++) {
    ticks[i].addEventListener('click', function(event) {
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

// builds up a query, i.e "...nightly.html?variant=openjdk8&jvmVariant=hotspot"
function formUrlQueryArgs(args) {
  var first=true;
  var search='';

  for(var i=0;i<args.length;i=i+2) {
    var name = args[i];
    var newValue = args[i + 1];

    if (!first) {
      search += ('&' + name + '=' + newValue);
    } else {
      search += (name + '=' + newValue);
      first = false;
    }
  }
  return search;
}


function getRepoName(oldRepo) {
  var jvmVariantTag = "";

  if (oldRepo) {
    if (jvmVariant !== "hotspot") {
      jvmVariantTag = "-" + jvmVariant;
    }

    return variant + jvmVariantTag + "-releases";
  } else {
    return variant + "-" + jvmVariant;
  }
}

function formSearchArgs() {
  return formUrlQueryArgs(arguments);
}

function setUrlQuery() {
    window.location.search=formUrlQueryArgs(arguments);
}

function getQueryByName(name) {
  var url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function persistUrlQuery() {
  var anchor='';
  var links = Array.apply(null, document.getElementsByTagName('a'));
  var link = window.location.hostname;
  if (link != 'localhost') {
    link = 'https://' + link;
  }
  links.forEach(function(eachLink) {
    if(eachLink.href.indexOf(link) >= 0) {
      if (eachLink.href.indexOf('#') > -1) {
        anchor = '#' + eachLink.href.split('#').pop();
        eachLink.href = eachLink.href.substr(0, eachLink.href.indexOf('#'));
        if (eachLink.href.indexOf('?') > -1) {
          eachLink.href = eachLink.href.substr(0, eachLink.href.indexOf('?'));
        }
        eachLink.href = (eachLink.href + window.location.search + anchor);
      } else {
        eachLink.href = (eachLink.href + window.location.search);
      }
    }
  });
}

const versionMatcher=/(openjdk\d+|amber)-([a-zA-Z0-9]+)/;

function setVariantSelector() {
  if(variantSelector) {
    if(variantSelector.options.length === 0) {
      variants.forEach(function(eachVariant) {
        var op = new Option();
        op.value = eachVariant.searchableName;
        op.text = eachVariant.officialName;
        op.description = eachVariant.description;
        op.descriptionLink = eachVariant.descriptionLink;
        variantSelector.options.add(op);
        if(!variant && eachVariant.default){
          const matches = variantSelector.value.match(versionMatcher);
          variant = matches[1];
          jvmVariant = matches[2];
        }
      });
    }

    if(!variant) {
      variant = variants[0].searchableName;
    }

    variantSelector.value = variant + '-' + jvmVariant;

    if(variantSelector.value === '') {
      var op = new Option();
      op.value = 'unknown';
      op.text = 'Select a variant';
      variantSelector.options.add(op);
      variantSelector.value = 'unknown';
      errorContainer.innerHTML = '<p>Error: no such variant. Please select a valid variant from the drop-down list.</p>';
    }

    variantSelector.onchange = function() {
      const matches = variantSelector.value.match(versionMatcher);
      const versionNumber = matches[1];
      const jvmVariant = matches[2];
      setUrlQuery('variant', versionNumber, 'jvmVariant', jvmVariant);
    };
  }
}

function copyClipboard(element) {
  var $temp = $('<input>');
  $('body').append($temp);
  $temp.val($(element).text()).select();
  document.execCommand('copy');
  $temp.remove();
  alert('Copied to clipboard');
}

function highlightCode() {
  hljs.initHighlightingOnLoad();
}
