//
// Usage example:
//  http://localhost/sec-viewer/view.html?
//     http://localhost/data/SEC/IMPT4825_NTX_E2-3_020216.json
//
//  http://localhost/plotly/view.html?
//     url=http://localhost/data/plotly/IMPT4825_NTX_E2-3_020216.json&baseline=0
//


// GLOBAL tracking
var showNormalize=false;
var saveBaseline=0;
var saveBlob=null;
var saveFirst=false;

// initial setup on the plot
var init_baseline=saveBaseline;

function toggleNormalize() {
  showNormalize = ! showNormalize;
  if(showNormalize) {
    jQuery('#normalizeBtn').prop('color','red');
    } else {
      jQuery('#normalizeBtn').prop('color','green');
  }
}


function processArgs(args) {
  var url="";
  var params = args[1].split('&');
  for (var i=0; i < params.length; i++) {
    var param = unescape(params[i]);
    if (param.indexOf('=') == -1) {
      url=param.replace(new RegExp('/$'),'').trim();
      } else {
        var kvp = param.split('=');
        switch (kvp[0].trim()) {
          case 'url':
             {
             url=kvp[1].replace(new RegExp('/$'),'').trim();
             break;
             }
          case 'baseline':
             {
             var t=parseInt(kvp[1]);
             if(!isNaN(t))
               init_baseline=t;
             }
       }
    }
  }
  return url;
}


// should be a very small file and used for testing and so can ignore
// >>Synchronous XMLHttpRequest on the main thread is deprecated
// >>because of its detrimental effects to the end user's experience.
function ckExist(url) {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState == 4) {
 // okay
    }
  }
  http.open("GET", url, false);
  http.send();
  if(http.status !== 404) {
    return http.responseText;
    } else {
      return null;
  }
};

// directly from SEC cdf signal files
function loadBlobFromJsonFile(fname) {
  var tmp=ckExist(fname);
  var blob=(JSON.parse(tmp));
  return blob;
}

// initial plot to display
function reset2InitPlot() {
  blob=saveBlob;
//XXX  do some resetting
  displayInitPlot(blob);
}

// under chaise/angular, the plot window has
// width/height=0 when accordian-group is-open=false
window.onresize=function() {
   if(enableEmbedded) {
     if(saveFirst) {
       reset2InitPlot();
       saveFirst=false;
     }
   }
}
// initial plot to display
function displayInitPlot(blob) {
   addLineChart(blob);
}

/*****MAIN*****/
jQuery(document).ready(function() {

$('.trace-list-select2').select2({theme:"classic"});

  // defaults from viewer-user.js
  init_baseline=saveBaseline;

  var args=document.location.href.split('?');
//http://localhost/plotly/view.html?http://localhost/data/plotly/inf_072514.EP5.json
  if (args.length === 2) {
    var url=processArgs(args);
    var blob=loadBlobFromJsonFile(url);
    var dataKeys=setupUI(blob);
    saveBlob=blob;
    } else {
    window.console.log("BADDDDD");    
  }

   $('#trace-list').change(function() {
     var trace = document.getElementById("trace-list").value;
     deleteTrace(trace);
     window.console.log("trace-list got updated...");
   })

   if(!enableEmbedded) {
     displayInitPlot(saveBlob);
   }
})


