
engine['halileo'] = {
	'category' 		: 'files',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'Halileo',		// Visible sitename
	'currency' 		: 'USD',				// RUR or USD
	'TSL' 			: true,					// use https?
	'authType'		: 'browserCookies',		// can be 'browserCookies' or 'loginPass'
	'mainpageUrl' 	: 'http://df.halileo.com/statistics/index/bonus-program',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://df.halileo.com/auth/index/register?ref=signup_',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABHVBMVEV3pQB4pQB4pgB5pgB6pwB7qAB8qAB9qQB+qQJ+qgJ/qgB/qgF/qgSAqgWAqwOBqwSBqwiCrAOCrASCrQSDrQSDrQWDrQaErQaErQeErQ2ErQ6ErgiFrgiFrgmFrgqFrg+GrwqGrxOHrw6IsB2OtB+RtiWStieStyeStyiTtyqUuCqUuDKVuSuXuiyXui6hwUOkw0qlw0umxE2mxE6syFmtyVuyzGSyzGWzzGe1zmq50XO80nnQ36HU4qnV46rV46vd6Lvh68Ph68Ti68Ti7MXq8dbs8trv9ODx9eLx9ePx9uPx9uTy9uTz9+f4+u/4+vH4+vP5+/P6/Pb6/Pf7/Pf7/Pj8/fn9/fv9/fz9/vz9/v3+/v7+/v///v////+sY/VwAAAA50lEQVR42iXNaTfDQBTG8SvRlARhaiZlQqqo2lNba21LlNiXVDA83/9jmIn74nnxO/9zLnF9Ynw/Uy8dW3LGSeipCCseAm1L8llyZwLG2YLdyr4KoZ26W9WySK38wwid9iKvygJ/8iyHQtumAyTzXuiPXQCPzwodOn5HP3ImulD3K7vD35w2b4Bk+Rw/abM8GmeKRtZT4Al4aDgytOM3qpWad/j+vF4tS8ZCa4+YdBop8svpKfM9cImz0NENkjlPCxfEuW7WUqD/LxqK5ha4ilxRMWCa0sbgFb0l3xSF1Kyto8OTbU/wP1U7KpoExuudAAAAAElFTkSuQmCC',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		
		
		
		var workParse = function(html) {

			var parser = new DOMParser;
			var tmpDom = parser.parseFromString(html, 'text/html');
		
			var yesterday = tmpDom.querySelector('.content_left.big > div:nth-child(2) > table > tbody > tr:nth-child(1) > td:last-of-type');
			if (yesterday) {
				yesterday = parseFloat(yesterday.innerText.clearCurrency());
				console.log('yesterday', yesterday);
			} else {
				console.log('error parse yesterday');
			}

			
			var month = tmpDom.querySelector('.content_left.big > div:nth-child(2) > table > tbody > tr:nth-child(3) > td:last-of-type');
			if (month) {
				month = parseFloat(month.innerText.clearCurrency());
				console.log('month', month);
			} else {
				console.log('error parse month');
			}
			if (typeof calbackFunc == 'function') calbackFunc({'today' : 'n/a', 'month' : month, 'yesterday' : yesterday});
			
			
			// require wallet page
 			myRequest({
				type: 'GET',
				url : 'http://df.halileo.com/wallet',
				//cookies: cookieStore.stor.halileo,
				success: function(html){
					
					
					var parser = new DOMParser;
					var tmpDom = parser.parseFromString(html, 'text/html');
					
					var balance = tmpDom.querySelector('#wallet_tab > div.content_left > div:nth-child(1) > table > tbody > tr:nth-child(8) > td:nth-child(2)');
					if (balance) {
						balance = parseFloat(balance.innerText.clearCurrency());
						console.log('balance', balance);
					} else {
						console.log('error parse balance');
					}
					if (typeof calbackFunc == 'function') calbackFunc({'balance' : balance}); 
				}
			}); 
		};
		
		
		//if (typeof calbackFunc == 'function') calbackFunc({'error' : 'NEED_CAPTCHA'});
		//return;
		
		// try to use browser cookies for login
		myRequest({
			type: 'GET',
			url : 'http://df.halileo.com/auth/login',
			useBrowserCookies : true,
			success: function(html){
				
				
 				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');
				
				var needCaptcha = tmpDom.querySelectorAll('.g-recaptcha');
				if (needCaptcha.length) {
					
					console.log('halileo NEED CAPTCHA / auth by browser cookies');
					
					// try to use saved cookies
					if (cookieStore.stor.halileo && cookieStore.stor.halileo.sid) {
						myRequest({
							type: 'GET',
							url : 'http://df.halileo.com/auth/login',
							cookies: cookieStore.stor.halileo,
							success: function(html){
								
								//console.log('q1, q2', q2.getAllResponseHeaders());
								
								var parser = new DOMParser;
								var tmpDom = parser.parseFromString(html, 'text/html');
								
								var needCaptcha = tmpDom.querySelectorAll('.g-recaptcha');
								if (needCaptcha.length) {
									console.log('halileo Need CAPTCHA 2 / auth by SAVED cookies');
									
									if (typeof calbackFunc == 'function') calbackFunc({'error' : 'NEED_CAPTCHA'});
								} else {
									console.log('halileo no CAPTCHA 2 / auth by SAVED cookies! ;-)');
									
									workParse(html);
								}
							}
						});
					}
					
				} else {
					console.log('halileo no CAPTCHA / auth by browser cookies');
					
					// try to save session cookie
					chrome.cookies.getAll({domain: 'df.halileo.com'}, function(cookies) {
						for(var i=0; i<cookies.length; i++) {
							if (cookies[i].name === 'sid') {
								cookieStore.stor.halileo = {'sid' : cookies[i].value};
								cookieStore.save();
								console.log('halileo cookies saved', cookies[i].value);
							}
						}
					});
					
					workParse(html);
				}
			}
		});


		/* 		myRequest({
			type: 'POST',
			url : 'http://df.halileo.com/auth/login',
			data: {
				'userLogin': login,
				'userPassword': pass,
				'submit':'Enter'
			},
			success: function(html){
				

			} 
			
		}); */
	}
}