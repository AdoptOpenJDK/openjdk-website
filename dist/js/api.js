var repo = "openjdk-releases";
var extension = window.location.hash;
var assetCounter2 = 0;

loadRequest(repo, extension);

function loadAPIJSON(repo, extension, callback) {
  var url = ("https://api.github.com/repos/AdoptOpenJDK/" + repo + "/releases");
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', url, true);
  xobj.onreadystatechange = function() {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    } else {
      if(xobj.status != "200") {
        return "Error: there is a problem accessing the GitHub API.";
      }
    }
  };
  xobj.send(null);
}

function loadRequest(repo, extension) {
  loadAPIJSON(repo, extension, function(response) {
    var outputJSON = [];

    function checkIfProduction(x) {
      return x.prerelease === false && x.assets[0];
    }
    var releasesJson = JSON.parse(response).filter(checkIfProduction);
    // Edit releasesJson based on the user's query:
    // if the user has searched for the latest release or a specific release, search for that release. Else, return all releases.
    if(extension.indexOf("release=latest") >=0 ) {
        releasesJson = [(releasesJson[0])];

    } else if(extension.indexOf("release=") >=0 ) {
      var searchedNameBegin = (extension.indexOf("release=")) + 8;
      var searchedName = extension.slice(searchedNameBegin);
      function selectReleaseByName(x) {
        return x.name == searchedName;
      }
      var indexOfRelease = (releasesJson.findIndex(selectReleaseByName));
      if(indexOfRelease == -1) {
        return ("Error: there is not a release with the name " + searchedName);
      } else {
        releasesJson = [releasesJson[indexOfRelease]];
      }
    }

    // if there are releases...
    if (typeof releasesJson[0] !== 'undefined') {

      // for each release in releasesJson, add custom information to a new custom JSON file.
      var releaseCounter = 0;
      releasesJson.forEach(function() {
        var publishedAt = (releasesJson[releaseCounter].published_at);

        var releaseName = releasesJson[releaseCounter].name;
        var timestamp = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
        var changelog = releasesJson[releaseCounter].name;
        var buildNumber = releasesJson[releaseCounter].id;
        var commitRef = releasesJson[releaseCounter].name;

        var releaseObj = new Object();
        releaseObj.release_name = releaseName;
        releaseObj.timestamp = timestamp;
        releaseObj.changelog = changelog;
        releaseObj.build_number = buildNumber;
        releaseObj.commit_reference = commitRef;
        releaseObj.binaries = [];

        // create an array of the details for each binary that is attached to a release:
        var assetArray = [];
        var assetCounter = 0;
        releasesJson[releaseCounter].assets.forEach(function() {
          assetArray.push(releasesJson[releaseCounter].assets[assetCounter]);
          assetCounter++;
        });

        var filteredAssets = [];

        assetCounter2 = 0;
        assetArray.forEach(function() {     // iterate through the binaries attached to this release, creating an object for each
          var nameOfFile = (assetArray[assetCounter2].name);
          var a = nameOfFile.toUpperCase();
          // set the download links for this release
          if(a.indexOf("LINUX") >= 0) {
            var linux_binary = new Object();
            linux_binary.name = (assetArray[assetCounter2].name);
            linux_binary.platform = "Linux";
            linux_binary.size = ((Math.floor((assetArray[assetCounter2].size)/1024/1024)) + "MB");
            linux_binary.download_url = (assetArray[assetCounter2].browser_download_url);
            linux_binary.checksum = assetArray[assetCounter2].name;
            if(extension.indexOf("platform=") >=0 && extension.indexOf("platform=linux") ==-1) {
              //
            } else {
              filteredAssets.push(linux_binary);
            }

          } else if(a.indexOf("WIN") >= 0) {
            var windows_binary = new Object();
            windows_binary.name = (assetArray[assetCounter2].name);
            windows_binary.platform = "Windows";
            windows_binary.size = ((Math.floor((assetArray[assetCounter2].size)/1024/1024)) + "MB");
            windows_binary.download_url = (assetArray[assetCounter2].browser_download_url);
            windows_binary.checksum = assetArray[assetCounter2].name;
            if(extension.indexOf("platform=") >=0 && extension.indexOf("platform=windows") ==-1) {
              //
            } else {
              filteredAssets.push(windows_binary);
            }

          } else if(a.indexOf("MAC") >= 0) {
            var mac_binary = new Object();
            mac_binary.name = (assetArray[assetCounter2].name);
            mac_binary.platform = "Mac";
            mac_binary.size = ((Math.floor((assetArray[assetCounter2].size)/1024/1024)) + "MB");
            mac_binary.download_url = (assetArray[assetCounter2].browser_download_url);
            mac_binary.checksum = assetArray[assetCounter2].name;
            if(extension.indexOf("platform=") >=0 && extension.indexOf("platform=mac") ==-1) {
              //
            } else {
              filteredAssets.push(mac_binary);
            }
          }

          releaseObj.binaries = filteredAssets; // add the assets that suit the user's query to releaseObj.binaries

          assetCounter2++;
        });

        // add this releaseObj to outputJSON, if there are binaries matching the user request
        if(releaseObj.binaries[0]){
          outputJSON.push(releaseObj);
        }

        releaseCounter++;

      });

      // display this JSON

      var prettified = (JSON.stringify(outputJSON, undefined, 2))

      var blob = new Blob([prettified], {type: 'text/json'}),
      e    = document.createEvent('MouseEvents'),
      a    = document.createElement('a')

      //a.download = "api.json";
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
      e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);

    } else {
      return "Error: there is a problem accessing releases via the GitHub API.";
    }
  });
}
