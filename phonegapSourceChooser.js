/*  Figure out what platform we're running on, then insert the proper filename
    to be the JS file we include. */

var userAgent = navigator.userAgent;
var thePlatform;

if((userAgent.indexOf("iPad")!=-1)||(userAgent.indexOf("iPhone")!=-1)||(userAgent.indexOf("iPod")!=-1)) {
    
    thePlatform = "iOS";
    
}

if((userAgent.indexOf("Android")!=-1)) {
    
    thePlatform = "android";
    
}

var filename = "phonegap-1.0.0-" + thePlatform + ".js";

var fileref=document.createElement('script');
fileref.setAttribute("type","text/javascript");
fileref.setAttribute("src", filename);
document.getElementsByTagName("head")[0].appendChild(fileref);
