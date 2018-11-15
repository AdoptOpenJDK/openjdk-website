const {findPlatform, getBinaryExt, getInstallerExt, getLogo, getOfficialName, getPlatformOrder,
    getVariantObject, loadLatestAssets, loadPlatformsThenData, orderPlatforms, setTickLink} = require('./common');
const {jvmVariant, variant} = require('./common');

// When releases page loads, run:
/* eslint-disable no-unused-vars */
module.exports.onLatestLoad = () => {
  /* eslint-enable no-unused-vars */
  populateLatest(); // populate the Latest page
}

// LATEST PAGE FUNCTIONS
/* eslint-disable no-undef */
function populateLatest() {
  loadPlatformsThenData(function () {

    var handleResponse = function (response) {
      // create an array of the details for each asset that is attached to a release
      if (response.length === 0) {
        return;
      }

      buildLatestHTML(response, {});
    };

    loadLatestAssets(variant, jvmVariant, 'releases', 'latest', undefined, handleResponse, function () {
      errorContainer.innerHTML = '<p>There are no releases available for ' + variant + ' on the ' + jvmVariant + ' jvm. Please check our <a href=nightly.html?variant=' + variant + '&jvmVariant=' + jvmVariant + ' target=\'blank\'>Nightly Builds</a>.</p>';
      loading.innerHTML = ''; // remove the loading dots
    });
  });
}

function buildLatestHTML(releasesJson) {
  // Populate with description
  var variantObject = getVariantObject(variant + '-' + jvmVariant);
  if (variantObject.descriptionLink) {
    document.getElementById('description_header').innerHTML = 'What is ' + variantObject.description + '?';
    document.getElementById('description_link').innerHTML = 'Find out here';
    document.getElementById('description_link').href = variantObject.descriptionLink;
  }

  // Array of releases that have binaries we want to display
  var releases = [];

  releasesJson.forEach((releaseAsset) => {
    const platform = findPlatform(releaseAsset);

    // Skip this asset if its platform could not be matched (see the website's 'config.json')
    if (!platform) {
      return;
    }

    // Skip this asset if it's not a binary type we're interested in displaying
    const binary_type = releaseAsset.binary_type.toUpperCase();
    if (['INSTALLER', 'JDK', 'JRE'].indexOf(binary_type) === -1) {
      return;
    }

    // Get the existing release asset (passed to the template) or define a new one
    var release = releases.find((release) => release.platform_name === platform);
    if (!release) {
      release = {
        platform_name: platform,
        platform_official_name: getOfficialName(platform),
        platform_ordinal: getPlatformOrder(platform),
        platform_logo: getLogo(platform),

        release_name: releaseAsset.release_name,
        release_link: releaseAsset.release_link,
        release_datetime: moment(releaseAsset.timestamp).format('YYYY-MM-DD hh:mm:ss'),

        binaries: []
      };
    }

    // Add the new binary to the release asset
    release.binaries.push({
      type: binary_type,
      extension: 'INSTALLER' === binary_type ? getInstallerExt(platform) : getBinaryExt(platform),
      link: releaseAsset.binary_link,
      checksum_link: releaseAsset.checksum_link,
      size: Math.floor(releaseAsset.binary_size / 1024 / 1024)
    });

    // We have the first binary, so add the release asset.
    if (release.binaries.length === 1) {
      releases.push(release);
    }
  });

  releases = orderPlatforms(releases, 'platform_ordinal');
  releases.forEach((release) => {
    release.binaries.sort((binaryA, binaryB) => binaryA.type > binaryB.type ? 1 : binaryA.type < binaryB.type ? -1 : 0);
  });

  const templateSelector = Handlebars.compile(document.getElementById('template-selector').innerHTML);
  const templateInfo = Handlebars.compile(document.getElementById('template-info').innerHTML);
  document.getElementById('latest-selector').innerHTML = templateSelector({releases});
  document.getElementById('latest-info').innerHTML = templateInfo({releases});

  setTickLink();

  displayLatestPlatform();
  window.onhashchange = displayLatestPlatform;

  loading.innerHTML = ''; // remove the loading dots

  const latestContainer = document.getElementById('latest-container');
  latestContainer.className = latestContainer.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated fadeIn '); // make this section visible (invisible by default), with animated fade-in
}

function displayLatestPlatform() {
  var platformHash = window.location.hash.substr(1).toUpperCase();
  var thisPlatformInfo = document.getElementById('latest-info-' + platformHash);
  if (thisPlatformInfo) {
    unselectLatestPlatform('keep the hash');
    document.getElementById('latest-selector').classList.add('hide');
    thisPlatformInfo.classList.remove('hide');
  }
}

/* eslint-disable no-unused-vars */
global.selectLatestPlatform = (thisPlatform) => {
  /* eslint-enable no-unused-vars */
  window.location.hash = thisPlatform.toLowerCase();
}

global.unselectLatestPlatform = (keephash) => {
  if (!keephash) {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }
  var platformButtons = document.getElementById('latest-selector').getElementsByClassName('latest-asset');
  var platformInfoBoxes = document.getElementById('latest-info').getElementsByClassName('latest-info-container');

  for (let i = 0; i < platformButtons.length; i++) {
    platformInfoBoxes[i].classList.add('hide');
  }

  document.getElementById('latest-selector').classList.remove('hide');
}
