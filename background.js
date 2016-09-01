var version   = (navigator.userAgent.search(/(Firefox)/) > 0) ? browser.runtime.getManifest().version : chrome.app.getDetails().version;
var verFromBD = localStorage.version;



// if version updated
if (verFromBD != version) {
	
	console.log('Version update from '+verFromBD+' to '+version);

	if (localStorage.sites) {
		var sites = JSON.parse(localStorage.sites);
		for(var i in sites) {
			if (sites[i].order === undefined) {
				sites[i].order = i;
				console.log('updating', i);
			}
		}
		localStorage.sites = JSON.stringify(sites);
	}
	
	
	
	localStorage.version = version;
}




// first run - set def 
var defSettings = {
	'useMasterpass' : false, 
	'masterpass' : '', 
	'version' : 0,
	'hide_login' : true,
	'hide_predic' : false,
	'convcurrency' : 'noconv'
};
if (!localStorage.settings) localStorage.setItem('settings', JSON.stringify(defSettings));
if (!localStorage.WMZtoWMR) localStorage.setItem('WMZtoWMR', 0)
if (!localStorage.WMRtoWMZ) localStorage.setItem('WMRtoWMZ', 0);

// Get exchange course
window.setTimeout(function() {

 	$.ajax({
		type: "POST",
		url: "https://wmeng.exchanger.ru/asp/XMLWMList.asp?exchtype=2",
		dataType: 'html'
	}).done(function( html ) {
		
		var parser = new DOMParser;
		var tmpDom = parser.parseFromString(html, "text/xml");
		
		var WMRtoWMZ = tmpDom.querySelector('WMExchnagerQuerys query:first-of-type');
		if (WMRtoWMZ) {
			WMRtoWMZ = parseFloat(WMRtoWMZ.getAttribute('inoutrate').replace(',', '.'));
		} else {
			console.log('error parse WMRtoWMZ');
		}
		
		
		console.log('WMRtoWMZ', WMRtoWMZ);
		localStorage.setItem('WMRtoWMZ', WMRtoWMZ);
	}); 
	
	
	
	$.ajax({
		type: "GET",
		url: "https://wmeng.exchanger.ru/asp/XMLWMList.asp?exchtype=1",
		dataType: 'html'
	}).done(function( html ) {
		
		var parser = new DOMParser;
		var tmpDom = parser.parseFromString(html, "text/xml");
		
		var WMZtoWMR = tmpDom.querySelector('WMExchnagerQuerys query:first-of-type');
		if (WMZtoWMR) {
			WMZtoWMR = 1 / parseFloat(WMZtoWMR.getAttribute('outinrate').replace(',', '.')); 
		} else {
			console.log('error parse WMZtoWMR');
		}
		
		console.log('WMZtoWMR', WMZtoWMR);
		localStorage.setItem('WMZtoWMR', WMZtoWMR);
	});
	
}, 4*1000);






