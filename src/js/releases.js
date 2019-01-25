const {
  findPlatform,
  getBinaryExt,
  getInstallerExt,
  getLogo,
  getOfficialName,
  getPlatformOrder,
  getVariantObject,
  loadLatestAssets,
  orderPlatforms,
  setRadioSelectors,
  setTickLink
} = require('./common');
const {
  jvmVariant,
  variant
} = require('./common');

const loading = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');

// When releases page loads, run:
module.exports.load = () => {
  setRadioSelectors();

  loadLatestAssets(variant, jvmVariant, 'releases', 'latest', undefined, buildLatestHTML, () => {
    errorContainer.innerHTML = `<p>There are no releases available for ${variant} on the ${jvmVariant} JVM.
      Please check our <a href='nightly.html?variant=${variant}&jvmVariant=${jvmVariant}' target='blank'>Nightly Builds</a>.</p>`;
    loading.innerHTML = ''; // remove the loading dots
  });
}

function buildLatestHTML(releasesJson) {
  // Populate with description
  const variantObject = getVariantObject(variant + '-' + jvmVariant);
  if (variantObject.descriptionLink) {
    document.getElementById('description_header').innerHTML = `What is ${variantObject.description}?`;
    document.getElementById('description_link').innerHTML = 'Find out here';
    document.getElementById('description_link').href = variantObject.descriptionLink;
  }

  // Array of releases that have binaries we want to display
  let releases = [];

  releasesJson.forEach((releaseAsset) => {
    const platform = findPlatform(releaseAsset);

    // Skip this asset if its platform could not be matched (see the website's 'config.json')
    if (!platform) {
      return;
    }

    // Skip this asset if it's not a binary type we're interested in displaying
    const binary_type = releaseAsset.binary_type.toUpperCase();
    if (!['INSTALLER', 'JDK', 'JRE'].includes(binary_type)) {
      return;
    }

    // Get the existing release asset (passed to the template) or define a new one
    let release = releases.find((release) => release.platform_name === platform);
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
      extension: getBinaryExt(platform),
      link: releaseAsset.binary_link,
      checksum_link: releaseAsset.checksum_link,
      installer_link: releaseAsset.installer_link || undefined,
      installer_extension: getInstallerExt(platform),
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
    for (var binary in release.binaries) {
      release.binaries[binary].colspan = 6 / release.binaries.length
    }
  });

  const templateTable = Handlebars.compile(document.getElementById('template-table').innerHTML);
  const templateTop3 = Handlebars.compile(document.getElementById('template-top3').innerHTML);
  const templateInfo = Handlebars.compile(document.getElementById('template-info').innerHTML);

  document.getElementById('download-matrix').innerHTML = templateTable({
    releases
  });
  document.getElementById('latest-info').innerHTML = templateInfo({
    releases
  });
  if (jvmVariant == 'hotspot') {
    document.getElementById('docker_link').href = 'https://hub.docker.com/r/adoptopenjdk/' + variant;
  } else {
    document.getElementById('docker_link').href = 'https://hub.docker.com/r/adoptopenjdk/' + variant + '-' + jvmVariant;
  }

  // Set the top 3 downloads above table
  const top3 = ['X64_MAC', 'X64_WIN', 'X64_LINUX'];
  let top3Releases = [];

  for (let variant of releases) {
    if (top3.includes(variant.platform_name)) {
      variant.link = variant.binaries[0].link;
      variant.extension = variant.binaries[0].extension;
      top3Releases.push(variant)
    }
  }

  document.getElementById('download-platform').innerHTML = templateTop3({
    top3Releases
  });

  // add svg logos
  document.getElementById('download-logo-X64_MAC').setAttribute('d', 'M39.054 34.065q-1.093 3.504-3.448 7.009-3.617 5.495-7.205 5.495-1.374 0-3.925-0.897-2.411-0.897-4.233-0.897-1.71 0-3.981 0.925-2.271 0.953-3.701 0.953-4.261 0-8.439-7.261-4.121-7.317-4.121-14.102 0-6.392 3.168-10.485 3.14-4.037 7.962-4.037 2.019 0 4.962 0.841 2.916 0.841 3.869 0.841 1.262 0 4.009-0.953 2.86-0.953 4.85-0.953 3.336 0 5.972 1.822 1.458 1.009 2.916 2.804-2.215 1.878-3.196 3.308-1.822 2.635-1.822 5.803 0 3.476 1.934 6.252t4.43 3.533zM28.512 1.179q0 1.71-0.813 3.813-0.841 2.103-2.607 3.869-1.514 1.514-3.028 2.019-1.037 0.308-2.916 0.477 0.084-4.177 2.187-7.205 2.075-3 7.009-4.149 0.028 0.084 0.070 0.308t0.070 0.308q0 0.112 0.014 0.28t0.014 0.28z');
  document.getElementById('download-logo-X64_WIN').setAttribute('d', 'M1.589 23.55l-0.017-15.31 18.839-2.558v17.868zM23.55 5.225l25.112-3.654v21.979h-25.112zM48.669 26.69l-0.006 21.979-25.112-3.533v-18.446zM20.41 44.736l-18.824-2.58-0.001-15.466h18.825z');
  document.getElementById('download-logo-X64_LINUX').setAttribute('d', 'M25.030 0.934l-24.871 10.716 24.895 10.632 25.152-10.656-25.176-10.691zM26.050 23.62v25.686l24.188-11.483v-24.478l-24.188 10.275zM0.001 37.824l24.27 11.483v-25.686l-24.27-10.275v24.478z');


  setTickLink();

  displayLatestPlatform();
  window.onhashchange = displayLatestPlatform;

  loading.innerHTML = ''; // remove the loading dots

  const latestContainer = document.getElementById('latest-container');
  latestContainer.className = latestContainer.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated fadeIn '); // make this section visible (invisible by default), with animated fade-in
}

function displayLatestPlatform() {
  const platformHash = window.location.hash.substr(1).toUpperCase();
  const thisPlatformInfo = document.getElementById(`latest-info-${platformHash}`);

  if (thisPlatformInfo) {
    global.unselectLatestPlatform('keep the hash');
    document.getElementById('download-matrix').classList.add('hide');
    thisPlatformInfo.classList.remove('hide');
  }
}

global.selectLatestPlatform = (thisPlatform) => {
  window.location.hash = thisPlatform.toLowerCase();
}

global.unselectLatestPlatform = (keephash) => {
  if (!keephash) {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }

  const platformButtons = document.getElementById('download-matrix').getElementsByClassName('latest-asset');
  const platformInfoBoxes = document.getElementById('latest-info').getElementsByClassName('latest-info-container');

  for (let i = 0; i < platformButtons.length; i++) {
    platformInfoBoxes[i].classList.add('hide');
  }

  document.getElementById('download-matrix').classList.remove('hide');
}
