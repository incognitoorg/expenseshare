var debugMode = false;
var isCorporate = false;
var theme="default";

if(localStorage.getItem('theme')){
	theme = localStorage.getItem('theme');
}
oldconsolelog=console.log;

console.log=function(){
    if(debugMode){
        oldconsolelog.apply(this, arguments);
    }
};