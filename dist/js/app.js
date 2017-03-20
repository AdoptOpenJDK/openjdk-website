// set header logos to link to home
document.getElementById('logo').onclick = function() {
  window.location.href = "./index";
}

// set value for error container on every page
/* eslint-disable no-unused-vars */
var errorContainer = document.getElementById('error-container');
/* eslint-enable no-unused-vars */

// returns the name of the user's OS.
// modify this list to change how other functions search for downloads that match an OS.
/* eslint-disable no-unused-vars */
function detectOS() {
  /* eslint-enable no-unused-vars */
  var OSName="UnknownOS";
  if (navigator.userAgent.indexOf("Win")!=-1) OSName="Win";
  if (navigator.userAgent.indexOf("Mac")!=-1) OSName="Mac";
  if (navigator.userAgent.indexOf("X11")!=-1) OSName="Linux";
  if (navigator.userAgent.indexOf("Linux")!=-1) OSName="Linux";
  if (navigator.userAgent.indexOf("obile")!=-1) OSName="UnknownOS";
  return OSName;
}

// pass in the name of the repo (within this organisation only)
/* eslint-disable no-unused-vars */
function loadReleasesJSON(repo, loading, callback) {
  /* eslint-enable no-unused-vars */
  if(msieversion() == true) {
    loading.innerHTML = "";
    document.getElementById("error-container").innerHTML = "<p>Internet Explorer is not supported. Please use another browser, or see the <a href='https://github.com/AdoptOpenJDK/openjdk-releases/releases' target='blank'>releases list on GitHub</a>.</p>";
  }
  else {
    var url = ("https://api.github.com/repos/AdoptOpenJDK/" + repo + "/releases");
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function() {
      if (xobj.readyState == 4 && xobj.status == "200") {
        console.log("You have " + xobj.getResponseHeader('X-RateLimit-Remaining') + " GitHub API calls remaining for this hour");
        callback(xobj.responseText);
      } else {
        if(xobj.status != "200") {
          loading.innerHTML = "";
          document.getElementById("error-container").innerHTML = "<p>Error... there's a problem fetching the releases. Please see the <a href='https://github.com/AdoptOpenJDK/openjdk-releases/releases' target='blank'>releases list on GitHub</a>.</p>";
        }
      }
    };
    xobj.send(null);
  }
}

function msieversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie >= 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true;
    }
    else { return false; }
}

// When index page loads, run:
/* eslint-disable no-unused-vars */
function onIndexLoad() {
  setDownloadSection();
}
/* eslint-enable no-unused-vars */

// INDEX PAGE FUNCTIONS

function setDownloadSection() {
  const dlText = document.getElementById('dl-text');
  const dlLatest = document.getElementById('dl-latest');
  const dlArchive = document.getElementById('dl-archive');
  const dlOther = document.getElementById('dl-other');
  const dlVersionText = document.getElementById('dl-version-text');
  const loadingSpan = document.getElementById('loading-index');

  var OS = detectOS();

  dlArchive.onclick = function() {
    window.location.href = './releases#archive';
  }

  dlOther.onclick = function() {
    window.location.href = './releases';
  }

  var latestLink = "";
  var loading = loadingSpan;

  loadReleasesJSON("openjdk-releases", loading, function(response) {
    function checkIfProduction(x) {
      return x.prerelease === false && x.assets[0];
    }

    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    if (releasesJson && typeof releasesJson[0] !== 'undefined') {
      var newHTML = "";

      // set the download button's version number to the latest release
      newHTML = (releasesJson[0].tag_name);
      dlVersionText.innerHTML = newHTML;

      // create an array of the details for each binary that is attached to a release
      var assetArray = [];
      var assetCounter = 0;
      releasesJson[0].assets.forEach(function() {
        assetArray.push(releasesJson[0].assets[assetCounter]);
        assetCounter++;
      });

      // set the 'latestLink' variable to be the download URL of the latest release for the user's OS
      var assetCounter2 = 0;
      assetArray.forEach(function() {     // iterate through the binaries attached to this release
        var nameOfFile = (assetArray[assetCounter2].name);
        var a = nameOfFile.toUpperCase();
        var b = OS.toUpperCase();
        //console.log("Your OS: " + b + ". Checking for a match with this file: " + a);
        if(a.indexOf(b) >= 0) { // check if the user's OS string matches part of this binary's name (e.g. ...LINUX...)
          latestLink = (assetArray[assetCounter2].browser_download_url);
        }
        assetCounter2++;
      });

      if(latestLink == "") {
        dlOther.className += " hide";
        dlText.innerHTML = ("Downloads");
        latestLink = "./releases";
      } else {
        var fullOSName = OS;
        if(OS == "Win") {
          fullOSName = "Windows";
        } else if (OS == "Mac") {
          fullOSName = "macOS";
        }
        dlText.innerHTML = ("Download for " + fullOSName);
      }

    } else {
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      //dlVersionText.innerHTML = "";
    }

    // set the download button to use the 'latestLink' variable
    dlLatest.onclick = function() {
      window.location.href = latestLink;
    }

    // remove the loading dots, make the buttons visible, with animated fade-in
    loadingSpan.innerHTML = "";
    dlLatest.className += " animated";
    dlOther.className += " animated";
    dlArchive.className += " animated";
    dlLatest.className = dlLatest.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );
    dlOther.className = dlOther.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );
    dlArchive.className = dlArchive.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );

    // animate the main download button
    setTimeout(function(){
      dlLatest.className = "dl-button animated pulse";
    }, 1000);

 });

}

var assetCounter2 = 0;
// When nightly page loads, run:
/* eslint-disable no-unused-vars */
function onNightlyLoad() {
  /* eslint-enable no-unused-vars */
  populateNightly();

  const latestButton = document.getElementById('latest-button');
  const archiveButton = document.getElementById('archive-button');

  latestButton.onclick = function() {
    window.location.href = './releases';
  }

  archiveButton.onclick = function() {
    window.location.href = './releases#archive';
  }

  // realtime search box
  var search = document.getElementById("search");
  var searchError = document.getElementById("search-error");

  search.onkeyup = (function() {
    var filter, found, table, tr, td, i, j;
    filter = search.value.toUpperCase();
    table = document.getElementById("nightly-table");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td");
        for (j = 0; j < td.length; j++) {
            if (td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
                found = true;
            }
        }
        if (found) {
            tr[i].style.display = "";
            found = false;
        } else {
          if (tr[i].id != 'table-header'){
            tr[i].style.display = "none";
          }
        }
    }
    if(document.getElementById('table-parent').offsetHeight < 45) {
      table.style.visibility = "hidden";
      searchError.className = "";
    } else {
      table.style.visibility = "";
      searchError.className = "hide";
    }
  });

}

// NIGHTLY PAGE FUNCTIONS


function populateNightly() {
  const nightlyList = document.getElementById("nightly-table");
  var loading = document.getElementById("nightly-loading");

  loadReleasesJSON("openjdk-nightly", loading, function(response) {
    function checkIfProduction(x) {
      return x.prerelease === false && x.assets[0];
    }

    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases...
    if (typeof releasesJson[0] !== 'undefined') {
      // remove the loading dots
      document.getElementById("nightly-loading").innerHTML = "";

      // for each release...
      var nightlyCounter = 0;
      nightlyList.innerHTML = ("<thead><tr id='table-header'><th>Release</th><th>Linux</th><th>Windows</th><th>Mac</th><th>Release details</th></tr></thead>");
      releasesJson.forEach(function() {

        // get the current content of the nightly list div
        var currentNightlyContent = nightlyList.innerHTML;
        // add an empty, hidden entry to the nightly list, with the nightlyCounter suffixed to every ID
        var newNightlyContent = currentNightlyContent += ("<tr class='nightly-container hide' id='"+nightlyCounter+"'> <td class='nightly-header'> <div><strong><a href='' id='nightly-release"+nightlyCounter+"' class='dark-link' target='blank'></a></strong></div> <div class='divider'> | </div> <div id='nightly-date"+nightlyCounter+"'></div> </td> <td id='linux-platform-block"+nightlyCounter+"' class='nightly-platform-block'><div id='nightly-linux-dl-content"+nightlyCounter+"' class='invisible'><a class='dark-link' href='' id='nightly-linux-dl"+nightlyCounter+"'></a> <div class='divider'> | </div> <a href='' class='dark-link' id='nightly-linux-checksum"+nightlyCounter+"'>Checksum</a></div> </td> <td id='windows-platform-block"+nightlyCounter+"' class='nightly-platform-block'><div id='nightly-windows-dl-content"+nightlyCounter+"' class='invisible'><a class='dark-link' href='' id='nightly-windows-dl"+nightlyCounter+"'></a> <div class='divider'> | </div> <a href='' class='dark-link' id='nightly-windows-checksum"+nightlyCounter+"'>Checksum</a> </div></td> <td id='mac-platform-block"+nightlyCounter+"' class='nightly-platform-block'><div id='nightly-mac-dl-content"+nightlyCounter+"' class='invisible'><a class='dark-link' href='' id='nightly-mac-dl"+nightlyCounter+"'></a> <div class='divider'> | </div> <a href='' class='dark-link' id='nightly-mac-checksum"+nightlyCounter+"'>Checksum</a> </div></td> <td class='nightly-details'> <div><strong><a href='' class='dark-link' id='nightly-changelog"+nightlyCounter+"'>Changelog</a></strong></div> <div class='divider'> | </div> <div><strong>Timestamp: </strong><span id='nightly-timestamp"+nightlyCounter+"'></span></div> <div class='divider'> | </div> <div><strong>Build number: </strong><span id='nightly-buildnumber"+nightlyCounter+"'></span></div> <div class='divider'> | </div> <div><strong>Commit: </strong><a href='' class='dark-link' id='nightly-commitref"+nightlyCounter+"'></a></div> </td> </tr>");
        nightlyList.innerHTML = newNightlyContent;
        // populate the new entry with that release's information
        var publishedAt = (releasesJson[nightlyCounter].published_at);
        document.getElementById("nightly-release"+nightlyCounter).innerHTML = (releasesJson[nightlyCounter].name).slice(0, 12);
        document.getElementById("nightly-release"+nightlyCounter).href = ("https://github.com/AdoptOpenJDK/nightly/releases/tag/" + releasesJson[nightlyCounter].name)
        document.getElementById("nightly-date"+nightlyCounter).innerHTML = moment(publishedAt).format('Do MMMM YYYY');
        document.getElementById("nightly-changelog"+nightlyCounter).href = releasesJson[nightlyCounter].name;
        document.getElementById("nightly-timestamp"+nightlyCounter).innerHTML = (releasesJson[nightlyCounter].name).slice(13, 25);
        document.getElementById("nightly-buildnumber"+nightlyCounter).innerHTML = releasesJson[nightlyCounter].id;
        document.getElementById("nightly-commitref"+nightlyCounter).innerHTML = releasesJson[nightlyCounter].name;
        document.getElementById("nightly-commitref"+nightlyCounter).href = releasesJson[nightlyCounter].name;

        // set the download button links
          // create an array of the details for each binary that is attached to a release
          var assetArray = [];
          var assetCounter = 0;
          releasesJson[nightlyCounter].assets.forEach(function() {
            assetArray.push(releasesJson[nightlyCounter].assets[assetCounter]);
            assetCounter++;
          });

          // build the download links section with these binaries
          var linuxDlButton = document.getElementById("nightly-linux-dl"+nightlyCounter);
          var windowsDlButton = document.getElementById("nightly-windows-dl"+nightlyCounter);
          var macDlButton = document.getElementById("nightly-mac-dl"+nightlyCounter);
          var linuxDlContent = document.getElementById("nightly-linux-dl-content"+nightlyCounter);
          var windowsDlContent = document.getElementById("nightly-windows-dl-content"+nightlyCounter);
          var macDlContent = document.getElementById("nightly-mac-dl-content"+nightlyCounter);

          assetCounter2 = 0;
          assetArray.forEach(function() {     // iterate through the binaries attached to this release
            //console.log(assetCounter2);
            var nameOfFile = (assetArray[assetCounter2].name);
            var a = nameOfFile.toUpperCase();
            // set the download links for this release
            if(a.indexOf("LINUX") >= 0) {
              linuxDlButton.innerHTML = ("tar.gz (" + (Math.floor((assetArray[assetCounter2].size)/1024/1024)) + " MB)");
              document.getElementById("nightly-linux-checksum"+nightlyCounter).href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "txt");
              var linuxLink = (assetArray[assetCounter2].browser_download_url);
              linuxDlButton.href = linuxLink;
              linuxDlContent.className = linuxDlContent.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );

            } else if(a.indexOf("WIN") >= 0) {
              windowsDlButton.innerHTML = (".zip (" + (Math.floor((assetArray[assetCounter2].size)/1024/1024)) + " MB)");
              document.getElementById("nightly-windows-checksum"+nightlyCounter).href  = (assetArray[assetCounter2].browser_download_url).replace("zip", "txt");
              var windowsLink = (assetArray[assetCounter2].browser_download_url);
              windowsDlButton.href = windowsLink;
              windowsDlContent.className = windowsDlContent.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );

            } else if(a.indexOf("MAC") >= 0) {
              macDlButton.innerHTML = ("tar.gz (" + (Math.floor((assetArray[assetCounter2].size)/1024/1024)) + " MB)");
              document.getElementById("nightly-mac-checksum"+nightlyCounter).href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "txt")
              var macLink = (assetArray[assetCounter2].browser_download_url);
              macDlButton.href = macLink;
              macDlContent.className = macDlContent.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );

            }
            assetCounter2++;
          });

        // show the new entry
        var container = document.getElementById(nightlyCounter);
        container.className += " animated fadeIn";
        container.className = container.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
        // iterate to the next nightly entry
        nightlyCounter++;

      });
    } else {
      // report an error
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      document.getElementById("nightly-loading").innerHTML = "";
    }
  });
}

var assetCounter2 = 0;
// When releases page loads, run:
/* eslint-disable no-unused-vars */
function onReleasesLoad() {
  /* eslint-enable no-unused-vars */
  setReleasesButtons();

  const archive = document.getElementById('archives-page');
  const latest = document.getElementById('latest-page');

  if(window.location.hash == "#archive") {
    showArchive();
  } else {
    hideArchive();
  }

  function showArchive() {
    latest.className += " hide";
    archive.className = archive.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
    populateArchive();
  }

  function hideArchive() {
    archive.className += " hide";
    latest.className = latest.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
    populateLatest();
  }

  window.onhashchange = function(){
    if(window.location.hash == "#archive") {
      showArchive();
    } else {
      hideArchive();
    }
  }
}

// BOTH PAGES FUNCTIONS

function setReleasesButtons() {
  const archiveButton = document.getElementById('archive-button');
  const latestButton = document.getElementById('latest-button');
  const nightlyButton = document.getElementById('nightly-button');

  archiveButton.onclick = function() {
    window.location.href = './releases#archive';
  }

  latestButton.onclick = function() {
    window.location.href = './releases';
  }

  nightlyButton.onclick = function() {
    window.location.href = './nightly';
  }
}

// LATEST PAGE FUNCTIONS

function populateLatest() {

  var loading = document.getElementById("latest-loading");

  loadReleasesJSON("openjdk-releases", loading, function(response) {
    function checkIfProduction(x) {
      return x.prerelease === false && x.assets[0];
    }

    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases...
    if (typeof releasesJson[0] !== 'undefined') {
      // remove the loading dots
      document.getElementById("latest-loading").innerHTML = "";

      // populate the page with the release's information
      var publishedAt = (releasesJson[0].published_at);
      document.getElementById("latest-build-name").innerHTML = releasesJson[0].name;
      document.getElementById("latest-build-name").href = ("https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/" + releasesJson[0].name);
      document.getElementById("latest-date").innerHTML = moment(publishedAt).format('Do MMMM YYYY');
      document.getElementById("latest-changelog").href = releasesJson[0].name;
      document.getElementById("latest-timestamp").innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
      document.getElementById("latest-buildnumber").innerHTML = releasesJson[0].id;
      document.getElementById("latest-commitref").innerHTML = releasesJson[0].name;
      document.getElementById("latest-commitref").href = releasesJson[0].name;

      // create an array of the details for each binary that is attached to a release
      var assetArray = [];
      var assetCounter = 0;
      releasesJson[0].assets.forEach(function() {
        assetArray.push(releasesJson[0].assets[assetCounter]);
        assetCounter++;
      });

      // build the download links section with these binaries
      var linuxDlButton = document.getElementById("linux-dl-button");
      var windowsDlButton = document.getElementById("windows-dl-button");
      var macDlButton = document.getElementById("mac-dl-button");
      var linuxPlatformBlock = document.getElementById("latest-linux");
      var windowsPlatformBlock = document.getElementById("latest-windows");
      var macPlatformBlock = document.getElementById("latest-mac");

      assetCounter2 = 0;
      assetArray.forEach(function() {     // iterate through the binaries attached to this release
        var nameOfFile = (assetArray[assetCounter2].name);
        var a = nameOfFile.toUpperCase();
        // set the download links for this release
        if(a.indexOf("LINUX") >= 0) {
          document.getElementById("latest-size-linux").innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
          document.getElementById("latest-checksum-linux").href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "txt");

          var linuxLink = (assetArray[assetCounter2].browser_download_url);
          linuxDlButton.onclick = function() {
            window.location.href = linuxLink;
          }
          linuxPlatformBlock.className = linuxPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );

        } else if(a.indexOf("WIN") >= 0) {
          document.getElementById("latest-size-windows").innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
          document.getElementById("latest-checksum-windows").href = (assetArray[assetCounter2].browser_download_url).replace("zip", "txt");

          var windowsLink = (assetArray[assetCounter2].browser_download_url);
          windowsDlButton.onclick = function() {
            window.location.href = windowsLink;
          }
          windowsPlatformBlock.className = windowsPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );

        } else if(a.indexOf("MAC") >= 0) {
          document.getElementById("latest-size-mac").innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
          document.getElementById("latest-checksum-mac").href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "txt");

          var macLink = (assetArray[assetCounter2].browser_download_url);
          macDlButton.onclick = function() {
            window.location.href = macLink;
          }
          macPlatformBlock.className = macPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
        }
        assetCounter2++;
      });

      const latestContainer = document.getElementById("latest-container");
      latestContainer.className += " animated fadeIn";
      latestContainer.className = latestContainer.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );

    } else {
      // report an error
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      document.getElementById("latest-loading").innerHTML = "";
    }
  });
}



// ARCHIVE PAGE FUNCTIONS

function populateArchive() {
  const archiveList = document.getElementById("archive-list");
  var loading = document.getElementById("archive-loading");

  loadReleasesJSON("openjdk-releases", loading, function(response) {
    function checkIfProduction(x) {
      return x.prerelease === false && x.assets[0];
    }

    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases prior to the latest one...
    if (typeof releasesJson[1] !== 'undefined') {
      // remove the loading dots
      document.getElementById("archive-loading").innerHTML = "";

      // for each release...
      var archiveCounter = 0;
      releasesJson.forEach(function() {

        // get the current content of the archive list div
        var currentArchiveContent = archiveList.innerHTML;
        // add an empty, hidden entry to the archive list, with the archiveCounter suffixed to every ID
        var newArchiveContent = currentArchiveContent += ("<div class='archive-container hide' id='"+archiveCounter+"'><div class='archive-header blue-bg vertically-center-parent'><div class='vertically-center-child full-width'><div><h1><a href='' id='archive-release"+archiveCounter+"' class='light-link' target='blank'></a></h1></div><div id='archive-date"+archiveCounter+"'></div></div></div><div class='archive-downloads vertically-center-parent'><div class='archive-downloads-container vertically-center-child'><div id='linux-platform-block"+archiveCounter+"' class='archive-platform-block align-left hide'><div class='bold'>Linux</div><a class='grey-button no-underline' href='' id='archive-linux-dl"+archiveCounter+"'>tar.gz (<span id='archive-linux-size"+archiveCounter+"'></span> MB)</a><a href='' class='dark-link' id='archive-linux-checksum"+archiveCounter+"'>Checksum</a></div><div id='windows-platform-block"+archiveCounter+"' class='archive-platform-block align-left hide'><div class='bold'>Windows</div><a class='grey-button no-underline' href='' id='archive-windows-dl"+archiveCounter+"'>.zip (<span id='archive-windows-size"+archiveCounter+"'></span> MB)</a><a href='' class='dark-link' id='archive-windows-checksum"+archiveCounter+"'>Checksum</a></div><div id='mac-platform-block"+archiveCounter+"' class='archive-platform-block align-left hide'><div class='bold'>macOS</div><a class='grey-button no-underline' href='' id='archive-mac-dl"+archiveCounter+"'>tar.gz (<span id='archive-mac-size"+archiveCounter+"'></span> MB)</a><a href='' class='dark-link' id='archive-mac-checksum"+archiveCounter+"'>Checksum</a></div></div></div><div class='archive-details align-left vertically-center-parent'><div class='vertically-center-child'><div><strong><a href='' class='dark-link' id='archive-changelog"+archiveCounter+"'>Changelog</a></strong></div><div><strong>Timestamp: </strong><span id='archive-timestamp"+archiveCounter+"'></span></div><div><strong>Build number: </strong><span id='archive-buildnumber"+archiveCounter+"'></span></div><div><strong>Commit: </strong><a href='' class='dark-link' id='archive-commitref"+archiveCounter+"'></a></div></div></div></div>");
        archiveList.innerHTML = newArchiveContent;
        // populate the new entry with that release's information
        var publishedAt = (releasesJson[archiveCounter].published_at);
        document.getElementById("archive-release"+archiveCounter).innerHTML = releasesJson[archiveCounter].name;
        document.getElementById("archive-release"+archiveCounter).href = ("https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/" + releasesJson[archiveCounter].name);
        document.getElementById("archive-date"+archiveCounter).innerHTML = moment(publishedAt).format('Do MMMM YYYY');
        document.getElementById("archive-changelog"+archiveCounter).href = releasesJson[archiveCounter].name;
        document.getElementById("archive-timestamp"+archiveCounter).innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
        document.getElementById("archive-buildnumber"+archiveCounter).innerHTML = releasesJson[archiveCounter].id;
        document.getElementById("archive-commitref"+archiveCounter).innerHTML = releasesJson[archiveCounter].name;
        document.getElementById("archive-commitref"+archiveCounter).href = releasesJson[archiveCounter].name;

        // set the download button links
          // create an array of the details for each binary that is attached to a release
          var assetArray = [];
          var assetCounter = 0;
          releasesJson[archiveCounter].assets.forEach(function() {
            assetArray.push(releasesJson[archiveCounter].assets[assetCounter]);
            assetCounter++;
          });

          // build the download links section with these binaries
          var linuxDlButton = document.getElementById("archive-linux-dl"+archiveCounter);
          var windowsDlButton = document.getElementById("archive-windows-dl"+archiveCounter);
          var macDlButton = document.getElementById("archive-mac-dl"+archiveCounter);
          var linuxPlatformBlock = document.getElementById("linux-platform-block"+archiveCounter);
          var windowsPlatformBlock = document.getElementById("windows-platform-block"+archiveCounter);
          var macPlatformBlock = document.getElementById("mac-platform-block"+archiveCounter);

          assetCounter2 = 0;
          assetArray.forEach(function() {     // iterate through the binaries attached to this release
            var nameOfFile = (assetArray[assetCounter2].name);
            var a = nameOfFile.toUpperCase();
            // set the download links for this release
            if(a.indexOf("LINUX") >= 0) {
              document.getElementById("archive-linux-size"+archiveCounter).innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
              document.getElementById("archive-linux-checksum"+archiveCounter).href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "txt");

              var linuxLink = (assetArray[assetCounter2].browser_download_url);
              linuxDlButton.href = linuxLink;
              linuxPlatformBlock.className = linuxPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );

            } else if(a.indexOf("WIN") >= 0) {
              document.getElementById("archive-windows-size"+archiveCounter).innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
              document.getElementById("archive-windows-checksum"+archiveCounter).href = (assetArray[assetCounter2].browser_download_url).replace("zip", "txt");

              var windowsLink = (assetArray[assetCounter2].browser_download_url);
              windowsDlButton.href = windowsLink;
              windowsPlatformBlock.className = windowsPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );

            } else if(a.indexOf("MAC") >= 0) {
              document.getElementById("archive-mac-size"+archiveCounter).innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
              document.getElementById("archive-mac-checksum"+archiveCounter).href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "txt");

              var macLink = (assetArray[assetCounter2].browser_download_url);
              macDlButton.href = macLink;
              macPlatformBlock.className = macPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
            }
            assetCounter2++;
          });

        // show the new entry
        var container = document.getElementById(archiveCounter);
        container.className += " animated fadeIn";
        container.className = container.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
        // iterate to the next archive entry
        archiveCounter++;

      });
    } else {
      // report an error
      errorContainer.innerHTML = "<p>There are no archived releases yet! See the <a href='./releases'>Latest release</a> page.</p>";
      document.getElementById("archive-loading").innerHTML = "";
    }
  });
}
