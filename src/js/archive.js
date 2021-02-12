const {findPlatform, detectEA, getOfficialName, getPlatformOrder,
  loadAssetInfo, setRadioSelectors} = require('./common');
const {jvmVariant, variant} = require('./common');

const loading = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');

// When archive page loads, run:
module.exports.load = () => {
  setRadioSelectors();

  loadAssetInfo(variant, jvmVariant, 'ga', undefined, undefined, undefined, 'adoptopenjdk', buildArchiveHTML, () => {
    // if there are no releases (beyond the latest one)...
    // report an error, remove the loading dots
    loading.innerHTML = '';
    errorContainer.innerHTML = `<p>There are no archived releases yet for ${variant} on the ${jvmVariant} JVM.
      See the <a href='./releases.html?variant=${variant}&jvmVariant=${jvmVariant}'>Latest release</a> page.</p>`;
  });
}

function buildArchiveHTML(aReleases) {
  const releases = [];

  aReleases.forEach(aRelease => {
    const publishedAt = moment(aRelease.timestamp);

    const release = {
      release_name: aRelease.release_name,
      release_link: aRelease.release_link,
      dashboard_link: `https://dash.adoptopenjdk.net/version.html?version=${variant}`
        + `&tag=${encodeURIComponent(aRelease.release_name)}`,
      release_day: publishedAt.format('D'),
      release_month: publishedAt.format('MMMM'),
      release_year: publishedAt.format('YYYY'),
      early_access: detectEA(aRelease.version_data),
      platforms: {},
    };

    // populate 'platformTableRows' with one row per binary for this release...
    aRelease.binaries.forEach(aReleaseAsset => {
      const platform = findPlatform(aReleaseAsset);

      // Skip this asset if its platform could not be matched (see the website's 'config.json')
      if (!platform) {
        return;
      }

      // Skip this asset if it's not a binary type we're interested in displaying
      const binary_type = aReleaseAsset.image_type.toUpperCase();
      if (!['INSTALLER', 'JDK', 'JRE'].includes(binary_type)) {
        return;
      }

      if (!release.platforms[platform]) {
        release.platforms[platform] = {
          official_name: getOfficialName(platform),
          ordinal: getPlatformOrder(platform),
          assets: [],
        }
      }

      let binary_constructor = {
        type: binary_type,
        link: aReleaseAsset.package.link,
        checksum: aReleaseAsset.package.checksum,
        size: Math.floor(aReleaseAsset.package.size / 1000 / 1000),
      }

      if (aReleaseAsset.installer) {
        binary_constructor.installer_link = aReleaseAsset.installer.link
        binary_constructor.installer_checksum = aReleaseAsset.installer.checksum
        binary_constructor.installer_size =  Math.floor(aReleaseAsset.installer.size / 1000 / 1000)
      }

      // Add the new binary to the release asset
      release.platforms[platform].assets.push(binary_constructor);
    });
    releases.push(release);
  });

  const template = Handlebars.compile(document.getElementById('template').innerHTML);
  document.getElementById('archive-table-body').innerHTML = template({releases});

  setPagination();

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
