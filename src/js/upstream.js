const {findPlatform, getBinaryExt, getSupportedVersion, getOfficialName, getPlatformOrder,
    detectLTS, setUrlQuery, loadAssetInfo, orderPlatforms, setRadioSelectors, setTickLink} = require('./common');
const {variant} = require('./common');

// Hard coded as Red Hat only ship hotspot
const jvmVariant = 'hotspot'

const loading = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');

const gaSelector = document.getElementById('ga-selector');
const gaButtons = document.getElementsByName('ga');

const urlParams = new URLSearchParams(window.location.search);
const ga = urlParams.get('ga') || 'ga';

gaSelector.onchange = () => {
    const gaButton = Array.from(gaButtons).find((button) => button.checked);
    setUrlQuery({
      variant,
      ga: gaButton.value
    });
};

for (let button of gaButtons) {
    if (button.value === ga) {
        button.setAttribute('checked', 'checked');
        break;
    }
  }

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

  loadAssetInfo(variant, jvmVariant, ga, undefined, 'openjdk', buildUpstreamHTML, () => {
    // if there are no releases (beyond the latest one)...
    // report an error, remove the loading dots
    loading.innerHTML = '';
    errorContainer.innerHTML = `<p>There are no archived releases yet for ${variant} on the ${jvmVariant} JVM.
      See the <a href='./releases.html?variant=${variant}&jvmVariant=${jvmVariant}'>Latest release</a> page.</p>`;
  });

    const buttons = document.getElementsByClassName('btn-label');
    for (var a = 0; a < buttons.length; a++) {
      if (buttons[a].firstChild.getAttribute('lts') !== 'true') {
        buttons[a].style.display = 'none';
      }
    }
}

function buildUpstreamHTML(releasesJson) {

  // Array of releases that have binaries we want to display
  let releases = [];

  releasesJson[0].binaries.forEach((releaseAsset) => {

    const platform = findPlatform(releaseAsset);

    // Skip this asset if its platform could not be matched (see the website's 'config.json')
    if (!platform) {
      return;
    }

    // Skip this asset if it's not a binary type we're interested in displaying
    const binary_type = releaseAsset.image_type.toUpperCase();
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
        release_name: releasesJson[0].version_data.openjdk_version,
        release_link: releaseAsset.release_link,
        release_datetime: moment(releaseAsset.timestamp).format('YYYY-MM-DD hh:mm:ss'),
        source: releasesJson[0].source.link,
        binaries: []
      };
    }

    let binary_constructor = {
      type: binary_type,
      extension: getBinaryExt(platform),
      link: releaseAsset.package.link,
      signature_link: releaseAsset.package.signature_link,
      size: Math.floor(releaseAsset.package.size / 1000 / 1000)
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
