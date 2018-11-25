const {findPlatform, getBinaryExt, getInstallerExt, getOfficialName, getPlatformOrder,
  loadAssetInfo, orderPlatforms, setRadioSelectors, setTickLink} = require('./common');
const {jvmVariant, variant} = require('./common');

const loading = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');

// When archive page loads, run:
module.exports.load = () => {
  setRadioSelectors();

  loadAssetInfo(variant, jvmVariant, 'releases', undefined, undefined, buildArchiveHTML, () => {
    // if there are no releases (beyond the latest one)...
    // report an error, remove the loading dots
    loading.innerHTML = '';
    errorContainer.innerHTML = `<p>There are no archived releases yet for ${variant} on the ${jvmVariant} JVM.
      See the <a href='./releases.html?variant=${variant}&jvmVariant=${jvmVariant}'>Latest release</a> page.</p>`;
  });
}

function buildArchiveHTML(releases, jckJSON = {}) {
  const RELEASEARRAY = [];

  for (let i = 0; i<releases.length; i++) {
    const ASSETARRAY = [];
    const RELEASEOBJECT = {};
    const eachRelease = releases[i];

    // set values for this release, ready to inject into HTML
    const publishedAt = moment(eachRelease.timestamp);
    RELEASEOBJECT.thisReleaseName = eachRelease.release_name;
    RELEASEOBJECT.thisReleaseDate = publishedAt.toDate();
    RELEASEOBJECT.thisReleaseDay = publishedAt.format('D');
    RELEASEOBJECT.thisReleaseMonth = publishedAt.format('MMMM');
    RELEASEOBJECT.thisReleaseYear = publishedAt.format('YYYY');
    RELEASEOBJECT.thisGitLink = eachRelease.release_link;
    RELEASEOBJECT.thisDashLink = `https://dash.adoptopenjdk.net/version.html?version=${variant.replace('open','')}`
      + `&tag=${encodeURIComponent(eachRelease.release_name)}`;

    // create an array of the details for each asset that is attached to this release
    const assetArray = eachRelease.binaries;

    // populate 'platformTableRows' with one row per binary for this release...
    assetArray.forEach((eachAsset) => {
      const ASSETOBJECT = {};
      const uppercaseFilename = eachAsset.binary_name.toUpperCase(); // make the name of the asset uppercase

      ASSETOBJECT.thisPlatform = findPlatform(eachAsset);

      // firstly, check if the platform name is recognised...
      if (ASSETOBJECT.thisPlatform) {
        // if the filename contains both the platform name and the matching INSTALLER extension, add the relevant info to the asset object
        ASSETOBJECT.thisInstallerExtension = getInstallerExt(ASSETOBJECT.thisPlatform);

        ASSETOBJECT.thisBinaryExtension = getBinaryExt(ASSETOBJECT.thisPlatform); // get the file extension associated with this platform

        if (uppercaseFilename.includes(ASSETOBJECT.thisInstallerExtension.toUpperCase())) {
          if (ASSETARRAY.length) {
            ASSETARRAY.forEach((asset) => {
              if (asset.thisPlatform === ASSETOBJECT.thisPlatform) {
                ASSETARRAY.pop();
              }
            });
          }
          ASSETOBJECT.thisPlatformExists = true;
          ASSETOBJECT.thisInstallerExists = true;
          RELEASEOBJECT.installersExist = true;
          ASSETOBJECT.thisInstallerLink = eachAsset.binary_link;
          ASSETOBJECT.thisInstallerSize = Math.floor((eachAsset.binary_size) / 1024 / 1024);
          ASSETOBJECT.thisOfficialName = getOfficialName(ASSETOBJECT.thisPlatform);
          ASSETOBJECT.thisBinaryExists = true;
          RELEASEOBJECT.binariesExist = true;
          ASSETOBJECT.thisBinaryLink = eachAsset.binary_link.replace(ASSETOBJECT.thisInstallerExtension, ASSETOBJECT.thisBinaryExtension);
          ASSETOBJECT.thisBinarySize = Math.floor((eachAsset.binary_size) / 1024 / 1024);
          ASSETOBJECT.thisChecksumLink = eachAsset.checksum_link;

          ASSETOBJECT.thisPlatformOrder = getPlatformOrder(ASSETOBJECT.thisPlatform);
          if (Object.keys(jckJSON).length === 0) {
            ASSETOBJECT.thisVerified = false;
          } else {
            if (jckJSON[eachRelease.release_name] && jckJSON[eachRelease.release_name].hasOwnProperty(ASSETOBJECT.thisPlatform)) {
              ASSETOBJECT.thisVerified = true;
            } else {
              ASSETOBJECT.thisVerified = false;
            }
            ASSETOBJECT.thisPlatformOrder = getPlatformOrder(ASSETOBJECT.thisPlatform);
          }
        }

        // secondly, check if the file has the expected file extension for that platform...
        // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)

        if (uppercaseFilename.includes(ASSETOBJECT.thisBinaryExtension.toUpperCase())) {
          let installerExist = false;
          if (ASSETARRAY.length) {
            ASSETARRAY.forEach((asset) => {
              if (asset.thisPlatform === ASSETOBJECT.thisPlatform) {
                installerExist = true;
              }
            });
          }

          if (!installerExist) {
            // set values ready to be injected into the HTML
            ASSETOBJECT.thisPlatformExists = true;
            ASSETOBJECT.thisBinaryExists = true;
            RELEASEOBJECT.binariesExist = true;
            ASSETOBJECT.thisOfficialName = getOfficialName(ASSETOBJECT.thisPlatform);
            ASSETOBJECT.thisBinaryLink = (eachAsset.binary_link);
            ASSETOBJECT.thisBinarySize = Math.floor((eachAsset.binary_size) / 1024 / 1024);
            ASSETOBJECT.thisChecksumLink = eachAsset.checksum_link;
            ASSETOBJECT.thisPlatformOrder = getPlatformOrder(ASSETOBJECT.thisPlatform);
            if (Object.keys(jckJSON).length === 0) {
              ASSETOBJECT.thisVerified = false;
            } else {
              if (jckJSON[eachRelease.release_name] && jckJSON[eachRelease.release_name].hasOwnProperty(ASSETOBJECT.thisPlatform)) {
                ASSETOBJECT.thisVerified = true;
              } else {
                ASSETOBJECT.thisVerified = false;
              }
            }
          }
        }

        if (ASSETOBJECT.thisPlatformExists) {
          ASSETARRAY.push(ASSETOBJECT);
        }
      }
    });

    RELEASEOBJECT.thisPlatformAssets = orderPlatforms(ASSETARRAY);
    RELEASEARRAY.push(RELEASEOBJECT);
  }

  // Sort releases by date/timestamp in descending order
  RELEASEARRAY.sort((a, b) => b.thisReleaseDate - a.thisReleaseDate);

  const template = Handlebars.compile(document.getElementById('template').innerHTML);
  document.getElementById('archive-table-body').innerHTML = template({htmlTemplate: RELEASEARRAY});

  setPagination();
  setTickLink();

  loading.innerHTML = ''; // remove the loading dots

  // show the archive list and filter box, with fade-in animation
  const archiveList = document.getElementById('archive-list');
  archiveList.className = archiveList.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated fadeIn ' );
}

function setPagination() {
  const container = document.getElementById('pagination-container');
  const archiveTableBody = document.getElementById('archive-table-body');

  $(container).pagination({
    dataSource: Array.from(archiveTableBody.getElementsByClassName('release-row')).map((row) => row.outerHTML),
    pageSize: 5,
    callback: (rows) => { archiveTableBody.innerHTML = rows.join('') }
  });

  if (container.getElementsByTagName('li').length <= 3) {
    container.classList.add('hide');
  }
}
