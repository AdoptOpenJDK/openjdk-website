import { detectLTS, detectEA, findPlatform, getOfficialName, getPlatformOrder, loadAssetInfo, setRadioSelectors, setTickLink, variant as commonVariant, jvmVariant as commonJvmVariant } from './common';
import moment from 'moment';
import Handlebars from 'handlebars';
import $ from 'jquery';

const loading = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');

export function load() {
  setRadioSelectors();
  setTickLink();

  loadAssetInfo(commonVariant, commonJvmVariant, 'ga', undefined, undefined, undefined, 'adoptopenjdk', buildReleasesHTML, () => {
    loading.innerHTML = '';
    if (errorContainer) {
      errorContainer.innerHTML = ''; // Clear existing content

      const pElement = document.createElement('p');
      pElement.appendChild(document.createTextNode('There are no releases yet for '));

      const variantSpan = document.createElement('span');
      variantSpan.textContent = commonVariant;
      pElement.appendChild(variantSpan);

      pElement.appendChild(document.createTextNode(' on the '));

      const jvmVariantSpan = document.createElement('span');
      jvmVariantSpan.textContent = commonJvmVariant;
      pElement.appendChild(jvmVariantSpan);

      pElement.appendChild(document.createTextNode(' JVM. See the '));

      const linkElement = document.createElement('a');
      linkElement.href = `./nightly.html?variant=${encodeURIComponent(commonVariant)}&jvmVariant=${encodeURIComponent(commonJvmVariant)}`;
      linkElement.textContent = 'Nightly builds';
      pElement.appendChild(linkElement);

      pElement.appendChild(document.createTextNode(' page.'));
      errorContainer.appendChild(pElement);
    }
  });
}

export function buildReleasesHTML(aReleases) {
  const releases = [];

  aReleases.forEach(aRelease => {
    const publishedAt = moment(aRelease.timestamp);

    const release = {
      release_name: aRelease.release_name,
      release_link: aRelease.release_link,
      release_day: publishedAt.format('D'),
      release_month: publishedAt.format('MMMM'),
      release_year: publishedAt.format('YYYY'),
      early_access: detectEA(aRelease.version_data),
      lts: detectLTS(aRelease.version_data.semver),
      platforms: {},
    };

    aRelease.binaries.forEach(aReleaseAsset => {
      const platform = findPlatform(aReleaseAsset);

      if (!platform) {
        return;
      }

      const binary_type = aReleaseAsset.image_type.toUpperCase();
      if (!['INSTALLER', 'JDK', 'JRE'].includes(binary_type)) {
        return;
      }

      if (!release.platforms[platform]) {
        release.platforms[platform] = {
          official_name: getOfficialName(platform),
          ordinal: getPlatformOrder(platform),
          assets: [],
        };
      }

      const binary_constructor = {
        type: binary_type,
        link: aReleaseAsset.package.link,
        checksum: aReleaseAsset.package.checksum,
        size: Math.floor(aReleaseAsset.package.size / 1000 / 1000),
      };

      if (aReleaseAsset.installer) {
        binary_constructor.installer_link = aReleaseAsset.installer.link;
        binary_constructor.installer_checksum = aReleaseAsset.installer.checksum;
        binary_constructor.installer_size = Math.floor(aReleaseAsset.installer.size / 1000 / 1000);
      }

      release.platforms[platform].assets.push(binary_constructor);
    });

    releases.push(release);
  });

  const template = Handlebars.compile(document.getElementById('template').innerHTML);
  document.getElementById('releases-table-body').innerHTML = template({ releases });

  setPagination();

  loading.innerHTML = '';

  const releasesList = document.getElementById('releases-list');
  releasesList.className = releasesList.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
}

export function setPagination() {
  const container = document.getElementById('pagination-container');
  const releasesTableBody = document.getElementById('releases-table-body');

  $(container).pagination({
    dataSource: Array.from(releasesTableBody.getElementsByClassName('release-row')).map((row) => row.outerHTML),
    pageSize: 5,
    callback: (rows) => { releasesTableBody.innerHTML = rows.join(''); },
  });

  if (container.getElementsByTagName('li').length <= 3) {
    container.classList.add('hide');
  }
}
