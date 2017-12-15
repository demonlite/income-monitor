"use strict";



var mySession = [];
var listenReqId = [];

var modyfHeadersArr = {};
var addCookieArr = {};

var engine = {};
var settings = {
	decimal_places : 2
};
var tableBuffer = {};

var salt = 'fc9a5b4e1c0cce50ad8008cfd205784f';
var symAfretDot = 2; // Symbols after comma in table
var dataCacheTime = 15*60*1000; // Expire time of cached data - 15 minuts

var version   = (navigator.userAgent.search(/(Firefox)/) > 0) ? browser.runtime.getManifest().version : chrome.app.getDetails().version;

// DEBUG !!!
var dataCacheTime = 0; // Expire time of cached data



if (localStorage.settings) settings = $.extend(settings, JSON.parse(localStorage.settings));




$.fn.draggable = function(callback){
	function disableSelection(){
		return false;
	}
    $(this).mousedown(function(e){
		var drag = $(this);
		var posParentTop = drag.parent().offset().top;
		var posParentBottom = posParentTop + drag.parent().height();
		var posOld = drag.offset().top;
		var posOldCorrection = e.pageY - posOld;
        drag.addClass('dragActive');
		var mouseMove = function(e){
			var posNew = e.pageY - posOldCorrection;
			if (posNew < posParentTop){
				if (drag.prev().length > 0 ) {
					drag.insertBefore(drag.prev().css({'top':-drag.height()}).animate({'top':0}, 100));
				}
				drag.offset({'top': posParentTop});
            } else if (posNew + drag.height() > posParentBottom){
				if (drag.next().length > 0 ) {
					drag.insertAfter(drag.next().css({'top':drag.height()}).animate({'top':0}, 100));
                }
				drag.offset({'top': posParentBottom - drag.height()});
            } else {
				drag.offset({'top': posNew});
				if (posOld - posNew > drag.height() - 1){
					drag.insertBefore(drag.prev().css({'top':-drag.height()}).animate({'top':0}, 100));
					drag.css({'top':0});
					posOld = drag.offset().top;
					//posOldCorrection = e.pageY - posOld;
				} else if (posNew - posOld > drag.height() - 1){
					drag.insertAfter(drag.next().css({'top':drag.height()}).animate({'top':0}, 100));
					drag.css({'top':0});
					posOld = drag.offset().top;
					//posOldCorrection = e.pageY - posOld;
				}
			}
		};
		var mouseUp = function(){
			$(document).off('mousemove', mouseMove).off('mouseup', mouseUp);
			$(document).off('mousedown', disableSelection);
            drag.animate({'top':0}, 100, function(){
				drag.removeClass('dragActive');
				callback();
	        });
        };
		$(document).on('mousemove', mouseMove).on('mouseup', mouseUp).on('contextmenu', mouseUp);
		$(document).on('mousedown', disableSelection);
        $(window).on('blur', mouseUp);
    });
};





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




var server = {};

// prepare IndexwdDB
db.open( {
	server: 'my-app',
	version: 2,
	schema: {
		history_days: {
			key: { keyPath: ['site', 'login', 'date']},
			indexes: {
				mainkey: { keyPath: ['site', 'login', 'date'], unique: true},
				site : {},
				login : {},
				date : {}
			}
		}
	}
}).then( function (s) {
	server = s;
});


/* 


var toDB = {site : 'cpazilla', login : 'cty', date : 20160620, revenue : 11.15};

server.history_days.add(toDB).then(function(ee) {
	console.log('db add ok', ee);
}).catch(function (err) {
	console.log(err);
});


server.history_days.query('date').bound(20160000, 20169999).execute()
.then(function(e){
	console.log('done', e);
});
 */


// Add to Date
Date.prototype.daysInMonth = function() {
	return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
};

// remove from string "$", ","
String.prototype.clearCurrency = function() {
	var a = this.replace(/,/, '.').replace(/\$|,|\s|⃏|о|a|руб\./g, '').trim();
	if (a.split(/\./).length-1 >= 2) a = a.replace(/\./, '');  // if 2 or more dots - remove first dot
	return a;
};



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


// merge 2 obj by extending
function extend2(destination, source) {
	var res = destination;
	for (var property in source)
		res[property] = source[property];
	return res;
}


// DEPRECATED / 
function curDayOfMonth() {
	var date = new Date();
	return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

// DEPRECATED / return first day of this month
function firstDayOfMonth(format) {
	var date = new Date();
	if (format === 'YYYY-MM-DD') return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-01';
	if (format === 'DD-MM-YYYY') return '01-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() ;
}

// DEPRECATED / return last day of this month
function lastDayOfMonth() {
	var date = new Date();
	return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' +  (33 - new Date(date.getFullYear(), date.getMonth(), 33).getDate());
}


function two(num) { return ('0' + num).slice(-2);} // insert 0 before


function echoDate(template, inDate, tzCorrect) {
	var date = new Date();
    var tzCorrect = (tzCorrect === undefined) ? 3 : tzCorrect; // 3 - default timezone for Russia
	
	if (inDate === 'lastDayThisMonth') 	date.setDate(33 - new Date(date.getFullYear(), date.getMonth(), 33).getDate());
	if (inDate === 'firstDayThisMonth')	date.setDate(1);
	if (inDate === 'yesterday')			date.setDate(date.getDate() - 1);
	
	if (inDate && (typeof inDate === 'object')) date = inDate;

	// go to server timezone
	date.setHours( (date.getHours() + (date.getTimezoneOffset() / 60)) + tzCorrect);
	
	var result = template;

	result = result.replace('DD', two(date.getDate()) );
	result = result.replace('D',  date.getDate() );
	result = result.replace('MM', two(date.getMonth() + 1) );
	result = result.replace('M',  date.getMonth() + 1 );
	result = result.replace('YYYY', date.getFullYear() );
	result = result.replace('HH', two(date.getHours()) );
	result = result.replace('II', two(date.getMinutes()) );
	result = result.replace('SS', two(date.getSeconds()) );

	return result;
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
	console.log('saveOptions data', data);

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
		type: 'GET',
		dataType: 'html',
		fail: function() {},
	};
	
	// if headers is set - store it for for inject in request in onBeforeSendHeaders function
	if (opt.headers) modyfHeadersArr[id] = opt.headers;
	if (opt.cookies) addCookieArr[id]    = opt.cookies;
	
	var queryHeaders = {
		'X-request-afftbl-id' : id  // this header will be removed in onBeforeSendHeaders
	};
	
	if (opt.useBrowserCookies) queryHeaders['X-income-mon-opt-browsercookies'] = 1;
	
	$.ajax({
		type: opt.type,
		url : opt.url,
		data: opt.data,
		headers: queryHeaders,
		dataType: opt.dataType,
		success: opt.success
	}).fail(
		opt.fail
	);
}
myRequest.counter = 0;


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




var cookieStore = {
	stor : localStorage.cookieStore ? JSON.parse(localStorage.cookieStore) : {},
	save : function() {
		console.log(this);
		localStorage.cookieStore = JSON.stringify(this.stor);
	}
};

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

		
		
		// if error passed
		if (result.error) {
			var errMess = 'Some error...';
			if (result.error === 'INVALID_PASS') errMess = 'Login or Password is incorrect';
			if (result.error === 'NEED_CAPTCHA') errMess = 'Need to enter a CAPTCHA';
			if (result.error === 'PARSING_ERROR') errMess = chrome.i18n.getMessage('parse_err');
			if (result.error === 'AUTHENTICATION_ERROR') errMess = chrome.i18n.getMessage('auten_err');
			
			var el = document.querySelector('tr[data-key="'+sitekey+'"][data-login="'+login+'"] > td.site');
			if (el) {
				el.setAttribute('data-tooltip', 'Error: ' + errMess);
				el.classList.add('error');

				$(el).darkTooltip({
					animation: 'flipIn',
					gravity: 'adaptive',
					theme: 'my',
				});
			}
			
			//return;

			result.month     = 'err',
			result.yesterday = 'err',
			result.today     = 'err',
			result.balance   = 'err'
		}
		
		
		
		// prepare tableBuffer
		if (!tableBuffer[hash]) tableBuffer[hash] = {
			'month'		: 'n/a',
			'yesterday' : 'n/a',
			'today' 	: 'n/a',
			'balance'	: 'n/a'
		};
		
		
		// clearing / buffering / save in indexedDB
		for (var key in result) {
			// clear strings values
			if ((typeof result[key] === 'string') && (result[key] !== 'n/a') )  result[key] = result[key].clearCurrency();
			
			// insert into tableBuffer
			if (roles.indexOf(key) != -1) tableBuffer[hash][key] = result[key];
			
			var ydate = new Date(); 
			ydate.setDate(ydate.getDate() - 1);
		
			// save yesterday revenue into indexedDB (used for charts)
			if ( !fromCache && (key === 'yesterday') && (['n/a', 'err'].indexOf(result[key]) === -1) ) {
				var toDB = {
					site 	 : sitekey, 
					login 	 : login, 
					date 	 : parseInt(ydate.getFullYear() + two(ydate.getMonth() + 1) + two(ydate.getDate())), // date as integer like 20160101
					revenue  : result[key],
					currency : engine[sitekey].currency
				};

				server.history_days.add(toDB).then(function(ee) {
					console.log('db add ok', ee);
				}).catch(function (err) {
					// when try to add not unique key "mainkey"
					console.log('db add err', err);
				});
			}
		}
		
		//console.log('tableBuffer', tableBuffer);
		
		// save in cache
		if (!fromCache && !result.error) {
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
			var ins = 'n/a';  //can be 'n/a' (if not available), 'err' (if parse error), or float.
			var tooltip = '';
			
			
			if (result[key] !== 'n/a') {
				var ins = parseFloat(result[key]);
				if (isNaN(ins)) {
					ins = 'err';
				} else {
					// convert to common currency (if needed)
					if (settings.convcurrency === 'toRUR') {
						var curCurrency = engine[sitekey].currency;
						if (['USD', 'EUR'].indexOf(curCurrency) !== -1) {
							if (ins) tooltip = ins.toFixed(settings.decimal_places) + ' ' + curCurrency; // if revenue not 0 - prepare tooltip
							if (curCurrency === 'USD') ins = ins / localStorage.WMZtoWMR;
							if (curCurrency === 'EUR') ins = ins / localStorage.WMEtoWMR;
						}
					}
					
					if (settings.convcurrency === 'toUSD') {
						var curCurrency = engine[sitekey].currency;
						if (['RUR', 'EUR'].indexOf(curCurrency) !== -1) {
							if (ins) tooltip = ins.toFixed(settings.decimal_places) + ' ' + curCurrency; // if revenue not 0 - prepare tooltip
							if (curCurrency === 'RUR') ins = ins / localStorage.WMRtoWMZ;
							if (curCurrency === 'EUR') ins = ins / localStorage.WMEtoWMZ;
						}
					}
					ins = ins.toFixed(settings.decimal_places);
				}
			}
			
			if (fromCache) document.querySelector('tr[data-key="'+sitekey+'"][data-login="'+login+'"]').classList.add('from-cache');
			
			// inserting revenue and tooltip
			var el = document.querySelector('tr[data-key="'+sitekey+'"][data-login="'+login+'"] > td[data-role="'+key+'"]');
			if (el) {
				el.innerText = ins;
				if (['n/a', 'err'].indexOf(ins) === -1) el.classList.add('on');
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
				RUR : 0,
				EUR : 0
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
					var inElem = document.querySelector('#sitetable tfoot [data-role="'+roles[i]+'"]');
					inElem.innerHTML = '';
					curElem = inElem.appendChild(newelem);
				}
				
				curElem.innerText = sum[cur].toFixed(settings.decimal_places);
			}
		}
		
	}
	
	
	// remember width. Window has fixed width now. Only for non firefox browsers
	if  (navigator.userAgent.search(/(Firefox)/) <= 0) {
		setTimeout(function() {
			document.body.style.width = (document.body.clientWidth) +'px';
		}, 100);
	}
	
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
		
		
		// Sorting by orber 
		sites.sort(function(a, b) {
			var aord = (typeof a.order === 'undefined') ? 0 : a.order;
			var bord = (typeof b.order === 'undefined') ? 0 : b.order;
			return aord-bord;
		});

		
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
			if (settings.convcurrency === 'toRUR') var useCurrency = 'RUR';
			if (settings.convcurrency === 'toUSD') var useCurrency = 'USD';

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
			//if (sites[j].sitekey !== 'mylove') continue;
			
			// MY DEBUG skip
			if ('juicyads exoclick trafficshop bongacash ad1 epn adsense profitraf'.split(' ').indexOf(sites[j].sitekey) != -1)  continue;
			
			// check the cache
			var cacheName = getCacheName(sites[j].sitekey, sites[j].login);
			var cacheObj = localStorage[cacheName] ? JSON.parse(localStorage[cacheName]) : {};
			
			// get data from cache
			if ((cacheObj !== undefined) && (+new Date() - cacheObj.datetime < dataCacheTime)) {
				console.log('From cache!');
				procGB(cacheObj.data, sites[j].sitekey, sites[j].login, true);
			} else {
			
				console.log('fired getBalance for', sites[j].sitekey);
				
				// closure wrapper need for throw sitekey to procGB
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


function mySessionAdd(key, val, domain, deleteIt) {
	
	deleteIt = (deleteIt === undefined) ? false : deleteIt;
	
	// and insert this cookie in cookie storage (mySession) for use in next request
	var result = {
		'name'   : key,
		'value'  : val,
		'domain' : domain
	};
	
	var needInsert = true;
	
	// replacing by new one
	for(var j in mySession) {
		if ( (domain ===  mySession[j].domain) && (key ===  mySession[j].name)) {
			if (deleteIt) {
				mySession.splice(j, 1);
			} else {
				mySession[j] = result;
				needInsert = false;
			}
		}
	}
	
	if (needInsert && !deleteIt) mySession.push(result); // or inserting
}



// listeners for manage cookies sessions
// this is not works whis secur cookies and paths - fix if needed
chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details) {

		//console.log('Before in', details);
		
		if (details.tabId !== -1) return; // In sended from Tab - exit;

		//var flag = false;
		var browserCookie = false;
		var affId = 0;
		for (var i = 0; i < details.requestHeaders.length; ++i) {
			if (details.requestHeaders[i].name === 'X-request-afftbl-id') {
				affId = details.requestHeaders[i].value;
			}
			if ( (details.requestHeaders[i].name === 'X-income-mon-opt-browsercookies') && (details.requestHeaders[i].value === '1') ) {
				browserCookie = true;
			}
		}
		//console.log('browserCookie=', browserCookie);
		
		if (!affId) return;		// if has no "X-request-afftbl-id" - exit
		
		
		listenReqId.push(details.requestId); // add requestId to array for answer listener
		var domain = $('<a>').prop('href', details.url).prop('hostname');
		
 		// deleting some headers
   		for (var i = 0; i < details.requestHeaders.length; ++i) {
			var requestHeader = details.requestHeaders[i];
			if ( ['X-request-afftbl-id', 'X-income-mon-opt-browsercookies'].indexOf(requestHeader.name) != -1) {
			//if ( (requestHeader.name === 'X-request-afftbl-id') || (requestHeader.name === 'X-income-mon-opt-browsercookies') ) {
				details.requestHeaders.splice(i, 1);
				i--;
			}
			
			// save cookie in cookie storage (mySession) for use in next requests
			if (browserCookie && (requestHeader.name.toLowerCase() === 'cookie')) {
				
				//console.log('broesre coookie', requestHeader.value);
				
				
				var cookies = requestHeader.value.split(';');
			
				for (var c in cookies) {

					var cookie = cookies[c];
					var cookieKeyVal = cookie.split('=');
					var cookieValue = (cookieKeyVal.length > 2) ? cookieKeyVal.slice(1).join('=') : cookieKeyVal[1]; // for cookies with "=" in value
					var cookieKey = cookieKeyVal[0].trim();
					
					mySessionAdd(cookieKey, cookieValue, domain);
				}

			}
			
			if ( (!browserCookie) && (requestHeader.name.toLowerCase() === 'cookie') ) {
				details.requestHeaders.splice(i, 1);
				i--;
			}
		}

	
		// 1. prepare cookies from earle requests
		//var respArr = [];
		var respArrObj = [];
		var j = mySession.length;
		while (j--) {
			var oneCookie = mySession[j];
			if (domain.indexOf(oneCookie.domain) !== -1) {
				//respArr.push(oneCookie.name + '=' +oneCookie.value);
				var resp  = {};
				resp[oneCookie.name] = oneCookie.value;
				respArrObj.push(resp);
			}
		}
		
		// 2. add cookies from "addCookieArr" (added manually from myRequest)
		if (addCookieArr[affId]) {
			var newCookies = addCookieArr[affId];
			for (var key in newCookies) {
				
				//respArr.push(key + '=' + newCookies[key]);
				
				// replacing by new one
				var needInsert = true;
				for(var y in respArrObj) {
					if ( respArrObj[y][key] ) {
						respArrObj[y][key] = newCookies[key];
						needInsert = false;
					}
				}
				// or inserting
				var resp  = {};
				resp[key] = newCookies[key];
				if (needInsert) respArrObj.push(resp);
				
				mySessionAdd(key, newCookies[key], domain);    // and insert this cookie in cookie storage (mySession) for use in next request
				
			}
		}
		
		// 3. insert new cookies
		if (respArrObj.length) {
			
			//console.log('best code 0', respArrObj);
			
			var respArr = [];
			for(var y in respArrObj) {
				for(var b in respArrObj[y]) {
					respArr.push(b + '=' + respArrObj[y][b]);
				}
			}
			
			//console.log('best code', respArr.join('; '));
			
		 	details.requestHeaders.push({
				'name' : 'Cookie',
				'value' : respArr.join('; ')
			}); 

		}
		
		
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
		
		console.log('Before out', details);

        return {requestHeaders: details.requestHeaders};
		
    }, {
        urls: [ '*://*/*' ]
    }, ['blocking', 'requestHeaders']
);



chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
		

		// listen this request or exit?
		//console.log('listen? ', (listenReqId.indexOf(details.requestId) !== -1));
		
		if (listenReqId.indexOf(details.requestId) === -1) return;
		
		listenReqId.splice( listenReqId.indexOf(details.requestId), 1);
		
		//console.log('Received in', details);

		var domainOrig = $('<a>').prop('href', details.url).prop('hostname');
		
		for (var i = 0; i < details.responseHeaders.length; ++i) {

			var responseHeader = details.responseHeaders[i];
			
			// console.log('work with', responseHeader);
            if (responseHeader.name.toLowerCase() === 'set-cookie') {
				//console.log('cookie new', responseHeader.value);
 				var bysemi = responseHeader.value.split(';');
				
				// try to get params from cookie
				var domain = domainOrig, path = '/', deleteIt = false;
				for (var j in bysemi) {
					var byeq = bysemi[j].split('=');
					
					if (!byeq[0] || !byeq[1]) continue;
					
					var nameLo = byeq[0].trim().toLowerCase();
					var val    = byeq[1].trim();
					
					if (nameLo === 'domain') domain = val.replace(/^\./, '');  // trim first dot
					if (nameLo === 'path')   path   = val;
					if ( (nameLo === 'expires') && (new Date(val) < new Date()) ) deleteIt = true;
				}
				
				//console.log('cookie new delete', deleteIt);
				
 				var cookie = responseHeader.value.split(';')[0].trim();
				var cookieKeyVal = cookie.split('=');
				var cookieValue = (cookieKeyVal.length > 2) ? cookieKeyVal.slice(1).join('=') : cookieKeyVal[1]; // for cookies with "=" in value
				var cookieKey = cookieKeyVal[0].trim();
				
				mySessionAdd(cookieKey, cookieValue, domain, deleteIt);
				
				
				// delete all cookie from header - prevent browser to save this cookie
				details.responseHeaders.splice(i, 1);
				i--;
			} 
		} 
		
		//console.log('mySession', mySession);
		console.log('after out', details);
		
        return {responseHeaders: details.responseHeaders};
		
    }, {
        urls: [ '*://*/*']
    }, ['blocking','responseHeaders']
);







window.onload = function() {


	var refreshSitelist = function() {
		
		
		
		$('.sitelist, .dellist').html('');
		
		// prepare sitelist
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
					<img src="'+engine[key].icon+'" alt="" />\
					<a href="#" class="add_sitename" data-sitekey="'+key+'">'+engine[key].sitename+'</a>\
					<span class="category">'+engine[key].category+'</span>\
				</div>'
			);
		}

		// Sorting by orber 
		sites.sort(function(a, b) {
			var aord = (typeof a.order === 'undefined') ? 0 : a.order;
			var bord = (typeof b.order === 'undefined') ? 0 : b.order;

			return aord-bord;
		});
		
		
		// prepare deleting list
		for(var key in sites) {
			var sitekey = sites[key].sitekey;
			$('.dellist').append(
				'<div class="line shown" data-sitekey="'+sitekey+'" data-login="'+sites[key].login+'" data-order="'+sites[key].order+'">\
					<img src="'+engine[sitekey].icon+'" alt="" />\
					<span>'+engine[sitekey].sitename+'</span>\
					<a href="#" class="delbutton" >&times;</a>\
				</div>'
			);
		}
		
		var callback = function() {
			console.log('fin');

			for(var i in sites) {
				var elem = $('.dellist > [data-sitekey="'+sites[i].sitekey+'"][data-login="'+sites[i].login+'"]')[0];
				sites[i].order = $('.dellist > .line').index(elem) + 1;
			}
			localStorage.sites = JSON.stringify(sites);
		};
		
		//$('.dellist').nestable();
 		setTimeout(function(){
			$('.dellist > .line').draggable(callback);
		}, 200); 
		
	}


	//if (localStorage.settings) settings = JSON.parse(localStorage.settings);

	
	fillTable(); 	// Run main function

	locale();		// run translating
	
	// Get sites settings from localStorage
	var sites = (!localStorage.sites) ? [] : JSON.parse(localStorage.sites);
	
	
	// click "add site" - panels animation
	$('#addbutton, #back_add_menu').on('click', function(event) {
		console.log('addbutton');
		event.preventDefault();

		switchPanels( $('#page, #add') );
	});
	
	
	// click "add site" - prepage sitelist
	$('#addbutton').on('click', function(event) {
		//console.log('addbutton');
		event.preventDefault();
		
		refreshSitelist();
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
		
		// login pass or cookies auth
		if (engine[sitekey]['authType'] === 'browserCookies') {
			$('#sitelogin, #sitepass').hide();
			$('#auth_cookies').show();
		} else {
			$('#sitelogin, #sitepass').show();
			$('#auth_cookies').hide();
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
		//console.log('apply-reqiz clicked');
		
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
		
		refreshSitelist();
		
/* 		if (engine[sitekey]['authType'] === 'browserCookies') {
			// open a site? no?
		} */
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
	
	
	// deleting site
	$('.dellist').on('click', '.delbutton', function(event) {
		//console.log('delbutton', sites);
		
		var $line = $(this).closest('[data-sitekey]');
		var key = $line.attr('data-sitekey');
		
		for(var si in sites) {
			if (sites[si].sitekey === key) {
				//console.log('deleded');
				//delete sites[si];
				sites.splice(si, 1);
				$line.fadeOut(200);
				break;
			}
		}
		
		localStorage.sites = JSON.stringify(sites); // save array
		
		setTimeout(function(){
			refreshSitelist();
		}, 210);
	});
	
	
	
	// Prepage Settings tab
	$('#hide_login').attr('checked', settings.hide_login);
	$('#hide_predic').attr('checked', settings.hide_predic);
	$('[name="convcurrency"]').val(settings.convcurrency);
	$('[name="decimal_places"]').val(settings.decimal_places);
	
	// current exchange rate
	$('.exchrate').text('1$ = ' + parseFloat(localStorage.WMRtoWMZ).toFixed(2) + 'р');
	
	// listen checkboxes on Settings tab
	$( '#hide_login, #hide_predic' ).change(function() {
		var myopt = {};
		myopt[this.id] = this.checked;
		saveOptions(myopt);
	});
	
	$('[name="convcurrency"], [name="decimal_places"]').change(function() {
		var myopt = {};
		myopt[this.name] = this.value;
		saveOptions(myopt);
	});




	// click about
	$('#abotbutton, #back_about').on('click', function(event) {
		console.log('abotbutton');
		event.preventDefault();
		
		// prepare link for extension store
		var ua = navigator.userAgent;    
		var link = 'https://chrome.google.com/webstore/detail/income-monitor/ondbcoopdkpnfjemekpkkdlcdillpcpf';  // for chrome
		if (ua.search(/(YaBrowser|OPR)/) > 0) 	link = 'https://addons.opera.com/ru/extensions/details/income-monitor/';
		if (ua.search(/Firefox/) > 0) 		 	link = 'https://addons.mozilla.org/ru/firefox/addon/income-monitor/';
		document.getElementById('store_url').href = link;
		
		switchPanels( $('#page, #about') );
	});
}


  




