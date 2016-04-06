
var savePlot=null;  // point to the viewer node
var saveY=[];       // Ys values
var saveX=[];       // X value, base on actual_sampling_interval
                    // in seconds
var saveYnorm=[];   // Ys normalized values
var saveTrace=[];   // key/label for the traces
var saveTracking=[];// state of traces being shown (true/false)
var saveColor=[];

var saveYmax=null;
var saveYmin=null;
var saveXmax=null;
var saveXmin=0;

function getColor(idx) {
  var stockColor=[
                'rgba(0, 128, 0, .8)',
                'rgba(152, 0, 0, .8)',
                'rgba(0, 0, 255, .8)',
                'rgba(255, 168, 0, .8)'];
  var tmp=(idx % 4);
  return stockColor[tmp];
}

//http://www.originlab.com/doc/X-Function/ref/cnormalize#Algorithm
function normalizeY(y) {
  var n=[];
  var cnt=y.length;
  var max=Math.max.apply(Math,y);
  var min=Math.min.apply(Math,y);
  var delta=max-min;
  var t;
  for(var i=0;i<cnt;i++) {
    t=(y[i]-min)/(delta); 
    n.push(t);
  }
  return n;
}

// { dataset: { "signal0: [v1, v2...] },
// generate X min,max, in range
// needed actual_sampling_interval:0.4 
//        retention_unit: seconds
//        number of y values:3000
//        Xmin=0; Xmax=(0.4*3000)/60=20minutes
function processForPlotting(blob) {
   var topkeys=getKeys(blob);
   var k=topkeys[0];
window.console.log("get a topkey..",k);
   var dblob=blob[k];
   saveTrace=getKeys(dblob);
   var cnt=saveTrace.length;
   for(var i=0;i<cnt;i++) {
     var k=saveTrace[i];
window.console.log("get just key..",k);
     saveY.push(dblob[k]);
     saveYnorm.push(normalizeY(dblob[k]));
     saveColor.push(getColor(i));
     saveTracking.push(true); //
     //saveXmax=(dblob[k].length>saveXmax)?dblob[k].length:saveXmax;
     var max=Math.max.apply(Math,dblob[k]);
     var min=Math.min.apply(Math,dblob[k]);
     if(saveYmax==null)
        saveYmax=max; 
        else 
           saveYmax=(max>saveYmax)?max:saveYmax;
     if(saveYmin==null)
        saveYmin=min; 
        else 
           saveYmin=(min>saveYmin)?saveYmin:min;
     saveXmin=0;
     saveXmax=(0.4*3000)/60;
     saveX=Array.apply(0, Array(3000)).map(function(_,b) 
     { return((0.4/60) * b); });
     window.console.log(saveX.length);
     window.console.log(saveX);
     window.console.log("y min, max",saveYmin, saveYmax);
     window.console.log("x min, max",saveXmin, saveXmax);
   }
}

// initial set
function addLineChart(blob) {
  // returns, Y-array, array-length, array-names
  var _y=saveY;
  var _keys=saveTrace;
  var _colors=saveColor;

  var _data=getLinesAt(_y,_keys,_colors);
  var _layout=getLinesDefaultLayout();

  savePlot=addAPlot('#myViewer',_data, _layout,600,500);
}

function updateLineChart() {
  $('#myViewer').empty();
  var cnt=saveTracking.length; 
  var _y=[];
  var _colors=[];
  var _keys=[];

  for(var i=0;i<cnt;i++) {
     if(saveTracking[i]==true) {
       if(showNormalize==true) { 
         _y.push(saveYnorm[i]);
         } else {
           _y.push(saveY[i]);
       }
       _colors.push(getColor(i));
       _keys.push(saveTrace[i]);
       } else {
     }
  }
  var _data=getLinesAt(_y,_keys,_colors);
  var _layout=getLinesDefaultLayout();
  savePlot=addAPlot('#myViewer',_data, _layout,600,500);
}

//IMPT6620_NTX_E2-3_012216-SIGNAL01
//^^^^^^^^^^^^^^^^^ sample name
function shortName(trace) {
var n = trace.indexOf("_NTX_");
if(n > 0) 
   return trace.substring(0,n);
return trace;
}

function makeOne(y,trace,color) {
  var len=y.length;
  var marker_val = { 'size':10, 'color':color};
  var t= { "x":saveX, "y":y, "name":shortName(trace), "marker": marker_val, 
           "type":"scatter" };
  return t;
}

function getLinesAt(y,trace,color) {
  var cnt=y.length;
  var data=[];
  for (var i=0;i<cnt; i++) {
    data.push(makeOne(y[i],trace[i],color[i])); 
  }
  return data;
}

function getLinesDefaultLayout(){
  var tmp;
  if(showNormalize==true)
     tmp={ "title":"Signal","range":[0,1] };
     else  
       tmp={ "title":"Signal","range":[ saveYmin,saveYmax] };

  var p= {
        "width": 600,
        "height": 400,
        "xaxis": {"title":"Time(min)",
                  "range":[0,20],
                  "type":"linear"
                 },
        "yaxis": tmp,
        };
  return p;
}

function addAPlot(divname, data, layout, w, h) {
  var d3 = Plotly.d3;
  var gd3 = d3.select(divname)
    .append('div')
    .style({
        width: w,
        height: h,
        visibility: 'inherit'
    });

  var gd = gd3.node();
  Plotly.newPlot(gd, data, layout);
  return gd;
}

function getAPlot(divname) {
  var d3 = Plotly.d3;
  var gd3 = d3.select(divname);
  var gd = gd3.node();
  return gd;
}

/***
function deleteTrace(which) {
  var idx=saveTrace.indexOf(which);
  window.console.log("delete a trace..");
  Plotly.deleteTraces(savePlot, idx);
}
***/

function toggleTrace(idx) {
  saveTracking[idx] = !saveTracking[idx];
  // rebuilt the plot
  updateLineChart();
}
