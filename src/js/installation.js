const {detectOS, findPlatform, getBinaryExt, getChecksumCommand, getInstallCommand, getOfficialName,
  getPathCommand, getPlatformOrder, loadAssetInfo, orderPlatforms, setRadioSelectors, getChecksumAutoCommandHint,
  getChecksumAutoCommand } = require('./common');
const {jvmVariant, variant} = require('./common');

const loading = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const platformSelector = document.getElementById('platform-selector');

module.exports.load = () => {
  setRadioSelectors();

  loadAssetInfo(variant, jvmVariant, 'releases', 'latest', 'adoptopenjdk', buildInstallationHTML, () => {
    errorContainer.innerHTML = '<p>Error... no installation information has been found!</p>';
    loading.innerHTML = ''; // remove the loading dots
  });
};

function buildInstallationHTML(releasesJson) {
  // create an array of the details for each asset that is attached to a release
  const assetArray = releasesJson[0].binaries;

  const ASSETARRAY = [];

  // for each asset attached to this release, check if it's a valid binary, then add a download block for it...
  assetArray.forEach((eachAsset) => {
    const ASSETOBJECT = {};
    const uppercaseFilename = eachAsset.package.name.toUpperCase();
    ASSETOBJECT.thisPlatform = findPlatform(eachAsset);

    // check if the platform name is recognised...
    if (ASSETOBJECT.thisPlatform) {
      ASSETOBJECT.thisPlatformOrder = getPlatformOrder(ASSETOBJECT.thisPlatform);
      ASSETOBJECT.thisOfficialName = getOfficialName(ASSETOBJECT.thisPlatform) + ' ' + eachAsset.image_type;
      ASSETOBJECT.thisPlatformType = (ASSETOBJECT.thisPlatform + '-' + eachAsset.image_type).toUpperCase();

      // if the filename contains both the platform name and the matching BINARY extension, add the relevant info to the asset object
      ASSETOBJECT.thisBinaryExtension = getBinaryExt(ASSETOBJECT.thisPlatform);
      if (uppercaseFilename.includes(ASSETOBJECT.thisBinaryExtension.toUpperCase())) {
        ASSETOBJECT.thisPlatformExists = true;
        ASSETOBJECT.thisBinaryLink = eachAsset.package.link;
        ASSETOBJECT.thisBinaryFilename = eachAsset.package.name;
        ASSETOBJECT.thisChecksum = eachAsset.package.checksum;
        ASSETOBJECT.thisChecksumLink = eachAsset.package.checksum_link;
        ASSETOBJECT.thisChecksumFilename = eachAsset.package.name.replace(ASSETOBJECT.thisBinaryExtension, '.sha256.txt');
        ASSETOBJECT.thisUnzipCommand = getInstallCommand(ASSETOBJECT.thisPlatform).replace('FILENAME', ASSETOBJECT.thisBinaryFilename);
        ASSETOBJECT.thisChecksumCommand = getChecksumCommand(ASSETOBJECT.thisPlatform).replace('FILENAME', ASSETOBJECT.thisBinaryFilename);

        // the check sum auto command hint is always printed,
        // so we just configure with empty string if not present
        ASSETOBJECT.thisChecksumAutoCommandHint = getChecksumAutoCommandHint(ASSETOBJECT.thisPlatform) || '';
        // build download sha256 and verify auto command
        const thisChecksumAutoCommand = getChecksumAutoCommand(ASSETOBJECT.thisPlatform);
        let sha256FileName = ASSETOBJECT.thisChecksumLink;
        const separator = sha256FileName.lastIndexOf('/');
        if (separator > -1) {
          sha256FileName = sha256FileName.substring(separator + 1);
        }
        ASSETOBJECT.thisChecksumAutoCommand = thisChecksumAutoCommand.replace(
          /FILEHASHURL/g,
          ASSETOBJECT.thisChecksumLink
        ).replace(
          /FILEHASHNAME/g,
          sha256FileName
        ).replace(
          /FILENAME/g,
          ASSETOBJECT.thisBinaryFilename
        );

        const dirName = releasesJson[0].release_name + (eachAsset.image_type === 'jre' ? '-jre' : '');
        ASSETOBJECT.thisPathCommand = getPathCommand(ASSETOBJECT.thisPlatform).replace('DIRNAME', dirName);
      }

      if (ASSETOBJECT.thisPlatformExists) {
        ASSETARRAY.push(ASSETOBJECT);
      }


    }
  });

  const template = Handlebars.compile(document.getElementById('template').innerHTML);
  document.getElementById('installation-template').innerHTML = template({htmlTemplate: orderPlatforms(ASSETARRAY)});

  /*global hljs*/
  hljs.initHighlightingOnLoad();

  setInstallationPlatformSelector(ASSETARRAY);
  attachCopyButtonListeners();
  window.onhashchange = displayInstallPlatform;

  loading.innerHTML = ''; // remove the loading dots

  const installationContainer = document.getElementById('installation-container');
  installationContainer.className = installationContainer.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
}

function attachCopyButtonListeners() {
  document.querySelectorAll('.copy-code-block').forEach(codeBlock => {
    const target = codeBlock.querySelector('code.cmd-block');
    codeBlock.querySelector('.copy-code-button')
      .addEventListener('click', () => copyElementTextContent(target));
  });
}

function displayInstallPlatform() {
  const platformHash = window.location.hash.substr(1).toUpperCase();
  const thisPlatformInstallation = document.getElementById(`installation-container-${platformHash}`);
  unselectInstallPlatform();

  if (thisPlatformInstallation) {
    platformSelector.value = platformHash;
    thisPlatformInstallation.classList.remove('hide');
  } else {
    const currentValues = [];

    Array.from(platformSelector.options).forEach((eachOption) => {
      currentValues.push(eachOption.value);
    });

    platformSelector.value = 'unknown';
  }
}

function unselectInstallPlatform() {
  const platformInstallationDivs = document.getElementById('installation-container')
    .getElementsByClassName('installation-single-platform');

  for (let i = 0; i < platformInstallationDivs.length; i++) {
    platformInstallationDivs[i].classList.add('hide');
  }
}

function setInstallationPlatformSelector(thisReleasePlatforms) {
  if (!platformSelector) {
    return;
  }

  if (platformSelector.options.length === 1) {
    thisReleasePlatforms.forEach((eachPlatform) => {
      const op = new Option();
      op.value = eachPlatform.thisPlatformType;
      op.text = eachPlatform.thisOfficialName;
      platformSelector.options.add(op);
    });
  }

  const OS = detectOS();

  if (OS && window.location.hash.length < 1) {
    platformSelector.value = OS.searchableName;
    window.location.hash = platformSelector.value.toLowerCase();
  }

  displayInstallPlatform();

  platformSelector.onchange = () => {
    window.location.hash = platformSelector.value.toLowerCase();
    displayInstallPlatform();
  };
}

function copyElementTextContent(target) {
  const text = target.textContent;
  const input = document.createElement('input');
  input.value = text;

  document.body.appendChild(input);
  input.select();

  document.execCommand('copy');
  alert('Copied to clipboard');

  document.body.removeChild(input);
}
