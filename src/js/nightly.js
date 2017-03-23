var assetCounter2 = 0;
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
      var nightlyCounter = 0;
      nightlyList.innerHTML = ("<thead><tr id='table-header'><th>Release</th><th>Linux</th><th>Windows</th><th>Mac</th><th>Release details</th></tr></thead>");
      releasesJson.forEach(function() {

        // get the current content of the nightly list div
        var currentNightlyContent = nightlyList.innerHTML;

        // add an empty, hidden HTML template entry to the current nightly list, with the nightlyCounter suffixed to every ID
        // to change the HTML of the nightly table rows/cells, you must change this template.
        var newNightlyContent = currentNightlyContent += ("<tr class='nightly-container hide' id='"+nightlyCounter+"'> <td class='nightly-header'> <div><strong><a href='' id='nightly-release"+nightlyCounter+"' class='dark-link' target='blank'></a></strong></div> <div class='divider'> | </div> <div id='nightly-date"+nightlyCounter+"'></div> </td> <td id='linux-platform-block"+nightlyCounter+"' class='nightly-platform-block'><div id='nightly-linux-dl-content"+nightlyCounter+"' class='invisible'><a class='dark-link' href='' id='nightly-linux-dl"+nightlyCounter+"'></a> <div class='divider'> | </div> <a href='' class='dark-link' id='nightly-linux-checksum"+nightlyCounter+"'>Checksum</a></div> </td> <td id='windows-platform-block"+nightlyCounter+"' class='nightly-platform-block'><div id='nightly-windows-dl-content"+nightlyCounter+"' class='invisible'><a class='dark-link' href='' id='nightly-windows-dl"+nightlyCounter+"'></a> <div class='divider'> | </div> <a href='' class='dark-link' id='nightly-windows-checksum"+nightlyCounter+"'>Checksum</a> </div></td> <td id='mac-platform-block"+nightlyCounter+"' class='nightly-platform-block'><div id='nightly-mac-dl-content"+nightlyCounter+"' class='invisible'><a class='dark-link' href='' id='nightly-mac-dl"+nightlyCounter+"'></a> <div class='divider'> | </div> <a href='' class='dark-link' id='nightly-mac-checksum"+nightlyCounter+"'>Checksum</a> </div></td> <td class='nightly-details'> <div><strong><a href='' class='dark-link' id='nightly-changelog"+nightlyCounter+"'>Changelog</a></strong></div> <div class='divider'> | </div> <div><strong>Timestamp: </strong><span id='nightly-timestamp"+nightlyCounter+"'></span></div> <div class='divider'> | </div> <div><strong>Build number: </strong><span id='nightly-buildnumber"+nightlyCounter+"'></span></div> <div class='divider'> | </div> <div><strong>Commit: </strong><a href='' class='dark-link' id='nightly-commitref"+nightlyCounter+"'></a></div> </td> </tr>");

        // update the HTML container element with this new content
        nightlyList.innerHTML = newNightlyContent;

        // populate the new entry with that release's information
        var publishedAt = (releasesJson[nightlyCounter].published_at);
        document.getElementById("nightly-release"+nightlyCounter).innerHTML = (releasesJson[nightlyCounter].name).slice(0, 12); // the release name, minus the timestamp
        document.getElementById("nightly-release"+nightlyCounter).href = ("https://github.com/AdoptOpenJDK/nightly/releases/tag/" + releasesJson[nightlyCounter].name) // the link to that release on GitHub
        document.getElementById("nightly-date"+nightlyCounter).innerHTML = moment(publishedAt).format('Do MMMM YYYY'); // the timestamp converted into a readable date
        document.getElementById("nightly-changelog"+nightlyCounter).href = releasesJson[nightlyCounter].name; // TO-DO: WAITING FOR THE LINKS TO BE AVAILABLE. the link to the release changelog
        document.getElementById("nightly-timestamp"+nightlyCounter).innerHTML = (releasesJson[nightlyCounter].name).slice(13, 25); // the timestamp section of the build name
        document.getElementById("nightly-buildnumber"+nightlyCounter).innerHTML = releasesJson[nightlyCounter].id; // currently this is the release ID
        document.getElementById("nightly-commitref"+nightlyCounter).innerHTML = releasesJson[nightlyCounter].name; // TO-DO: WAITING FOR THE INFO TO BE AVAILABLE.
        document.getElementById("nightly-commitref"+nightlyCounter).href = releasesJson[nightlyCounter].name; // TO-DO: WAITING FOR THE LINKS TO BE AVAILABLE.

        // set the download button links
          // create an array of the details for each binary that is attached to a release
          var assetArray = [];
          var assetCounter = 0;
          releasesJson[nightlyCounter].assets.forEach(function() {
            assetArray.push(releasesJson[nightlyCounter].assets[assetCounter]);
            assetCounter++;
          });

          // set variables for HTML elements.
          var linuxDlButton = document.getElementById("nightly-linux-dl"+nightlyCounter);
          var windowsDlButton = document.getElementById("nightly-windows-dl"+nightlyCounter);
          var macDlButton = document.getElementById("nightly-mac-dl"+nightlyCounter);
          var linuxDlContent = document.getElementById("nightly-linux-dl-content"+nightlyCounter);
          var windowsDlContent = document.getElementById("nightly-windows-dl-content"+nightlyCounter);
          var macDlContent = document.getElementById("nightly-mac-dl-content"+nightlyCounter);

          // build the download links section with the array of binaries...

          assetCounter2 = 0;
          assetArray.forEach(function() {     // for each binary attached to this release...
            var nameOfFile = (assetArray[assetCounter2].name);
            var a = nameOfFile.toUpperCase(); // make the name of the binary uppercase
            // set the download links for this release
            if(a.indexOf("LINUX") >= 0) { //
              linuxDlButton.innerHTML = ("tar.gz (" + (Math.floor((assetArray[assetCounter2].size)/1024/1024)) + " MB)"); // display the file type and the file size
              document.getElementById("nightly-linux-checksum"+nightlyCounter).href = (assetArray[assetCounter2].browser_download_url).replace("tar.gz", "txt"); // set the checksum link (relies on the checksum having the same name as the binary, but .txt extension)
              var linuxLink = (assetArray[assetCounter2].browser_download_url);
              linuxDlButton.href = linuxLink; // set the download link
              linuxDlContent.className = linuxDlContent.className.replace( /(?:^|\s)invisible(?!\S)/g , '' ); // make this platform section visible (all platforms are invisible by default)

              // repeated for Windows and Mac
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
        container.className += " animated fadeIn"; // add the fade animation
        container.className = container.className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // remove the 'hide' class immediately afterwards
        // iterate to the next nightly entry
        nightlyCounter++;

      });
    } else { // if there are no releases...
      // report an error
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      document.getElementById("nightly-loading").innerHTML = ""; // remove the loading dots
    }
  });
}
