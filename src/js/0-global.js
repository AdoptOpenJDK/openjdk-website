// set header logos to link to home
document.getElementById('logo').onclick = function() {
  window.location.href = "./index";
}

// set value for error container on every page
var errorContainer = document.getElementById('error-container');

// returns the name of the user's OS.
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

// pass in the name of the repo (within this organisation only)
function loadReleasesJSON(repo, loading, callback) {
  if(msieversion() == true) {
    loading.innerHTML = "";
    document.getElementById("error-container").innerHTML = "<p>Internet Explorer is not supported. Please use another browser, or see the <a href='https://github.com/breadbin/releases/releases' target='blank'>releases list on GitHub</a>.</p>";
  }
  else {
    var url = ("https://api.github.com/repos/breadbin/" + repo + "/releases");
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
          document.getElementById("error-container").innerHTML = "<p>Error... there's a problem fetching the releases. Please see the <a href='https://github.com/breadbin/releases/releases' target='blank'>releases list on GitHub</a>.</p>";
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
