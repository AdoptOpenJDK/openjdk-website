const {findPlatform, getOfficialName, loadAssetInfo, setRadioSelectors} = require('./common');
const {jvmVariant, variant} = require('./common');

const loading = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const tableHead = document.getElementById('table-head');
const nightlyList = document.getElementById('nightly-table');
const numberpicker = document.getElementById('numberpicker');
const datepicker = document.getElementById('datepicker');
const templateString = $('#template').html();

// When nightly page loads, run:
module.exports.load = () => {

  Handlebars.registerHelper('fetchExtension', function(filename) {
    let extension = `.${filename.split('.').pop()}`
    // Workaround to prevent extension returning as .gz
    if (extension == '.gz') {
      extension = '.tar.gz'
    }
    return extension
  });

  setRadioSelectors();
  setDatePicker();
  populateNightly(); // run the function to populate the table on the Nightly page.

  numberpicker.onchange = datepicker.onchange = () => { populateNightly() };
}

function setDatePicker() {
  $(datepicker).datepicker();
  datepicker.value = moment().format('YYYY-MM-DD');
}

function populateNightly() {
  const handleResponse = (response) => {
    // if there are releases...
    if (typeof response[0] !== 'undefined') {
      const files = getFiles(response);

      if (files.length === 0) {
        return;
      }

      buildNightlyHTML(files);
    }
  };

  loadAssetInfo(variant, jvmVariant, 'ea', numberpicker.value, moment(datepicker.value).format('YYYY-MM-DD'), undefined, 'adoptopenjdk', handleResponse, () => {
    errorContainer.innerHTML = '<p>Error... no releases have been found!</p>';
    loading.innerHTML = ''; // remove the loading dots
  });
}

function getFiles(nightlyJson) {
  const assets = [];

  nightlyJson.forEach((release) => {
    release.binaries.forEach((asset) => {
      if (/(?:\.tar\.gz|\.zip)$/.test(asset.package.name) && findPlatform(asset)) {
        assets.push({release, asset});
      }
    });
  });
  return assets;
}

function buildNightlyHTML(files) {
  tableHead.innerHTML = `<tr id='table-header'>
    <th>Platform</th>
    <th>Type</th>
    <th>Heap Size</th>
    <th>Date</th>
    <th>Binary</th>
    <th>Installer</th>
    <th>Checksum</th>
    </tr>`;

  const NIGHTLYARRAY = [];

  // for each release...
  files.forEach((file) => {  // for each file attached to this release...
    const eachAsset = file.asset;
    const eachRelease = file.release;

    const NIGHTLYOBJECT = {};
    const type = eachAsset.image_type

    NIGHTLYOBJECT.thisPlatform = findPlatform(eachAsset); // get the searchableName, e.g. MAC or X64_LINUX.

    // set values ready to be injected into the HTML
    const publishedAt = eachRelease.timestamp;
    NIGHTLYOBJECT.thisReleaseName = eachRelease.release_name.slice(0, 12);
    NIGHTLYOBJECT.thisType = type;
    NIGHTLYOBJECT.thisHeapSize = eachAsset.heap_size;
    NIGHTLYOBJECT.thisReleaseDay = moment(publishedAt).format('D');
    NIGHTLYOBJECT.thisReleaseMonth = moment(publishedAt).format('MMMM');
    NIGHTLYOBJECT.thisReleaseYear = moment(publishedAt).format('YYYY');
    NIGHTLYOBJECT.thisGitLink = eachRelease.release_link;
    NIGHTLYOBJECT.thisOfficialName = getOfficialName(NIGHTLYOBJECT.thisPlatform);
    NIGHTLYOBJECT.thisBinaryLink = eachAsset.package.link;
    NIGHTLYOBJECT.thisBinarySize = Math.floor(eachAsset.package.size / 1000 / 1000);
    NIGHTLYOBJECT.thisChecksum = eachAsset.package.checksum;
    if (eachAsset.installer) {
      NIGHTLYOBJECT.thisInstallerLink = eachAsset.installer.link;
    }
    NIGHTLYARRAY.push(NIGHTLYOBJECT);
  });

  const template = Handlebars.compile(templateString);
  nightlyList.innerHTML = template({htmlTemplate: NIGHTLYARRAY});

  setSearchLogic();

  loading.innerHTML = ''; // remove the loading dots

  // show the table, with animated fade-in
  nightlyList.className = nightlyList.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
  setTableRange();

  // if the table has a scroll bar, show text describing how to horizontally scroll
  const scrollText = document.getElementById('scroll-text');
  const tableDisplayWidth = document.getElementById('nightly-list').clientWidth;
  const tableScrollWidth = document.getElementById('nightly-list').scrollWidth;
  if (tableDisplayWidth != tableScrollWidth) {
    scrollText.className = scrollText.className.replace(/(?:^|\s)hide(?!\S)/g, '');
  }
}

function setTableRange() {
  const rows = $('#nightly-table tr');
  const selectedDate = moment(datepicker.value, 'MM-DD-YYYY').format();

  for (let i = 0; i < rows.length; i++) {
    const thisDate = rows[i].getElementsByClassName('nightly-release-date')[0].innerHTML;
    const thisDateMoment = moment(thisDate, 'D MMMM YYYY').format();
    const isAfter = moment(thisDateMoment).isAfter(selectedDate);

    if (isAfter) {
      rows[i].classList.add('hide');
    } else {
      rows[i].classList.remove('hide');
    }
  }
}

function setSearchLogic() {
  // logic for the realtime search box...
  var $rows = $('#nightly-table tr');
  $('#search').keyup(function() {
    const reg = RegExp('^(?=.*' + $.trim($(this).val()).split(/\s+/).join(')(?=.*') + ').*$', 'i');

    $rows.show().filter(function() {
      return !reg.test($(this).text().replace(/\s+/g, ' '));
    }).hide();

  });
}