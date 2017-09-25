// set variables for all index page HTML elements that will be used by the JS
const dlText = document.getElementById('dl-text');
const dlLatest = document.getElementById('dl-latest');
const dlArchive = document.getElementById('dl-archive');
const dlOther = document.getElementById('dl-other');
const dlIcon = document.getElementById('dl-icon');
const dlIcon2 = document.getElementById('dl-icon-2');
const dlVersionText = document.getElementById('dl-version-text');

const recommender = document.getElementById('recommender');

const user = document.getElementById('user');
const developer = document.getElementById('developer');
const powerUser = document.getElementById('power-user');

const dlContainer = document.getElementById('dl-container');
const variantSelector = document.getElementById('variant-selector');
const userDescription = document.getElementById('user-description');

const dev_recommender = document.getElementById('dev-recommender');
const sys_admin = document.getElementById('sys-admin');
const vm_cloud = document.getElementById('vm-cloud');
const java_dev = document.getElementById('java-dev');
const openjdk_dev = document.getElementById('openjdk-dev');
const app_writer = document.getElementById('app-writer');

var state = null;
// When index page loads, run:
/* eslint-disable no-unused-vars */
function onIndexLoad() {
  localStorage.removeItem('state');
  state = window.localStorage.getItem('state');

  if(variant || (state && state != 'developer')){
    dlContainer.style.display = 'inline';
  }
  saveRecommenderState();

  recommender.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG'){
      state = e.target.alt;
      resetRecommender();
      saveRecommenderState();
      window.localStorage.setItem('state',state);

    }
  });

  dev_recommender.addEventListener('click',function(e){
    if(e.target.tagName === 'IMG'){
      state = e.target.alt;

      resetDevRecommender();
      saveRecommenderState();
      showDlContainer();

      window.localStorage.setItem('state',state);
      dlContainer.style.display = 'inline';


    }
  });
  setDownloadSection(); // on page load, populate the central download section.
}
/* eslint-enable no-unused-vars */

// INDEX PAGE FUNCTIONS

function setDownloadSection() {
  loadPlatformsThenData(function() {

    var repoName = (variant + '-releases');

    loadJSON(repoName, 'latest_release', function(response) {
      var releasesJson = JSON.parse(response);

      if (typeof releasesJson !== 'undefined') { // if there are releases...
        buildHomepageHTML(releasesJson);
      }
      else {
        // report an error
        errorContainer.innerHTML = '<p>Error... no releases have been found!</p>';
        loading.innerHTML = ''; // remove the loading dots
      }
    });
  });

}

function buildHomepageHTML(releasesJson) {
  // set the download button's version number to the latest build
  dlVersionText.innerHTML = releasesJson.tag_name;

  // create an array of the details for each binary that is attached to a release
  var assetArray = [];
  // create a new array that contains each 'asset' (binary) from the latest build:
  releasesJson.assets.forEach(function(each) {
    assetArray.push(each);
  });

  var OS = detectOS(); // set a variable as an object containing all information about the user's OS (from the global.js 'platforms' array)
  var matchingFile = null;

  // if the OS has been detected...
  if(OS) {
    assetArray.forEach(function(eachAsset) {  // iterate through the assets attached to this release
      var nameOfFile = eachAsset.name;
      var uppercaseFilename = nameOfFile.toUpperCase();
      var thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. X64_MAC or X64_LINUX.
      var uppercaseOSname = null;
      // firstly, check if a valid searchableName has been returned (i.e. the platform is recognised)...
      if(thisPlatform) {

        // secondly, check if the file has the expected file extension for that platform...
        // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
        var thisBinaryExtension = getBinaryExt(thisPlatform); // get the binary extension associated with this platform
        var thisInstallerExtension = getInstallerExt(thisPlatform); // get the installer extension associated with this platform
        if(matchingFile == null){
          if(uppercaseFilename.indexOf(thisInstallerExtension.toUpperCase()) >= 0) {
             uppercaseOSname = OS.searchableName.toUpperCase();

            // thirdly, check if the user's OS searchableName string matches part of this binary's name (e.g. ...X64_LINUX...)
            if(uppercaseFilename.indexOf(uppercaseOSname) >= 0) {
              matchingFile = eachAsset; // set the matchingFile variable to the object containing this binary
            }
          }
          else if(uppercaseFilename.indexOf(thisBinaryExtension.toUpperCase()) >= 0) {
             uppercaseOSname = OS.searchableName.toUpperCase();

            // thirdly, check if the user's OS searchableName string matches part of this binary's name (e.g. ...X64_LINUX...)
            if(uppercaseFilename.indexOf(uppercaseOSname) >= 0) {
              matchingFile = eachAsset; // set the matchingFile variable to the object containing this binary
            }
          }
        }
      }
    });
  }

  // if there IS a matching binary for the user's OS...
  if(matchingFile) {
    dlLatest.href = matchingFile.browser_download_url; // set the main download button's link to be the binary's download url
    dlText.innerHTML = ('Download for <var platform-name>' + OS.officialName + '</var>'); // set the text to be OS-specific, using the full OS name.
    var thisBinarySize = Math.floor((matchingFile.size)/1024/1024);
    dlVersionText.innerHTML += (' - ' + thisBinarySize + ' MB');
    if(matchingFile.jck === true) {
      document.getElementById('jck-approved-tick').classList.remove('hide');
      setTickLink();
    }
  }
  // if there is NOT a matching binary for the user's OS...
  else {
    dlOther.classList.add('hide'); // hide the 'Other platforms' button
    dlIcon.classList.add('hide'); // hide the download icon on the main button, to make it look less like you're going to get a download immediately
    dlIcon2.classList.remove('hide'); // un-hide an arrow-right icon to show instead
    dlText.innerHTML = ('Downloads'); // change the text to be generic: 'Downloads'.
    dlLatest.href = './releases.html?variant=' + variant; // set the main download button's link to the latest builds page for all platforms.
  }

  // remove the loading dots, and make all buttons visible, with animated fade-in
  loading.classList.add('hide');
  dlLatest.className = dlLatest.className.replace( /(?:^|\s)invisible(?!\S)/g , ' animated ' );
  dlOther.className = dlOther.className.replace( /(?:^|\s)invisible(?!\S)/g , ' animated ' );
  dlArchive.className = dlArchive.className.replace( /(?:^|\s)invisible(?!\S)/g , ' animated ' );

  dlLatest.onclick = function() {
    document.getElementById('installation-link').className += ' animated pulse infinite transition-bright';
  };

  // animate the main download button shortly after the initial animation has finished.
  setTimeout(function(){
    dlLatest.className = 'dl-button a-button animated pulse';
  }, 1000);


}

function saveRecommenderState(){
  switch (state) {
    case 'user':
      user.classList.remove('setOpacity');
      dlContainer.style.display = 'inline';
      userDescription.innerHTML = 'I do not care about the Java Version, I just want to be able to run my applications.';
      showDlContainer();
      break;

    case 'developer':
      developer.classList.remove('setOpacity');
      dev_recommender.style.display = 'inline';
      userDescription.innerHTML = '';
      break;

    case 'power user':
      powerUser.classList.remove('setOpacity');
      dlContainer.style.display = 'inline';
      userDescription.innerHTML = 'I know what I want , take me straight to the Archives.';
      opacityEffectRecommender(state);
      hideDlContainer();
      break;

    case 'System admin':
      resetDevRecommender();
      sys_admin.classList.remove('setOpacity');
      break;
    case 'VM on the Cloud':
      resetDevRecommender();
      vm_cloud.classList.remove('setOpacity');
      break;
    case 'Java developer':
      resetDevRecommender();
      java_dev.classList.remove('setOpacity');
      break;
    case 'OpenJDK developer':
      resetDevRecommender();
      openjdk_dev.classList.remove('setOpacity');
      break;
    default:
  }
}
function resetRecommender(){
  dev_recommender.style.display = 'inline';
  dev_recommender.style.display = 'none';
  dlContainer.style.display = 'none';
  user.classList.add('setOpacity');
  developer.classList.add('setOpacity');
  powerUser.classList.add('setOpacity');
}

function resetDevRecommender(){
  dev_recommender.style.display = 'inline';
  userDescription.innerHTML = '';
  developer.classList.remove('setOpacity');
  sys_admin.classList.add('setOpacity');
  vm_cloud.classList.add('setOpacity');
  java_dev.classList.add('setOpacity');
  openjdk_dev.classList.add('setOpacity');
}


function showDlContainer(){
  variantSelector.style.display = 'block';
  dlLatest.style.display = 'inline-block';
  dlText.style.display = 'block';
  dlOther.style.display = 'block';
}

function hideDlContainer(){
  dlLatest.style.display = 'none';
  dlText.style.display = 'none';
  dlOther.style.display = 'none';
}
