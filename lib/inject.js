// var ipc = require('ipc');
// var authButton = document.getElementById('auth-button');
// authButton.addEventListener('click', function(){
//     ipc.send('invokeAction', 'someData');
//     ipc.on('actionReply', function(response){ // would it be possible to use .once here? Does someone know?
//         processResponse(response);
//     })
// });
console.log("Yellow");
process.once('loaded', function() {
	console.log('HelloWorld');
});

// In renderer process (web page).
// var ipcRenderer = require('ipc');
var ipcRenderer = require("electron").ipcRenderer;
// const ipcRenderer = require('electron').ipcRenderer;
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

ipcRenderer.on('asynchronous-reply', function(event, arg) {
  console.log(arg); // prints "pong"
});
ipcRenderer.send('asynchronous-message', 'ping');

// console.log('INJECT JS!')

// // // preload.js
// // var _setImmediate = setImmediate;
// // var _clearImmediate = clearImmediate;
// // process.once('loaded', function() {
// // 	console.log('INJECT JS!')
// //   global.setImmediate = _setImmediate;
// //   global.clearImmediate = _clearImmediate;
// // });

// // // var _ = require('underscore');
// // // var AllInputs, Inputs, re;
// // // re = new RegExp(/unsubscribe/gi);
// // // AllInputs = document.querySelectorAll('input');
// // // console.log('AllInputs');
// // // console.log(AllInputs);

// // __InjectJS = {
// //     HelloWorld: function() {
// //     	console.log('INJECT JS!')
// //       // return document.getElementById('movie_player')
// //       return;
// //     }
// //     // ,pauseVideo: function(){
// //     //     var t=__myYoutubeTools
// //     //     t.clearPNSTo()
// //     //     t.getMP().pauseVideo()
// //     //     t.isPaused=true
// //     // }
// //     // ,playVideo: function(){
// //     //     var t=__myYoutubeTools
// //     //     t.clearPNSTo()
// //     //     t.getMP().playVideo()
// //     //     t.isPaused=false
// //     // }
// //     // ,clearPNSTo: function(){
// //     //     var t=__myYoutubeTools
// //     //     try{clearTimeout(t.toPNS);}catch(x){}
// //     // }
// //     // ,isPaused: true
// //     // ,toPNS: null
// //     // ,playNpauseVideo: function(){
// //     //     // debugger
// //     //     var t=__myYoutubeTools
// //     //     if(t.isPaused){
// //     //         t.playVideo()
// //     //     }else{
// //     //         t.pauseVideo()
// //     //     }
// //     //     t.toPNS = setTimeout("__myYoutubeTools.playNpauseVideo()",1000);
// //     // }
// // }




// // Minimal Underscore:
// _ = {}

// _.each = function(obj, iteratee, context) {
//   iteratee = optimizeCb(iteratee, context);
//   var i, length;
//   if (isArrayLike(obj)) {
//     for (i = 0, length = obj.length; i < length; i++) {
//       iteratee(obj[i], i, obj);
//     }
//   } else {
//     var keys = _.keys(obj);
//     for (i = 0, length = keys.length; i < length; i++) {
//       iteratee(obj[keys[i]], keys[i], obj);
//     }
//   }
//   return obj;
// };

// // JS Version of Filter
// _.filter = function(obj, predicate, context) {
//   var results = [];
//   predicate = cb(predicate, context);
//   _.each(obj, function(value, index, list) {
//     if (predicate(value, index, list)) results.push(value);
//   });
//   return results;
// };

// var AllInputs, Inputs, re;
// re = new RegExp(/unsubscribe/gi);
// AllInputs = document.querySelectorAll('input');
// console.log('AllInputs');
// console.log(AllInputs);

// Inputs = _.filter(AllInputs, function(selector) {
//   return re.test(selector.value) || re.test(selector.name) || re.test(selector.text);
// });
// console.log('Inputs:');
// console.log(Inputs);