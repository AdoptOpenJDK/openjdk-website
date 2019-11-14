const {findPlatform, getBinaryExt, getInstallerExt, getSupportedVersion, getOfficialName, getPlatformOrder,
    getVariantObject, detectLTS, loadLatestAssets, orderPlatforms, setRadioSelectors, setTickLink} = require('./common');
const {jvmVariant, variant} = require('./common');

const loading = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');

// When releases page loads, run:
module.exports.load = () => {

  Handlebars.registerHelper('fetchOS', function(title) {
    if (title.split(' ')[2]) {
      // This is so that XL binaries have Large Heap in the name still
      return title.replace(title.split(' ')[1], '');
    } else {
      return title.split(' ')[0];
    }
  });

  Handlebars.registerHelper('fetchArch', function(title) {
    return title.split(' ')[1]
  });

  Handlebars.registerHelper('fetchInstallerExt', function(filename) {
    return `.${filename.split('.').pop()}`;
  });

  const LTS = detectLTS(`${variant}-${jvmVariant}`);

  const styles = `
  .download-last-version:after {
      content: "${LTS}";
  }
  `
  if (LTS !== null) {
    const styleSheet = document.createElement('style')
    styleSheet.type = 'text/css'
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)
  }

  setRadioSelectors();

  loadLatestAssets(variant, jvmVariant, 'latest', undefined, buildLatestHTML, () => {
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
    const platform = findPlatform(releaseAsset.binary);

    // Skip this asset if its platform could not be matched (see the website's 'config.json')
    if (!platform) {
      return;
    }

    // Skip this asset if it's not a binary type we're interested in displaying
    const binary_type = releaseAsset.binary.image_type.toUpperCase();
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
        platform_supported_version: getSupportedVersion(platform),
        release_name: releaseAsset.release_name,
        release_link: releaseAsset.release_link,
        release_datetime: moment(releaseAsset.timestamp).format('YYYY-MM-DD hh:mm:ss'),

        binaries: []
      };
    }

    let binary_constructor = {
      type: binary_type,
      extension: getBinaryExt(platform),
      link: releaseAsset.binary.package.link,
      checksum: releaseAsset.binary.package.checksum,
      size: Math.floor(releaseAsset.binary.package.size / 1000 / 1000)
    }

    if (releaseAsset.binary.installer) {
      binary_constructor.installer_link = releaseAsset.binary.installer.link
      binary_constructor.installer_checksum = releaseAsset.binary.installer.checksum
      binary_constructor.installer_extension = getInstallerExt(platform)
      binary_constructor.installer_size =  Math.floor(releaseAsset.binary.installer.size / 1000 / 1000)
    }

    // Add the new binary to the release asset
    release.binaries.push(binary_constructor);


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
  document.getElementById('latest-selector').innerHTML = templateSelector({releases});

  setTickLink();

  global.populateFilters('all');

  loading.innerHTML = ''; // remove the loading dots

  const latestContainer = document.getElementById('latest-container');
  latestContainer.className = latestContainer.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated fadeIn '); // make this section visible (invisible by default), with animated fade-in
}

global.filterOS = () => {
  let os = document.getElementById('os-filter');
  let arch = document.getElementById('arch-filter');
  if (arch.options[arch.selectedIndex].value === 'Any') {
    filterTable(os.options[os.selectedIndex].value, 'os')
    global.populateFilters('arch')
  } else if (os.options[os.selectedIndex].value == 'Any') {
    global.filterArch()
  } else {
    filterTable(os.options[os.selectedIndex].value, 'multi', arch.options[arch.selectedIndex].value)
  }
}

global.filterArch = () => {
  let arch = document.getElementById('arch-filter');
  let os = document.getElementById('os-filter');
  if (os.options[os.selectedIndex].value === 'Any') {
    filterTable(arch.options[arch.selectedIndex].value, 'arch')
    global.populateFilters('all')
  } else if (arch.options[arch.selectedIndex].value == 'Any') {
    global.filterOS()
  } else {
    filterTable(arch.options[arch.selectedIndex].value, 'multi', os.options[os.selectedIndex].value)
  }
}

global.populateFilters = (filter) => {
  let releaseTable = document.getElementById('latest-selector').getElementsByClassName('releases-table');
  let OSES = ['Any'];
  let ARCHES = ['Any'];
  for (let release of releaseTable) {
    if (release.style.display !== 'none') {
      OSES.push(release.querySelector('.os').innerHTML.split(' ')[0])
      ARCHES.push(release.querySelector('.arch').innerHTML)
    }
  }

  if (filter == 'all' || filter == 'os') {
    let osFilter = document.getElementById('os-filter');
    let selected = osFilter.options[osFilter.selectedIndex].value
    osFilter.innerHTML = '';

    for (let os of new Set(OSES)) {
      let option = document.createElement('option');
      option.text = os;
      option.value = os;
      osFilter.append(option);
    }
    osFilter.value=selected;
  }

  if (filter == 'all' || filter == 'arch') {
    let archFilter = document.getElementById('arch-filter');
    let selected = archFilter.options[archFilter.selectedIndex].value
    archFilter.innerHTML = '';

    for (let arch of new Set(ARCHES)) {
      let option = document.createElement('option');
      option.text = arch;
      option.value = arch;
      archFilter.append(option)
    }
    archFilter.value=selected;
  }
}

function filterTable(string, type, string1) {
  let tables = document.getElementById('latest-selector').getElementsByClassName('releases-table')
  for (let table of tables) {
    if (type === 'multi') {
      let os = table.querySelector('.os').innerHTML;
      let arch = table.querySelector('.arch').innerHTML;
      if (os.startsWith(string) || arch === string) {
        if (os.startsWith(string1) || arch === string1) {
          table.style.display = '';
        } else {
          table.style.display = 'none';
        }
      } else {
        table.style.display = 'none';
      }
    }

    if (type === 'os') {
      if (string === 'Any') {
        table.style.display = '';
      } else {
        let os = table.querySelector('.os').innerHTML;
        if (os.startsWith(string)) {
          table.style.display = '';
        } else {
          table.style.display = 'none';
        }
      }
    }

    if (type === 'arch') {
      if (string == 'Any') {
        table.style.display = '';
      } else {
        let arch = table.querySelector('.arch').innerHTML;
        if (arch === string) {
          table.style.display = '';
        } else {
          table.style.display = 'none';
        }
      }
    }
  }
}
