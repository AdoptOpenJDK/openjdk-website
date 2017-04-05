// When nightly page loads, run:
/* eslint-disable no-unused-vars */
function onNightlyLoad() {
  /* eslint-enable no-unused-vars */

  populateNightly(); // run the function to populate the table on the Nightly page.

  // logic for the realtime search box:
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

      nightlyList.innerHTML = ("<thead><tr id='table-header'><th>Release</th><th>Platform</th><th>Downloads</th><th>Release details</th></tr></thead>");

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
          var a = nameOfFile.toUpperCase(); // make the name of the binary uppercase

          if(a.indexOf(".ZIP") >= 0 || a.indexOf(".TAR.GZ") >= 0) { // TODO: this should search a list of accepted file extensions, not be hard-coded, abstracted instead

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

            // populate the new entry with that release's information
            var publishedAt = (releasesJson[nightlyReleaseCounter].published_at);
            document.getElementById("nightly-release"+tableRowCounter).innerHTML = (releasesJson[nightlyReleaseCounter].name).slice(0, 12); // the release name, minus the timestamp
            document.getElementById("nightly-release"+tableRowCounter).href = ("https://github.com/AdoptOpenJDK/openjdk-nightly/releases/tag/" + releasesJson[nightlyReleaseCounter].name) // the link to that release on GitHub
            document.getElementById("nightly-date"+tableRowCounter).innerHTML = moment(publishedAt).format('Do MMMM YYYY'); // the timestamp converted into a readable date
            //document.getElementById("nightly-changelog"+tableRowCounter).href = releasesJson[nightlyReleaseCounter].name; // TODO: WAITING FOR THE LINKS TO BE AVAILABLE. the link to the release changelog
            document.getElementById("nightly-timestamp"+tableRowCounter).innerHTML = (releasesJson[nightlyReleaseCounter].name).slice(13, 25); // the timestamp section of the build name
            //document.getElementById("nightly-buildnumber"+tableRowCounter).innerHTML = releasesJson[nightlyReleaseCounter].id; // TODO: currently this is the release ID
            //document.getElementById("nightly-commitref"+tableRowCounter).innerHTML = releasesJson[nightlyReleaseCounter].name; // TODO: WAITING FOR THE INFO TO BE AVAILABLE.
            //document.getElementById("nightly-commitref"+tableRowCounter).href = releasesJson[nightlyReleaseCounter].name; // TODO: WAITING FOR THE LINKS TO BE AVAILABLE.

            // TODO: this should be abstracted - a global function should be able to search the filename for different content and return the correct platform name.
            if(a.indexOf("S390X_LINUX") >= 0) {
              document.getElementById("platform-block"+tableRowCounter).innerHTML = "Linux s390x";
            } else if(a.indexOf("X64_LINUX") >= 0) {
              document.getElementById("platform-block"+tableRowCounter).innerHTML = "Linux x86-64";
            } else if (a.indexOf("WIN") >= 0) {
              document.getElementById("platform-block"+tableRowCounter).innerHTML = "Windows";
            } else if (a.indexOf("MAC") >= 0) {
              document.getElementById("platform-block"+tableRowCounter).innerHTML = "macOS";
            }

            var fileExtension = "tar.gz"; // TODO: this should not be hard-coded - it should use an abstracted function, such as 'getFileExt(platform);'

            // set the contents of this table row
            dlButton.innerHTML = (fileExtension + " (" + (Math.floor((assetArray[assetCounter2].size)/1024/1024)) + " MB)"); // display the file type and the file size
            document.getElementById("nightly-checksum"+tableRowCounter).href = (assetArray[assetCounter2].browser_download_url).replace(fileExtension, "sha256.txt"); // set the checksum link (relies on the checksum having the same name as the binary, but .sha256.txt extension)
            var link = (assetArray[assetCounter2].browser_download_url);
            dlButton.href = link; // set the download link

            // show the new row
            var trElement = document.getElementById(tableRowCounter);
            trElement.className += " animated fadeIn"; // add the fade animation
            trElement.className = trElement.className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // remove the 'hide' class immediately afterwards

            tableRowCounter++;
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
  });
}
