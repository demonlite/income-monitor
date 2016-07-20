"use strict"



var mySession = [];
var listenReqId = [];

var modyfHeadersArr = {};
var addCookieArr = {};

var engine = {};
var settings = {};
var tableBuffer = {};

var salt = 'fc9a5b4e1c0cce50ad8008cfd205784f';
var symAfretDot = 2; // Symbols after comma in table
var dataCacheTime = 100*60*1000; // Expire time of cached data

var version = (navigator.userAgent.search(/(Firefox)/) > 0) ? browser.runtime.getManifest().version : chrome.app.getDetails().version;



function toHexString2(bytes) {
	var storedSubKeyString = '';
	var hexChar = '0123456789abcdef'.split('');
	for (var i = 1; i < bytes.length; i++) {
		if (i > 0 && i > 16) {
			storedSubKeyString += hexChar[(bytes[i] >> 4) & 0x0f] + hexChar[bytes[i] & 0x0f];
		}
	}
	return storedSubKeyString;
}


/* function myEncrypt(pass, text) {
	var aesCtr = new aesjs.ModeOfOperation.ctr(sha256.pbkdf2(pass, salt, 100, 32), new aesjs.Counter(10));
	return aesCtr.encrypt(aesjs.util.convertStringToBytes(text));
}

function myDecrypt(pass, encryptedBytes) {
	var aesCtr = new aesjs.ModeOfOperation.ctr(sha256.pbkdf2(pass, salt, 100, 32), new aesjs.Counter(10));
	return aesjs.util.convertBytesToString(aesCtr.decrypt(encryptedBytes));
}




function save() {
	
	var shaObj = new jsSHA("SHA-256", "TEXT");
	shaObj.update("pass");
	var masterpass = shaObj.getHash("HEX");
	
 	localStorage.settings = JSON.stringify({
		'useMasterpass' : true, 
		'masterpass' : masterpass
	});
} */








// Add to Date
Date.prototype.daysInMonth = function() {
	return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
};

// remove from string "$", ","
String.prototype.clearCurrency = function() {
	//return this.replace(/,/, '.').replace(/\$|,|\s/g, "").trim();
	return this.replace(/,/, '.').replace(/\$|,|\s|руб/g, "").trim();
};


// merge 2 obj by extending
function extend2(destination, source) {
	var res = destination;
	for (var property in source)
		res[property] = source[property];
	return res;
}





function curDayOfMonth() {
	var date = new Date();
	return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

// return first day of this month
function firstDayOfMonth(format) {
	var date = new Date();
	if (format === 'YYYY-MM-DD') return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-01';
	if (format === 'DD-MM-YYYY') return '01-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() ;
}

// return last day of this month
function lastDayOfMonth() {
	var date = new Date();
	return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' +  (33 - new Date(date.getFullYear(), date.getMonth(), 33).getDate());
}

function echoDate(template, date) {
	if (date === 'lastDayThisMonth') {
		date = new Date();
		date.setDate(33 - new Date(date.getFullYear(), date.getMonth(), 33).getDate());
	}
	if (date === 'firstDayThisMonth') {
		date = new Date();
		date.setDate(1);
	}
	var date = date || new Date();
	if (template === 'D') return date.getDate(); 
	if (template === 'DD') return ('0' + date.getDate()).slice(-2); 
	if (template === 'M') return date.getMonth() + 1; 
	if (template === 'MM') return ('0' + (date.getMonth() + 1)).slice(-2); 
	if (template === 'YYYY') return date.getFullYear(); 
	if (template === 'YYYY-MM-DD') return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2); 
};







// Translate interface to user locale
function locale() {
	$('[data-lang]').each(function(ind, elem) {
		var langKey = elem.getAttribute('data-lang');
		var newText = chrome.i18n.getMessage(langKey);
		//console.log('lang', langKey, newText);
		if (newText) elem.innerText = newText;
	});
	
	var elem = document.querySelector('[placeholder="search site"]');
	var newText = chrome.i18n.getMessage('search_site');
	if (newText) elem.placeholder = newText;
	
	var elem = document.querySelector('[value="Apply"]');
	var newText = chrome.i18n.getMessage('apply');
	if (newText) elem.value = newText;
	
	// print extension version
	document.getElementsByClassName('ver')[0].innerText = version;

}


// save settings to localStorage
function saveOptions(data) {
	//console.log('saveOptions data', data);

	settings = $.extend(settings, data);
	localStorage.setItem('settings', JSON.stringify(settings));
} 


function addStyleSheet(styleId) {
	var style  = document.createElement('style');
	style.type = 'text/css';
	style.id   = styleId || 'ext_runtime_ss';
	return document.getElementsByTagName('head')[0].appendChild(style).sheet;
	//return document.styleSheets[document.styleSheets.length - 1];
}

function addStyle(ss, sel, rule) {
	if (ss.addRule) {
		ss.addRule(sel, rule); 
	} else { 
		if (ss.insertRule) { 
			ss.insertRule(sel + ' {' + rule + '}', ss.cssRules.length); 
		}
	}
}

// print in console.log from site engines
function log() {
	var agr = [].slice.call(arguments, 0);
	console.log(this.sitename + ': ', agr);
}




function myRequest(opt) {
	
	if (!opt) return;
	
	var id =  ++myRequest.counter;
	var def = {
		type: "GET",
		dataType: 'html',
		fail: function() {},
	};
	
	// if headers is set - store it for for inject in request in onBeforeSendHeaders function
	if (opt.headers) modyfHeadersArr[id] = opt.headers;
	
	
	if (opt.cookies) addCookieArr[id] = opt.cookies;


	
	$.ajax({
		type: opt.type,
		url : opt.url,
		data: opt.data,
		headers: {
			'X-request-afftbl-id' : id  // this header will be removed in onBeforeSendHeaders
		},
		dataType: opt.dataType,
		success: opt.success
	}).fail(
		opt.fail
	);
}
myRequest.counter = 0;



function getCacheName(sitekey, login) {
	var akey = aesjs.util.convertStringToBytes(sitekey + login);
	var pb = sha256.pbkdf2(akey, [], 0, 20);
	return 'cache_'+toHexString2(pb);
}




// main funtction - 1.prepare table 2.requere balance from all sites and put result to table
function fillTable() {
	console.log('fillTable');
	//return;

	// process result of getBalance()
	var procGB = function(result, sitekey, login, fromCache) {
		console.log('processGetBalance', result, sitekey, login);
		
		var fromCache = fromCache || false;
		var roles = 'today yesterday month predic balance'.split(' ');
		var hash = sitekey + '_#_' +login;
		
		if (result.error) {
			if (result.error === 'INVALID_PASS') {
				// WRITE A CODE!
			}
			return;
		}
		
		
		// prepare tableBuffer
		if (!tableBuffer[hash]) tableBuffer[hash] = {
			'month' : '...',
			'yesterday' : '...',
			'today' : '...',
			'balance' : '...'
		};
		
		
		for (var key in result) {
			// clear strings values
			if (typeof result[key] === 'string') if (result[key] !== 'n/a') result[key] = result[key].clearCurrency();
			
			// insert into tableBuffer
			if (roles.indexOf(key) != -1) tableBuffer[hash][key] = result[key];
		}

		
		//console.log('tableBuffer', tableBuffer);
		

		
		// save in cache
		if (!fromCache) {
			var cacheName = getCacheName(sitekey, login);  // prepare key name
			
			// save in LS
			localStorage[cacheName] = JSON.stringify({
				datetime : +new Date(),
				data : tableBuffer[hash]
			});
		}
		
		
		
		// prediction
		// if not set "result.predic" - calculate by himself
		if (!result.predic && result.month !== undefined) {
			var date = new Date();
			result.predic = result.month / date.getDate() * date.daysInMonth();
		}
		
		// insert numbers into table fields
		for (var key in result) {
			var ins = 'n/a';
			var tooltip = '';
			
			if (result[key] !== 'n/a') {
				var ins = parseFloat(result[key]);
				if (isNaN(ins)) {
					ins = 'err';
				} else {
					// convert to common currency (if needed)
					if ( (settings.convcurrency === 'toRUR') && (localStorage.WMZtoWMR) ) {
						var curCurrency = document.querySelector('tr[data-key="'+sitekey+'"]').getAttribute('data-currencyOrig');
						if (curCurrency === 'USD') {
							tooltip = ins.toFixed(symAfretDot) + ' $';
							ins = ins / localStorage.WMZtoWMR;
						}
					}
					if ( (settings.convcurrency === 'toUSD') && (localStorage.WMRtoWMZ) ) {
						var curCurrency = document.querySelector('tr[data-key="'+sitekey+'"]').getAttribute('data-currencyOrig');
						if (curCurrency === 'RUR') {
							tooltip = ins.toFixed(symAfretDot) + ' р';
							ins = ins / localStorage.WMRtoWMZ;
						}
					}
					ins = ins.toFixed(symAfretDot);
				}
			}
			
			document.querySelector('tr[data-key="'+sitekey+'"][data-login="'+login+'"]').classList.add('from-cache');
			
			
			var el = document.querySelector('tr[data-key="'+sitekey+'"][data-login="'+login+'"] > td[data-role="'+key+'"]');
			if (el) {
				el.innerText = ins;
				if (tooltip) {
					el.setAttribute('data-tooltip', tooltip);

					$(el).darkTooltip({
						animation: 'flipIn',
						gravity: 'adaptive',
						theme: 'my',
					});
				}
			}
		}
		

		
		// Cacl and print total in footer of table
		// enumerate columns
		for (var i in roles) {
			var elems = document.querySelectorAll('#sitetable tbody [data-role="'+roles[i]+'"]');
			var sum = {
				USD : 0,
				RUR : 0
			};
			
			// enumerate TDs in columns
			for(var prop in elems) {
				if (!elems.hasOwnProperty(prop)) continue;
				var curTDnum = parseFloat(elems[prop].innerText);
				var currency = elems[prop].parentElement.getAttribute('data-currency');
				
				sum[currency] += !isNaN(curTDnum) ? curTDnum : 0;
			}
			
			// printing Totals 
			for(var cur in sum) {
				if (!sum[cur]) continue;
				
				var curElem = document.querySelector('#sitetable tfoot [data-role="'+roles[i]+'"] [data-currency="'+cur+'"]');
				
				if (!curElem) {
					var newelem = document.createElement('div');
					newelem.setAttribute('data-currency', cur);
					newelem.className = 'total';
					curElem = document.querySelector('#sitetable tfoot [data-role="'+roles[i]+'"]').appendChild(newelem);
				}
				
				curElem.innerText = sum[cur].toFixed(symAfretDot);
			}
		}
		
	}
	
	
	// remember width. Window has fixed width now
	setTimeout(function() {
		document.body.style.width = (document.body.clientWidth) +'px';
	}, 100);
	
	
	// Get sites setings from localStorage
	var sites = (!localStorage.sites) ? [] : JSON.parse(localStorage.sites);

	
	// prepare styles
	var styleSheet1 = addStyleSheet('sw_runtime_ss');
	if (settings.hide_login) addStyle(styleSheet1, 'th.login, td.login', 'display: none;');  // hide Login fields if needed
	if (settings.hide_predic) addStyle(styleSheet1, 'td[data-role="predic"], th[data-lang="predic"]', 'display: none;'); // hide Prediction fields if needed
	
	
	if (sites.length == 0) {
		$('#sitetable').hide();
		$('#sitetable').after('<span class="wo_tabl">'+'Нет сайтов для отображения'+'</span>');
	} else {
	
		//add dummi lines into table
		for(var i in sites) {
			try {
				var sitename = engine[sites[i].sitekey].sitename;
			} catch (err) {
				console.warn('No siteengine for ' + sites[i].sitekey);
				continue;
			}
			var sitekey = sites[i].sitekey;
			var useCurrency = engine[sitekey].currency;
			if ( (settings.convcurrency === 'toRUR') && (localStorage.WMZtoWMR) ) var useCurrency = 'RUR';
			if ( (settings.convcurrency === 'toUSD') && (localStorage.WMRtoWMZ) ) var useCurrency = 'USD';

			$('#sitetable tbody').append('<tr data-key="'+sites[i].sitekey+'" data-login="'+sites[i].login+'" data-currency="'+useCurrency+'" data-currencyOrig="'+engine[sitekey].currency+'">\
				<td class="site">\
					<img class="icon" src="'+engine[sitekey].icon+'" />\
					<a href="'+engine[sitekey].mainpageUrl+'" target="_blank">'+sitename+'</a>\
				</td>\
				<td class="login">'+sites[i].login+'</td>\
				<td data-role="today">...</td>\
				<td data-role="yesterday">...</td>\
				<td data-role="month">...</td>\
				<td data-role="predic">...</td>\
				<td data-role="balance">...</td>\
			</tr>');
		}
		
		// start parsing sites
		for(var j in sites) {
			
			// MY DEBUG 
			//if ((sites[j].sitekey !== 'loveplanet') && (sites[j].sitekey !== 'cpazilla') && (sites[j].sitekey !== 'mylove')) continue;
			//if (sites[j].sitekey !== 'halileo') continue; 
			//if (sites[j].sitekey !== 'cpazilla') continue; 
			//if (sites[j].sitekey !== 'seriouspartner') continue;
			//if (sites[j].sitekey !== 'loveplanet') continue;
			
			// check the cache
			var cacheName = getCacheName(sites[j].sitekey, sites[j].login);
			var cacheObj = JSON.parse(localStorage[cacheName]);
			
			
			if ((cacheObj !== undefined) && (+new Date() - cacheObj.datetime < dataCacheTime)) {
			
				console.log('From cache!');
				
				procGB(cacheObj.data, sites[j].sitekey, sites[j].login, true);
			
			} else {
			
				console.log('fired getBalance for', sites[j].sitekey);
				
				// wrappen need for throw sitekey to procGB
				(function() {
					var login   = sites[j].login;
					var sitekey = sites[j].sitekey;
					var wrapper = function(param) {
						procGB(param, sitekey, login);
					};
					engine[sites[j].sitekey].getBalance(wrapper, sites[j].login, sites[j].pass);
				})();
			
			}
		}
	
	}
	
	

}




// Switching visibiliti 2 panels
// Parameter: array whith 2 elements
function switchPanels(arr) {
	if (arr.length != 2) return;
	
	var speed = 200;
	var first, second;
	
	if (arr[0].style.display !== 'none') {
		first = arr[0];
		second = arr[1];
	} else {
		first = arr[1];
		second = arr[0];
	}

	$(first).fadeToggle(speed, 'linear', function() {
		$(second).fadeToggle(speed);
	});
}



// listeners for manage cookies sessions
// this is not works whis secur cookies and paths - fix if needed
chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details) {
		if (details.tabId !== -1) return; // In sended from Tab - exit;
		
		// if has no "X-request-afftbl-id" - exit
		var flag = false;
		var affId;
		for (var i = 0; i < details.requestHeaders.length; ++i) {
			if (details.requestHeaders[i].name === 'X-request-afftbl-id') {
				flag = true;
				affId = details.requestHeaders[i].value;
			}
		}
		if (!flag) return;
		
		//console.log('onBeforeSendHeaders in', details);
		
		listenReqId.push(details.requestId); // add requestId to array for answer listener
		var domain = $('<a>').prop('href', details.url).prop('hostname');
		
		// deleting some headers
 		for (var i = 0; i < details.requestHeaders.length; ++i) {
			var requestHeader = details.requestHeaders[i];
			if ( (requestHeader.name === 'X-request-afftbl-id') || (requestHeader.name.toLowerCase() === 'cookie') ) {
				details.requestHeaders.splice(i, 1);
				i--;
			}
		}
		
		
		// 1. prepare cookies
		var respArr = [];
		var j = mySession.length;
		while (j--) {
			var oneCookie = mySession[j];
			if (domain.indexOf(oneCookie.domain) !== -1) {
				respArr.push(oneCookie.name + '=' +oneCookie.value);
			}
		}
		
		// 2. add cookies from "addCookieArr"
		if (addCookieArr[affId]) {
			var newCookies = addCookieArr[affId];
			for (var key in newCookies) {
				respArr.push(key + '=' + newCookies[key]);
			}
		}
		
		
		// 3. insert new cookies
		details.requestHeaders.push({
			'name' : 'cookie',
			'value' : respArr.join('; ')
		});
		
		
		// modify headers, if needed
		if (modyfHeadersArr[affId]) {

			// change existing items
			var newHeaders = modyfHeadersArr[affId];
			for (var i = 0; i < details.requestHeaders.length; ++i) {
				for (var key in newHeaders) {
					if (details.requestHeaders[i].name === key) {
						details.requestHeaders[i].value = newHeaders[key];
						delete newHeaders[key];
						break;
					}
				}
			} 
			
			// adding new items
			for (var key in newHeaders) {
				details.requestHeaders.push({'name' : key, 'value' : newHeaders[key]});
			}
		}
		
		//console.log('onBeforeSendHeaders out', details);

        return {
            requestHeaders: details.requestHeaders
        };
    }, {
        urls: [ "*://*/*" ]
    }, ['blocking', 'requestHeaders']
);



chrome.webRequest.onHeadersReceived.addListener(
    function (details) {

		if (listenReqId.indexOf(details.requestId) === -1) return;
		listenReqId.splice(listenReqId.indexOf(details.requestId), 1);
		
		//console.log('onHeadersReceived in', details);
		var domainOrig = $('<a>').prop('href', details.url).prop('hostname');
		
        //details.responseHeaders.forEach(function(responseHeader){
		var i = details.responseHeaders.length;
		while(i--){

			var responseHeader = details.responseHeaders[i];
			
			// console.log('work with', responseHeader);
            if (responseHeader.name.toLowerCase() === "set-cookie") {
				
 				var bysemi = responseHeader.value.split(';');
				
				// try to get domain from cookie
				var domain = domainOrig; var path = '/';
				for (var j in bysemi) {
					var byeq = bysemi[j].split('=');
					if (!byeq[0]) continue;
					if (byeq[0].trim().toLowerCase() === 'domain') {
						domain = byeq[1].trim().replace(/^\./, '');  // trim first dot
					}
					
					if (byeq[0].trim().toLowerCase() === 'path') {
						path = byeq[1].trim();
					}
				}
				
 				var cookie = responseHeader.value.split(';')[0].trim();
				var cookieKeyVal = cookie.split('=');
				var cookieValue = (cookieKeyVal.length > 2) ? cookieKeyVal.slice(1).join('=') : cookieKeyVal[1]; // for cookies with "=" in value
				var cookieKey = cookieKeyVal[0].trim();
				var result = {
					'name' : cookieKey,
					'value' : cookieValue,
					'domain' : domain,
					'path' : path,
				};
				
				var needInsert = true;
				for(var j in mySession) {
					var oneCookie = mySession[j];
					if ( (domain === oneCookie.domain) && (cookieKey === oneCookie.name)) {
						mySession[j] = result;
						needInsert = false;
					}
				}
				
				if (needInsert) mySession.push(result);
				
				// delete cookie from header - prevent browser to save this cookie
				details.responseHeaders.splice(i, 1);
            } 
        }
		
		//console.log('onHeadersReceived out', details);
		
        return {
            responseHeaders: details.responseHeaders
        };
    }, {
        urls: ["*://*/*"]
    }, ['blocking','responseHeaders']
);





window.onload = function() {
	
	if (localStorage.settings) {
		settings = JSON.parse(localStorage.settings);
	}
	
	// Run main function
	fillTable(); 
	
	// run translating
	locale();
	
	// Get sites setings from localStorage
	var sites = (!localStorage.sites) ? [] : JSON.parse(localStorage.sites);
	
	
	// click "add site" - panels animation
	$('#addbutton, #back_add_menu').on('click', function(event) {
		console.log('addbutton');
		event.preventDefault();

		switchPanels( $('#page, #add') );
	});
	
	
	// click "add site" - prepage sitelist
	$('#addbutton').on('click', function(event) {
		console.log('addbutton');
		event.preventDefault();
		
		// prepare sitelist
		
		if ( $('.sitelist >').length == 0) {
			
			for(var key in engine) {
				if (!engine.hasOwnProperty(key)) continue;
				
				// if site already added - cancel it
				var escIt = false;
				for(var si in sites) {
					if (sites[si].sitekey === key) {
						escIt = true;
						continue;
					}
				}
				if (escIt) continue;

				$('.sitelist').append(
					'<div class="line shown">\
						<img src="'+engine[key].icon+'" />\
						<a href="#" class="add_sitename" data-sitekey="'+key+'">'+engine[key].sitename+'</a>\
						<span class="category">'+engine[key].category+'</span>\
					</div>'
				);
			}
		}

		
		if ( $('.dellist >').length == 0) {
			for(var key in sites) {
				var sitekey = sites[key].sitekey;
				$('.dellist').append(
					'<div class="line shown" data-sitekey="'+sitekey+'">\
						<img src="'+engine[sitekey].icon+'" />\
						<span>'+engine[sitekey].sitename+'</span>\
						<a href="#" class="delbutton" >&times;</a>\
					</div>'
				);
			}
		}
		
	});
	
	
	// click "setbutton"
	$('#setbutton, #back_settings').on('click', function(event) {
		console.log('setbutton');
		event.preventDefault();

		switchPanels( $('#page, #settings') );
	});
	

	


	
	// Click add %sitename%
	$('#add_menu').on('click', '.add_sitename', function(event) {
		event.preventDefault();
		
		var sitekey =  event.target.dataset.sitekey;
		
		$('#add_site h2').html(chrome.i18n.getMessage('add_site_sitename', '<img src="'+engine[sitekey].icon+'" />' +engine[sitekey].sitename));
		
		var descr = chrome.i18n.getMessage('sitedescr_'+sitekey);
		if (descr) {
			$('#sitedescr').html(descr);
		} else {
			$('#sitedescr').text(chrome.i18n.getMessage('none'));
		}
		
		$('.gotosite')[0].href = engine[sitekey].registerUrl;
		
		$('#add_site').attr('data-sitekey', sitekey);
		
		$('#add_menu, #add_site').toggle(100);
	});

	
	// Click back from add %sitename%
	$('#back_add_site').on('click', function(event) {
		event.preventDefault();
		$('#add_menu, #add_site').toggle(100);
	});
	
	
	// Click Apply Login/pass
	$('.apply-reqiz').on('click', function(event) {
		event.preventDefault();
		console.log('apply-reqiz clicked');
		
		// add new site to array
		sites.push({
			'sitekey'	: $('#add_site').attr('data-sitekey'), 
			'login'	 	: $('#sitelogin').val(), 
			'pass'		: $('#sitepass').val(),
			'active' 	: true,
		});
		
		localStorage.sites = JSON.stringify(sites); // save array
		
		$('#sitepass').val('');
		$('#sitelogin').val('');
		
		$('#add_menu, #add_site').toggle(100);
	});
	
	
	// Searching sites
	$('#filterdites').on('input', function(event) {
		
		if (!event.target.value) {
			$('.sitelist .line').addClass('shown').show();
			$('.sitelist .cat-wrap').show();
			return;
		}
		
		// hide sites from list
		$('.sitelist .line').each(function(ind, elem) {
			if ( $('.add_sitename', elem).text().toLowerCase().indexOf(event.target.value.toLowerCase()) != -1 ) {
				$(elem).addClass('shown').show(100);
			} else {
				$(elem).removeClass('shown').hide(100);
			}
			

		});
		
 		// hide empty category
		setTimeout(function() {
			$('.sitelist .cat-wrap').each(function(ind, elem) {
				
				if ($('.line.shown', elem).length == 0) {
					$(elem).hide();
				} else {
					$(elem).show();
				}
			});
		}, 101);
		
	});
	
	
	
	$('.dellist').on('click', '.delbutton', function(event) {
		console.log('delbutton', sites);
		
		var $line = $(this).closest('[data-sitekey]');
		var key = $line.attr('data-sitekey');
		
		for(var si in sites) {
			if (sites[si].sitekey === key) {
				console.log('deleded');
				//delete sites[si];
				sites.splice(si, 1);
				$line.fadeOut(200);
				break;
			}
		}
		
		localStorage.sites = JSON.stringify(sites); // save array
	});
	
	
	
	// Prepage Settings tab
	$('#hide_login').attr('checked', settings.hide_login);
	$('#hide_predic').attr('checked', settings.hide_predic);
	$('[name="convcurrency"]').val(settings.convcurrency);
	
	
	// listen checkboxes on Settings tab
	$( '#hide_login, #hide_predic' ).change(function() {
		var myopt = {};
		myopt[this.id] = this.checked;
		saveOptions(myopt);
	});
	
	$('#convcurrency').change(function() {
		var myopt = {};
		myopt[this.id] = this.value;
		saveOptions(myopt);
	});


	
	

	// click about
	$('#abotbutton, #back_about').on('click', function(event) {
		console.log('abotbutton');
		event.preventDefault();
		
		var ua = navigator.userAgent;    
		var link = 'https://chrome.google.com/webstore/detail/income-monitor/ondbcoopdkpnfjemekpkkdlcdillpcpf';
		if (ua.search(/(YaBrowser|OPR)/) > 0)  {
			link = 'https://addons.opera.com/ru/extensions/details/income-monitor/';
		} 
		document.getElementById('store_url').href = link;
		
		switchPanels( $('#page, #about') );
	});
}


  




