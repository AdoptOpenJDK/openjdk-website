// set platforms array - CHANGE THIS TO UPDATE WEBSITE PLATFORMS
var platforms = [
  {
    officialName: "Linux x86-64",
    searchableName: "X64_LINUX",
    logo: "linux.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above"
  },
  {
    officialName: "Linux s390x",
    searchableName: "S390X_LINUX",
    logo: "linux.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above"
  },
  {
    officialName: "Linux ppc64le",
    searchableName: "PPC64LE_LINUX",
    logo: "linux.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above"
  },
  {
    officialName: "Linux arm",
    searchableName: "ARM_LINUX",
    logo: "linux.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above"
  },
  {
    officialName: "macOS x86-64",
    searchableName: "MAC",
    logo: "mac.png",
    fileExtension: ".tar.gz",
    requirements: "macOS 10.8 and above"
  },
  {
    officialName: "Windows x86-64",
    searchableName: "WIN",
    logo: "windows.png",
    fileExtension: ".zip",
    requirements: "VS 2010 and above"
  }
];

// FUNCTIONS FOR GETTING PLATFORM DATA
// allows us to use, for example, 'lookup["MAC"];'
var lookup = {};
for (var i = 0, len = platforms.length; i < len; i++) {
    lookup[platforms[i].searchableName] = platforms[i];
}

// gets the 'searchableName' when you pass in the full filename.
// If the filename does not match a known platform, returns false. (E.g. if a new or incorrect file appears in a repo)
function getSearchableName(filename) {
  var platformCounter = 0;
  var platform = "UNKNOWN";
  platforms.forEach(function() {
    if(filename.indexOf(platforms[platformCounter].searchableName) >= 0) {
      platform = platforms[platformCounter].searchableName;
    }
    platformCounter++;
  });
  if(platform == "UNKNOWN") {
    return false;
  }
  else {
    return (lookup[platform].searchableName);
  }
}

// set path to logos
var logoPath = "./dist/assets/";

// gets the OFFICIAL NAME when you pass in 'searchableName'
function getOfficialName(searchableName) {
  return (lookup[searchableName].officialName);
}

// gets the FILE EXTENSION when you pass in 'searchableName'
function getFileExt(searchableName) {
  return (lookup[searchableName].fileExtension);
}

// gets the LOGO WITH PATH when you pass in 'searchableName'
function getLogo(searchableName) {
  return (logoPath + (lookup[searchableName].logo));
}

// gets the PLATFORM REQUIREMENTS when you pass in 'searchableName'
function getRequirements(searchableName) {
  return (lookup[searchableName].requirements);
}



// set value for error container on every page
var errorContainer = document.getElementById('error-container');

// set variable names for menu elements
const menuOpen = document.getElementById('menu-button');
const menuClose = document.getElementById('menu-close');
const menu = document.getElementById('menu-container');

menuOpen.onclick = function() {
  menu.className = menu.className.replace( /(?:^|\s)slideOutLeft(?!\S)/g , ' slideInLeft' ); // slide in animation
  menu.className = menu.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated' ); // removes initial hidden property, activates animations
}

menuClose.onclick = function() {
  menu.className = menu.className.replace( /(?:^|\s)slideInLeft(?!\S)/g , ' slideOutLeft' ); // slide out animation
}

// this function returns the name of the user's OS.
// modify this list to change how other functions search for downloads that match an OS.
function detectOS() {
  var OSName="UnknownOS";
  if (navigator.userAgent.indexOf("Win")!=-1) OSName="Win";
  if (navigator.userAgent.indexOf("Mac")!=-1) OSName="Mac";
  if (navigator.userAgent.indexOf("X11")!=-1) OSName="Linux";
  if (navigator.userAgent.indexOf("Linux")!=-1) OSName="Linux";
  if (navigator.userAgent.indexOf("obile")!=-1) OSName="UnknownOS";
  return OSName;
}

// when using this function, pass in the name of the repo (options: releases, nightly)
function loadReleasesJSON(repo, loading, callback) {
  if(msieversion() == true) { // if the browser is IE, display an error with advice, because important website features do not work in IE.
    loading.innerHTML = "";
    document.getElementById("error-container").innerHTML = "<p>Internet Explorer is not supported. Please use another browser, or see the <a href='https://github.com/AdoptOpenJDK/openjdk-releases/releases' target='blank'>releases list on GitHub</a>.</p>";
  }
  else {
    var url = ("https://raw.githubusercontent.com/AdoptOpenJDK/openjdk-" + repo + "/master/" + repo + ".json"); // the URL of the JSON built in the website back-end
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function() {
      if (xobj.readyState == 4 && xobj.status == "200") { // if the status is 'ok', run the callback function that has been passed in.
        callback(xobj.responseText);
      } else if(xobj.status != "200") { // if the status is NOT 'ok', remove the loading dots, and display an error:
          loading.innerHTML = "";
          document.getElementById("error-container").innerHTML = "<p>Error... there's a problem fetching the releases. Please see the <a href='https://github.com/AdoptOpenJDK/openjdk-releases/releases' target='blank'>releases list on GitHub</a>.</p>";
      }
    };
    xobj.send(null);
  }
}

// check for IE browser
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
  setDownloadSection(); // on page load, populate the central download section.
}
/* eslint-enable no-unused-vars */

// INDEX PAGE FUNCTIONS

//
function setDownloadSection() {
  // set variables for all index page HTML elements that will be used by the JS
  const dlText = document.getElementById('dl-text');
  const dlLatest = document.getElementById('dl-latest');
  const dlArchive = document.getElementById('dl-archive');
  const dlOther = document.getElementById('dl-other');
  const dlVersionText = document.getElementById('dl-version-text');
  const loadingSpan = document.getElementById('loading-index');

  var OS = detectOS(); // set a variable as the user's OS

  var latestLink = ""; // reset the variable for the latest download button link to be empty.

  // call the XmlHttpRequest function in global.js, passing in 'releases' as the repo, and a long function as the callback.
  loadReleasesJSON("releases", loadingSpan, function(response) {
    function checkIfProduction(x) { // used by the array filter method below.
      return x.prerelease === false && x.assets[0];
    }

    // Step 1: create a JSON from the XmlHttpRequest response
    // Step 2: filter out all releases from this JSON that are marked as 'pre-release' in GitHub.
    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases...
    if (typeof releasesJson[0] !== 'undefined') {
      var newHTML = ""; // set the variable to be an empty string.

      // set the download button's version number to the latest release
      newHTML = (releasesJson[0].tag_name);
      dlVersionText.innerHTML = newHTML;

      // create an array of the details for each binary that is attached to a release
      var assetArray = [];
      var assetCounter = 0;
      // create a new array that contains each 'asset' (binary) from the latest release:
      releasesJson[0].assets.forEach(function() {
        assetArray.push(releasesJson[0].assets[assetCounter]);
        assetCounter++;
      });

      // set the 'latestLink' variable to be the download URL of the latest release for the user's OS
      var assetCounter2 = 0;
      assetArray.forEach(function() {     // iterate through the binaries attached to this release
        var nameOfFile = (assetArray[assetCounter2].name);
        // convert the name of the binary file, and the user's OS, to be uppercase:
        var a = nameOfFile.toUpperCase();
        var b = OS.toUpperCase();
        if(a.indexOf(b) >= 0) { // check if the user's OS string matches part of this binary's name (e.g. ...LINUX...)
          latestLink = (assetArray[assetCounter2].browser_download_url); // set the link variable to be the download URL that matches the user's OS
        }
        assetCounter2++;
      });

      if(latestLink == "") { // if there is no matching binary for the user's OS:
        dlOther.className += " hide"; // hide the 'Other platforms' button
        dlText.innerHTML = ("Downloads"); // change the text to be generic: 'Downloads'.
        latestLink = "./releases.html"; // change the main download button's link, now takes the user to the latest releases page for all platforms.
      }
      else { // if there IS a matching binary for the user's OS:
        var fullOSName = OS; // defaults this variable to be the detected OS name
        if(OS == "Linux") {
          fullOSName = "Linux x86-64"; // add 'x86-64'
        } else if(OS == "Win") {
          fullOSName = "Windows x86-64"; // 'Win' is not user friendly - make it 'Windows'.
        } else if (OS == "Mac") {
          fullOSName = "macOS x86-64"; // 'macOS' is the official OS name.
        }
        dlText.innerHTML = ("Download for " + fullOSName); // set the text to be OS-specific, using the full OS name.
      }

    } else { // if there are no releases:
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      //dlVersionText.innerHTML = "";
    }

    // set the download button to use the 'latestLink' variable
    dlLatest.href = latestLink;

    // remove the loading dots, and make all buttons visible, with animated fade-in
    loadingSpan.innerHTML = "";
    dlLatest.className += " animated";
    dlOther.className += " animated";
    dlArchive.className += " animated";
    dlLatest.className = dlLatest.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );
    dlOther.className = dlOther.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );
    dlArchive.className = dlArchive.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );

    dlLatest.onclick = function() {
      document.getElementById('installation-link').className += " animated pulse infinite transition-bright";
    };

    // animate the main download button shortly after the initial animation has finished.
    setTimeout(function(){
      dlLatest.className = "dl-button a-button animated pulse";
    }, 1000);

 });

}

// When nightly page loads, run:
/* eslint-disable no-unused-vars */
function onNightlyLoad() {
  /* eslint-enable no-unused-vars */

  populateNightly(); // run the function to populate the table on the Nightly page.

}


// NIGHTLY PAGE FUNCTIONS

function populateNightly() {
  const tableHead = document.getElementById("table-head");
  const tableContainer = document.getElementById("nightly-list");
  const nightlyList = document.getElementById("nightly-table");
  var loading = document.getElementById("nightly-loading");

  // call the XmlHttpRequest function in global.js, passing in 'nightly' as the repo, and a long function as the callback.
  loadReleasesJSON("nightly", loading, function(response) {
    function checkIfProduction(x) { // used by the array filter method below.
      return x.prerelease === false && x.assets[0];
    }

    // Step 1: create a JSON from the XmlHttpRequest response
    // Step 2: filter out all releases from this JSON that are marked as 'pre-release' in GitHub.
    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases...
    if (typeof releasesJson[0] !== 'undefined') {
      // remove the loading dots
      document.getElementById("nightly-loading").innerHTML = "";

      // for each release...
      var nightlyReleaseCounter = 0;
      var tableRowCounter = 0;

      tableHead.innerHTML = ("<tr id='table-header'><th>Release</th><th>Platform</th><th>Downloads</th><th>Release details</th></tr>");

      releasesJson.forEach(function() {

        // create an array of the details for each binary that is attached to a release
        var assetArray = [];
        var assetCounter = 0;
        releasesJson[nightlyReleaseCounter].assets.forEach(function() {
          assetArray.push(releasesJson[nightlyReleaseCounter].assets[assetCounter]);
          assetCounter++;
        });

        // build rows with the array of binaries...
        var assetCounter2 = 0;
        assetArray.forEach(function() {  // for each file attached to this release...

          var nameOfFile = (assetArray[assetCounter2].name);
          var a = nameOfFile.toUpperCase(); // make the name of the file uppercase
          var thisPlatform = getSearchableName(a); // get the searchableName, e.g. MAC or X64_LINUX.

          // firstly, check if the platform name is recognised...
          if(thisPlatform != false) {

            // secondly, check if the file has the expected file extension for that platform...
            // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
            var thisFileExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
            if(a.indexOf((thisFileExtension.toUpperCase())) >= 0) {

              // get the current content of the nightly list div
              var currentNightlyContent = nightlyList.innerHTML;

              // add an empty, hidden HTML template entry to the current nightly list, with the tableRowCounter suffixed to every ID
              // to change the HTML of the nightly table rows/cells, you must change this template.
              var newNightlyContent = currentNightlyContent += ("<tr class='nightly-container hide' id='"+tableRowCounter+"'> <td class='nightly-header'> <div><strong><a href='' id='nightly-release"+tableRowCounter+"' class='dark-link' target='_blank'></a></strong></div> <div class='divider'> | </div> <div id='nightly-date"+tableRowCounter+"'></div> </td> <td id='platform-block"+tableRowCounter+"' class='nightly-platform-block'></td> <td id='downloads-block"+tableRowCounter+"' class='nightly-downloads-block'><div id='nightly-dl-content"+tableRowCounter+"'><a class='dark-link' href='' id='nightly-dl"+tableRowCounter+"'></a> <div class='divider'> | </div> <a href='' class='dark-link' id='nightly-checksum"+tableRowCounter+"'>Checksum</a> </div></td> <td class='nightly-details'> <!--<div><strong><a href='' class='dark-link' id='nightly-changelog"+tableRowCounter+"'>Changelog</a></strong></div> <div class='divider'> | </div>--> <div><strong>Timestamp: </strong><span id='nightly-timestamp"+tableRowCounter+"'></span></div> <!--<div class='divider'> | </div> <div><strong>Build number: </strong><span id='nightly-buildnumber"+tableRowCounter+"'></span></div>--> <!--<div class='divider'> | </div> <div><strong>Commit: </strong><a href='' class='dark-link' id='nightly-commitref"+tableRowCounter+"'></a></div>--> </td> </tr>");

              // update the HTML container element with this new, blank, template row (hidden at this stage)
              nightlyList.innerHTML = newNightlyContent;

              // set variables for HTML elements.
              var dlButton = document.getElementById("nightly-dl"+tableRowCounter);
              //var dlContent = document.getElementById("nightly-dl-content"+tableRowCounter);

              // populate this new row with the release information
              var publishedAt = (releasesJson[nightlyReleaseCounter].published_at);
              document.getElementById("nightly-release"+tableRowCounter).innerHTML = (releasesJson[nightlyReleaseCounter].name).slice(0, 12); // the release name, minus the timestamp
              document.getElementById("nightly-release"+tableRowCounter).href = ("https://github.com/AdoptOpenJDK/openjdk-nightly/releases/tag/" + releasesJson[nightlyReleaseCounter].name) // the link to that release on GitHub
              document.getElementById("nightly-date"+tableRowCounter).innerHTML = moment(publishedAt).format('Do MMMM YYYY'); // the timestamp converted into a readable date
              //document.getElementById("nightly-changelog"+tableRowCounter).href = releasesJson[nightlyReleaseCounter].name; // TODO: WAITING FOR THE LINKS TO BE AVAILABLE. the link to the release changelog
              document.getElementById("nightly-timestamp"+tableRowCounter).innerHTML = (releasesJson[nightlyReleaseCounter].name).slice(13, 25); // the timestamp section of the build name
              //document.getElementById("nightly-buildnumber"+tableRowCounter).innerHTML = releasesJson[nightlyReleaseCounter].id; // TODO: currently this is the release ID
              //document.getElementById("nightly-commitref"+tableRowCounter).innerHTML = releasesJson[nightlyReleaseCounter].name; // TODO: WAITING FOR THE INFO TO BE AVAILABLE.
              //document.getElementById("nightly-commitref"+tableRowCounter).href = releasesJson[nightlyReleaseCounter].name; // TODO: WAITING FOR THE LINKS TO BE AVAILABLE.

              // get the official name, e.g. Linux x86-64, and display it in this new row
              var officialName = getOfficialName(thisPlatform);
              document.getElementById("platform-block"+tableRowCounter).innerHTML = officialName;

              // set the download section for this new row
              dlButton.innerHTML = (thisFileExtension + " (" + (Math.floor((assetArray[assetCounter2].size)/1024/1024)) + " MB)"); // display the file type and the file size
              document.getElementById("nightly-checksum"+tableRowCounter).href = (assetArray[assetCounter2].browser_download_url).replace(thisFileExtension, ".sha256.txt"); // set the checksum link (relies on the checksum having the same name as the binary, but .sha256.txt extension)
              var link = (assetArray[assetCounter2].browser_download_url);
              dlButton.href = link; // set the download link

              // show the new row
              var trElement = document.getElementById(tableRowCounter);
              trElement.className += " animated fadeIn"; // add the fade animation
              trElement.className = trElement.className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // remove the 'hide' class immediately afterwards

              tableRowCounter++;
            }
          }

          assetCounter2++;
        });

          // iterate to the next nightly release
          nightlyReleaseCounter++;

      });

      // if the table has a scroll bar, show text describing how to horizontally scroll
      var scrollText = document.getElementById('scroll-text');
      var tableDisplayWidth = document.getElementById('nightly-list').clientWidth;
      var tableScrollWidth = document.getElementById('nightly-list').scrollWidth;
      if (tableDisplayWidth != tableScrollWidth) {
        scrollText.className = scrollText.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
      }

    } else { // if there are no releases...
      // report an error
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      document.getElementById("nightly-loading").innerHTML = ""; // remove the loading dots
    }

    var searchError = document.getElementById("search-error");

    // logic for the realtime search box...
    /* eslint-disable */
    var $rows = $('#nightly-table tr');
    $('#search').keyup(function() {
      var val = '^(?=.*' + $.trim($(this).val()).split(/\s+/).join(')(?=.*') + ').*$',
          reg = RegExp(val, 'i'),
          text;

      $rows.show().filter(function() {
          text = $(this).text().replace(/\s+/g, ' ');
          return !reg.test(text);
      }).hide();

      if(document.getElementById('table-parent').offsetHeight < 45) {
        tableContainer.style.visibility = "hidden";
        searchError.className = "";
      } else {
        tableContainer.style.visibility = "";
        searchError.className = "hide";
      }
    });
    /* eslint-enable */

  });
}

var assetCounter2 = 0;
// When releases page loads, run:
/* eslint-disable no-unused-vars */
function onReleasesLoad() {
  /* eslint-enable no-unused-vars */

  // set variables for the two page sections contained within releases.html
  const archive = document.getElementById('archives-page');
  const latest = document.getElementById('latest-page');

  // on load, check if it's the archive page, and run showArchive(); or hideArchive(); accordingly
  if(window.location.hash == "#archive") {
    showArchive();
  } else {
    hideArchive();
  }

  function showArchive() {
    latest.className += " hide"; // hide the 'Latest' page
    archive.className = archive.className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // show the 'Archive' page
    errorContainer.style.color = "black";
    populateArchive(); // populate the Archive page
  }

  function hideArchive() {
    archive.className += " hide"; // hide the 'Archive' page
    latest.className = latest.className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // show the 'Latest' page
    errorContainer.style.color = "red";
    populateLatest(); // populate the Latest page
  }

  // If the hash changes in the URL while on the page, switch to the correct page accordingly.
  window.onhashchange = function(){
    if(window.location.hash == "#archive") {
      errorContainer.innerHTML = ""; // reset the error message
      showArchive();
    } else {
      errorContainer.innerHTML = ""; // reset the error message
      hideArchive();
    }
  }
}

// LATEST PAGE FUNCTIONS

function populateLatest() {

  var loading = document.getElementById("latest-loading"); // set variable for the loading dots

  // call the XmlHttpRequest function in global.js, passing in 'releases' as the repo, and a long function as the callback.
  loadReleasesJSON("releases", loading, function(response) {
    function checkIfProduction(x) {
      return x.prerelease === false && x.assets[0]; // used by the array filter method below.
    }

    // Step 1: create a JSON from the XmlHttpRequest response
    // Step 2: filter out all releases from this JSON that are marked as 'pre-release' in GitHub.
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
      //document.getElementById("latest-changelog").href = releasesJson[0].name;
      document.getElementById("latest-timestamp").innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
      //document.getElementById("latest-buildnumber").innerHTML = releasesJson[0].id;
      //document.getElementById("latest-commitref").innerHTML = releasesJson[0].name;
      //document.getElementById("latest-commitref").href = releasesJson[0].name;

      // create an array of the details for each asset that is attached to a release
      var assetArray = [];
      var assetCounter = 0;
      releasesJson[0].assets.forEach(function() {
        assetArray.push(releasesJson[0].assets[assetCounter]);
        assetCounter++;
      });

      // for each asset attached to this release, check if it's a valid binary, then add a download block for it...
      assetCounter2 = 0;
      assetArray.forEach(function() {
        var nameOfFile = (assetArray[assetCounter2].name);
        var a = nameOfFile.toUpperCase(); // make the name of the asset uppercase
        var thisPlatform = getSearchableName(a); // get the searchableName, e.g. MAC or X64_LINUX.

        // firstly, check if the platform name is recognised...
        if(thisPlatform != false) {

          // secondly, check if the file has the expected file extension for that platform...
          // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
          var thisFileExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
          if(a.indexOf((thisFileExtension.toUpperCase())) >= 0) {

            // set values ready to be injected into the HTML
            var thisLogo = getLogo(thisPlatform);
            var thisOfficialName = getOfficialName(thisPlatform);
            var thisBinaryLink = (assetArray[assetCounter2].browser_download_url);
            var thisBinarySize = Math.floor((assetArray[assetCounter2].size)/1024/1024);
            var thisChecksumLink = (assetArray[assetCounter2].browser_download_url).replace(thisFileExtension, ".sha256.txt");
            var thisRequirements = getRequirements(thisPlatform);

            // get the current content of the latest downloads container div
            var latestContainer = document.getElementById("latest-downloads-container");
            var currentLatestContent = latestContainer.innerHTML;

            // prepare a fully-populated HTML block for this platform
            var newLatestContent = currentLatestContent += ("<div id='latest-"+ thisPlatform +"' class='latest-block'><div class='latest-platform'><img src='"+ thisLogo +"'><div>"+ thisOfficialName +"</div></div><a href='"+ thisBinaryLink +"' class='latest-download-button a-button' id='linux-dl-button'><div>Download <div class='small-dl-text'>("+ thisFileExtension +" - "+ thisBinarySize +" MB)</div></div></a><div class='latest-details'><p><a href='"+ thisChecksumLink +"' class='dark-link' id='latest-checksum-"+ thisPlatform +"' target='_blank'>Checksum</a></p><p><strong>Requirements:</strong><br>"+ thisRequirements +"</p></ul></div></div>");

            // update the latest downloads container with this new platform block
            latestContainer.innerHTML = newLatestContent;
          }
        }

        assetCounter2++;
      });

      const latestContainer = document.getElementById("latest-container");
      latestContainer.className += " animated fadeIn"; // animate a fade-in of the entire 'latest page' section
      latestContainer.className = latestContainer.className.replace( /(?:^|\s)invisible(?!\S)/g , '' ); // make this section visible (invisible by default)

    } else {
      // report an error
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      document.getElementById("latest-loading").innerHTML = ""; // remove the loading dots
    }
  });
}
// END OF LATEST PAGE FUNCTIONS



// ARCHIVE PAGE FUNCTIONS

function populateArchive() {
  // set variables for HTML elements
  const archiveList = document.getElementById("archive-list");
  var loading = document.getElementById("archive-loading");

  // call the XmlHttpRequest function in global.js, passing in 'releases' as the repo, and a long function as the callback.
  loadReleasesJSON("releases", loading, function(response) {
    function checkIfProduction(x) { // used by the array filter method below.
      return x.prerelease === false && x.assets[0];
    }

    // Step 1: create a JSON from the XmlHttpRequest response
    // Step 2: filter out all releases from this JSON that are marked as 'pre-release' in GitHub.
    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases prior to the 'latest' one (i.e. archived releases)...
    if (typeof releasesJson[1] !== 'undefined') {
      // remove the loading dots
      document.getElementById("archive-loading").innerHTML = "";

      // for each release...
      var archiveCounter = 0;
      releasesJson.forEach(function() {

        // get the current content of the archive list div
        var currentArchiveContent = archiveList.innerHTML;
        // add an empty, hidden entry to the archive list, with the archiveCounter suffixed to every ID
        var newArchiveContent = currentArchiveContent += ("<div class='archive-container hide' id='"+archiveCounter+"'><div class='archive-header blue-bg vertically-center-parent'><div class='vertically-center-child full-width'><div><h1><a href='' id='archive-release"+archiveCounter+"' class='light-link' target='blank'></a></h1></div><div id='archive-date"+archiveCounter+"'></div></div></div><div class='archive-downloads vertically-center-parent'><div class='archive-downloads-container vertically-center-child'><div id='linux-platform-block"+archiveCounter+"' class='archive-platform-block align-left hide'><div class='bold'>Linux x86-64</div><a class='grey-button no-underline' href='' id='archive-linux-dl"+archiveCounter+"'>tar.gz (<span id='archive-linux-size"+archiveCounter+"'></span> MB)</a><a href='' class='dark-link' id='archive-linux-checksum"+archiveCounter+"'>Checksum</a></div><div id='windows-platform-block"+archiveCounter+"' class='archive-platform-block align-left hide'><div class='bold'>Windows x86-64</div><a class='grey-button no-underline' href='' id='archive-windows-dl"+archiveCounter+"'>.zip (<span id='archive-windows-size"+archiveCounter+"'></span> MB)</a><a href='' class='dark-link' id='archive-windows-checksum"+archiveCounter+"'>Checksum</a></div><div id='mac-platform-block"+archiveCounter+"' class='archive-platform-block align-left hide'><div class='bold'>macOS x86-64</div><a class='grey-button no-underline' href='' id='archive-mac-dl"+archiveCounter+"'>tar.gz (<span id='archive-mac-size"+archiveCounter+"'></span> MB)</a><a href='' class='dark-link' id='archive-mac-checksum"+archiveCounter+"'>Checksum</a></div></div></div><div class='archive-details align-left vertically-center-parent'><div class='vertically-center-child'><!--<div><strong><a href='' class='dark-link' id='archive-changelog"+archiveCounter+"'>Changelog</a></strong></div>--><div><strong>Timestamp: </strong><span id='archive-timestamp"+archiveCounter+"'></span></div><!--<div><strong>Build number: </strong><span id='archive-buildnumber"+archiveCounter+"'></span></div>--><!--<div><strong>Commit: </strong><a href='' class='dark-link' id='archive-commitref"+archiveCounter+"'></a></div>--></div></div></div>");
        archiveList.innerHTML = newArchiveContent;
        // populate the new entry with that release's information
        var publishedAt = (releasesJson[archiveCounter].published_at);
        document.getElementById("archive-release"+archiveCounter).innerHTML = releasesJson[archiveCounter].name;
        document.getElementById("archive-release"+archiveCounter).href = ("https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/" + releasesJson[archiveCounter].name);
        document.getElementById("archive-date"+archiveCounter).innerHTML = moment(publishedAt).format('Do MMMM YYYY');
        //document.getElementById("archive-changelog"+archiveCounter).href = releasesJson[archiveCounter].name;
        document.getElementById("archive-timestamp"+archiveCounter).innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
        //document.getElementById("archive-buildnumber"+archiveCounter).innerHTML = releasesJson[archiveCounter].id;
        //document.getElementById("archive-commitref"+archiveCounter).innerHTML = releasesJson[archiveCounter].name;
        //document.getElementById("archive-commitref"+archiveCounter).href = releasesJson[archiveCounter].name;

        // set the download button links
          // create an array of the details for each binary that is attached to a release
          var assetArray = [];
          var assetCounter = 0;
          releasesJson[archiveCounter].assets.forEach(function() {
            assetArray.push(releasesJson[archiveCounter].assets[assetCounter]);
            assetCounter++;
          });

          // set variables for the HTML elements
          var linuxDlButton = document.getElementById("archive-linux-dl"+archiveCounter);
          var windowsDlButton = document.getElementById("archive-windows-dl"+archiveCounter);
          var macDlButton = document.getElementById("archive-mac-dl"+archiveCounter);
          var linuxPlatformBlock = document.getElementById("linux-platform-block"+archiveCounter);
          var windowsPlatformBlock = document.getElementById("windows-platform-block"+archiveCounter);
          var macPlatformBlock = document.getElementById("mac-platform-block"+archiveCounter);

          // build the download links section with these binaries...

          assetCounter2 = 0;
          assetArray.forEach(function() {     // iterate through the binaries attached to this release
            var nameOfFile = (assetArray[assetCounter2].name);
            var a = nameOfFile.toUpperCase();
            // set the download links for this release
            if(a.indexOf("X64_LINUX") >= 0) {
              document.getElementById("archive-linux-size"+archiveCounter).innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);// display the file size
              document.getElementById("archive-linux-checksum"+archiveCounter).href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "sha256.txt"); // set the checksum link (relies on the checksum having the same name as the binary, but .sha256.txt extension)

              var linuxLink = (assetArray[assetCounter2].browser_download_url);
              linuxDlButton.href = linuxLink; // set the download link
              linuxPlatformBlock.className = linuxPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // make this platform section visible (all platforms are invisible by default)

              // repeated for Windows and Mac
            } else if(a.indexOf("WIN") >= 0) {
              document.getElementById("archive-windows-size"+archiveCounter).innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
              document.getElementById("archive-windows-checksum"+archiveCounter).href = (assetArray[assetCounter2].browser_download_url).replace("zip", "sha256.txt");

              var windowsLink = (assetArray[assetCounter2].browser_download_url);
              windowsDlButton.href = windowsLink;
              windowsPlatformBlock.className = windowsPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );

            } else if(a.indexOf("MAC") >= 0) {
              document.getElementById("archive-mac-size"+archiveCounter).innerHTML = Math.floor((assetArray[assetCounter2].size)/1024/1024);
              document.getElementById("archive-mac-checksum"+archiveCounter).href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "sha256.txt");

              var macLink = (assetArray[assetCounter2].browser_download_url);
              macDlButton.href = macLink;
              macPlatformBlock.className = macPlatformBlock.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
            }
            assetCounter2++;
          });

        // show the new entry
        var container = document.getElementById(archiveCounter);
        container.className += " animated fadeIn"; // add the fade animation
        container.className = container.className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // remove the 'hide' class immediately afterwards
        // iterate to the next archive entry
        archiveCounter++;

      });
    } else { // if there are no releases (beyond the latest one)...
      // report an error
      errorContainer.innerHTML = "<p>There are no archived releases yet! See the <a href='./releases.html'>Latest release</a> page.</p>";
      document.getElementById("archive-loading").innerHTML = "";
    }
  });
}
