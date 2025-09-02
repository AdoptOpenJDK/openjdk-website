import { detectOS, loadLatestAssets, setRadioSelectors, variant as commonVariant, jvmVariant as commonJvmVariant } from './common';

// set variables for all index page HTML elements that will be used by the JS
const loading = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const dlText = document.getElementById('dl-text');
const dlLatest = document.getElementById('dl-latest');
const dlLatestText = document.getElementById('dl-latest-text');
const dlArchive = document.getElementById('dl-archive');
const dlOther = document.getElementById('dl-other');
const dlVersionText = document.getElementById('dl-version-text');

export function load() {
  setRadioSelectors();
  removeRadioButtons();

  // Try to match up the detected OS with a platform from 'config.json'
  const OS = detectOS();

  if (OS) {
    dlText.innerHTML = `Download for <var platform-name>${OS.officialName}</var>`;
  }
  dlText.classList.remove('invisible');

  const handleResponse = (releases) => { // Modified to accept releases
    buildHomepageHTML(releases); // Pass releases to buildHomepageHTML
  };

  loadLatestAssets(commonVariant, commonJvmVariant, 'latest', handleResponse, () => {
    errorContainer.innerHTML = `<p>There are no releases available for this variant on the JVM.
      Please check our <a href='nightly.html' target='blank'>Nightly Builds</a>.</p>`;
    loading.innerHTML = ''; // remove the loading dots
  });
}

function removeRadioButtons() {
  const buttons = document.getElementsByClassName('btn-label');
  for (let button of buttons) {
    if (button.firstChild.getAttribute('lts') === 'false') {
      button.style.display = 'none';
    }
  }
}

function buildHomepageHTML(releases) { // Modified to accept releases
  // Use the actual version from the release data if available
  // Assuming 'releases' is an array and we take the first one,
  // and it has a version property like 'version_data.semver' or similar.
  // This part needs to be adjusted based on the actual structure of 'releases'
  let version = commonVariant.replace(/\D/g, ''); // Fallback to URL variant
  if (releases && releases.length > 0 && releases[0].version_data && releases[0].version_data.major) {
    version = releases[0].version_data.major;
  }
  
  dlLatest.href = `https://adoptium.net/temurin/releases?version=${version}`;
  dlLatestText.textContent = 'adoptium.net';
  dlVersionText.innerHTML = 'AdoptOpenJDK has moved...';

  // remove the loading dots, and make all buttons visible, with animated fade-in
  loading.classList.add('hide');
  dlLatest.className = dlLatest.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');
  dlOther.className = dlOther.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');
  dlArchive.className = dlArchive.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');

  dlLatest.onclick = () => {
    document.getElementById('installation-link').className += ' animated pulse infinite transition-bright';
  };

  // animate the main download button shortly after the initial animation has finished.
  setTimeout(() => {
    dlLatest.className = 'dl-button a-button animated pulse';
  }, 1000);
}
