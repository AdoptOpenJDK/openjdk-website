// set variables for all index page HTML elements that will be used by the JS
const dlText = document.getElementById('dl-text');
const dlLatest = document.getElementById('dl-latest');
const dlArchive = document.getElementById('dl-archive');
const dlOther = document.getElementById('dl-other');
const dlIcon = document.getElementById('dl-icon');
const dlIcon2 = document.getElementById('dl-icon-2');
const dlVersionText = document.getElementById('dl-version-text');

// When index page loads, run:
/* eslint-disable no-unused-vars */
function onIndexLoad() {
  setDownloadSection(); // on page load, populate the central download section.
}
/* eslint-enable no-unused-vars */

// INDEX PAGE FUNCTIONS
function removeRadioButtons() {
  var buttons = document.getElementsByClassName('btn-label');
  for (var a = 0; a < buttons.length; a++) {
    if (buttons[a].firstChild.value == "openjdk9" || buttons[a].firstChild.value == "openjdk10") {
      buttons[a].style.display = "none";
    }
  }
}
/* eslint-disable no-unused-vars */
function setDownloadSection() {
  loadPlatformsThenData(function() {
    removeRadioButtons();
    var handleResponse = function (releasesJson) {
      if (releasesJson !== null && releasesJson !== 'undefined') {

        /* eslint-disable no-undef */
        var repoName = getRepoName(true, 'releases');

        if (typeof releasesJson !== 'undefined') { // if there are releases...
          loadJSON(repoName, 'jck', function(response_jck) {
            var jckJSON = {}
            if (response_jck !== null) {
              jckJSON = JSON.parse(response_jck)
            }
            buildHomepageHTML(releasesJson, jckJSON);
          });
          return true;
        }
      }
      return false;
    };

    /* eslint-disable no-undef */
    loadAssetInfo(variant, jvmVariant, 'releases', 'latest', handleResponse, function () {
      errorContainer.innerHTML = '<p>There are no releases available for ' + variant + ' on the ' + jvmVariant + ' jvm. Please check our <a href=nightly.html?variant=' + variant + '&jvmVariant=' + jvmVariant + ' target=\'blank\'>Nightly Builds</a>.</p>';
      loading.innerHTML = ''; // remove the loading dots
    });
  });

}

/* eslint-disable no-unused-vars */
function buildHomepageHTML(releasesJson, jckJSON) {
  // set the download button's version number to the latest release
  dlVersionText.innerHTML = releasesJson.release_name;

  var assetArray = releasesJson.binaries;

  var OS = detectOS(); // set a variable as an object containing all information about the user's OS (from the global.js 'platforms' array)
  var matchingFile = null;

  // if the OS has been detected...
  if (OS) {
    assetArray.forEach(function(eachAsset) { // iterate through the assets attached to this release
      var nameOfFile = eachAsset.binary_name;
      var uppercaseFilename = nameOfFile.toUpperCase();
      var thisPlatform = findPlatform(eachAsset);
      var uppercaseOSname = null;
      // firstly, check if a valid searchableName has been returned (i.e. the platform is recognised)...
      if (thisPlatform) {

        // secondly, check if the file has the expected file extension for that platform...
        // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
        var thisBinaryExtension = getBinaryExt(thisPlatform); // get the binary extension associated with this platform
        var thisInstallerExtension = getInstallerExt(thisPlatform); // get the installer extension associated with this platform
        if (matchingFile == null) {
          if (uppercaseFilename.indexOf(thisInstallerExtension.toUpperCase()) >= 0) {
            uppercaseOSname = OS.searchableName.toUpperCase();
            if (Object.keys(jckJSON).length != 0) {
              if (jckJSON[releasesJson.tag_name] && jckJSON[releasesJson.tag_name].hasOwnProperty(uppercaseOSname)) {
                document.getElementById('jck-approved-tick').classList.remove('hide');
                setTickLink();
              }
            }

            // thirdly, check if the user's OS searchableName string matches part of this binary's name (e.g. ...X64_LINUX...)
            if (uppercaseFilename.indexOf(uppercaseOSname) >= 0) {
              matchingFile = eachAsset; // set the matchingFile variable to the object containing this binary
            }
          } else if (uppercaseFilename.indexOf(thisBinaryExtension.toUpperCase()) >= 0) {
            uppercaseOSname = OS.searchableName.toUpperCase();
            if (Object.keys(jckJSON).length != 0) {
              if (jckJSON[releasesJson.tag_name] && jckJSON[releasesJson.tag_name].hasOwnProperty(uppercaseOSname)) {
                document.getElementById('jck-approved-tick').classList.remove('hide');
                setTickLink();
              }
            }
            // thirdly, check if the user's OS searchableName string matches part of this binary's name (e.g. ...X64_LINUX...)
            if (uppercaseFilename.indexOf(uppercaseOSname) >= 0) {
              matchingFile = eachAsset; // set the matchingFile variable to the object containing this binary
            }
          }
        }
      }
    });
  }

  // if there IS a matching binary for the user's OS...
  if (matchingFile) {
    dlLatest.href = matchingFile.binary_link; // set the main download button's link to be the binary's download url
    dlText.innerHTML = ('Download for <var platform-name>' + OS.officialName + '</var>'); // set the text to be OS-specific, using the full OS name.
    var thisBinarySize = Math.floor((matchingFile.binary_size) / 1024 / 1024);
    dlVersionText.innerHTML += (' - ' + thisBinarySize + ' MB');

  }
  // if there is NOT a matching binary for the user's OS...
  else {
    dlOther.classList.add('hide'); // hide the 'Other platforms' button
    dlIcon.classList.add('hide'); // hide the download icon on the main button, to make it look less like you're going to get a download immediately
    dlIcon2.classList.remove('hide'); // un-hide an arrow-right icon to show instead
    dlText.innerHTML = ('Downloads'); // change the text to be generic: 'Downloads'.
    /* eslint-disable no-undef */
    dlLatest.href = './releases.html?' + formSearchArgs('variant',variant,'jvmVariant', jvmVariant); // set the main download button's link to the latest releases page for all platforms.
  }

  // remove the loading dots, and make all buttons visible, with animated fade-in
  loading.classList.add('hide');
  dlLatest.className = dlLatest.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');
  dlOther.className = dlOther.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');
  dlArchive.className = dlArchive.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');

  dlLatest.onclick = function() {
    document.getElementById('installation-link').className += ' animated pulse infinite transition-bright';
  };

  // animate the main download button shortly after the initial animation has finished.
  setTimeout(function() {
    dlLatest.className = 'dl-button a-button animated pulse';
  }, 1000);
}
