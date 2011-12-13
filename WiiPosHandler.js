/**
 * Phonegap MyPlugin Instance plugin
 * Copyright (c) Nimish Nayak 2011
 *
 */

var WiiPosition = {
	nativeFunction: function(types, success, fail) {
		return PhoneGap.exec(success, fail, "WiiPosHandler", "getPosition", types);
	}
};

var WiiConnect = {
nativeFunction: function(types, success, fail) {
    return PhoneGap.exec(success, fail, "WiiPosHandler", "connect", types);
}
};

var WiiDisconnect = {
nativeFunction: function(types, success, fail) {
    return PhoneGap.exec(success, fail, "WiiPosHandler", "disconnect", types);
}
};


function wiiGetPosition()
{
    WiiPosition.nativeFunction(
                               [storedPosition] ,
                               function(result) {
                               storedPosition = result;
                               //alert("Success : \r\n"+result);
                               },
                               function(error) {
                               alert("Error : \r\n"+error);
                               }
                               );
}
function wiiConnect()
{
    WiiConnect.nativeFunction(
                              [storedPosition] ,
                              function(result) {
                              storedPosition = result;
                              //alert("Success : \r\n"+result);
                              },
                              function(error) {
                              //alert("FUCK");
                              alert("Error : \r\n"+error);
                              }
                              );
}
function wiiDisconnect()
{
    WiiDisconnect.nativeFunction(
                                 [storedPosition] ,
                                 function(result) {
                                 storedPosition = result;
                                 //alert("Success : \r\n"+result);
                                 },
                                 function(error) {
                                 alert("Error : \r\n"+error);
                                 }
                                 );
}

var storedPosition = "50";
