
engine['halileo'] = {
	'category' 		: 'files',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'Halileo',		// Visible sitename
	'currency' 		: 'USD',				// RUR or USD
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'http://df.halileo.com/statistics/index/bonus-program',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://df.halileo.com/auth/index/register?ref=signup_',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAANkE3LLaAgAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAQAAAAEABcxq3DAAAAu0lEQVQoz32PPQrCQBCFvzVpAmKVQvEcAb2EIthYWXkVGw9g5SlsrMRaCPbWFgqClQTJZtYimyXmx7cMLI9vePMUwPEjKU4d7xEv5tyd0Z1pU36JuZrdmZ7FAUNFb5bR9kBYABX5aJ6sxps9/UZAkXIjZjoaTMDPzd+UCI0mQHkOqMf47geANEDeP0AQgjZAMAgd61ogtXXEwcWKBTRt8iEjn6oMWdMNqnRLKSJsSHc1k8twLVLrouB1gi+WmkhcS6yF/QAAAEx0RVh0Y29tbWVudABEb2N1bWVudCBmaWxlIGJsYW5rIHBhcGVyIHBhZ2UgZnJvbSBJY29uIEdhbGxlcnkgaHR0cDovL2ljb25nYWwuY29tLw5D47gAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTEtMDgtMjFUMTM6MTQ6MDMtMDY6MDA03nOCAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDExLTA4LTIxVDEzOjE0OjAzLTA2OjAwRYPLPgAAAABJRU5ErkJggg==',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		
		myRequest({
			type: 'POST',
			url : 'http://df.halileo.com/auth/index/login',
			data: {
				'userLogin': login,
				'userPassword': pass,
				'submit':'Enter'
			},
			success: function(html){
				
				
 				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, "text/html");

				var balance = tmpDom.querySelector('.earnings table  tr:nth-child(5) > td:nth-child(2) > span');
				if (balance) {
					balance = parseFloat(balance.innerText.clearCurrency());
					console.log('balance', balance);
				} else {
					console.log('error parse balance');
				}
				if (typeof calbackFunc == 'function') calbackFunc({'balance' : balance});

				
				var yesterday = tmpDom.querySelector('.earnings table  tr:nth-child(1) > td:nth-child(2) > span');
				if (yesterday) {
					yesterday = parseFloat(yesterday.innerText.clearCurrency());
					console.log('yesterday', yesterday);
				} else {
					console.log('error parse yesterday');
				}
				if (typeof calbackFunc == 'function') calbackFunc({'yesterday' : yesterday});
				
				
				
				var month = tmpDom.querySelector('.stats_rightbar > table > tbody:nth-child(4) > tr:nth-child(4) > td:nth-child(8)');
				if (month) {
					month = parseFloat(month.innerText.clearCurrency());
					console.log('month', month);
				} else {
					console.log('error parse month');
				}
				if (typeof calbackFunc == 'function') calbackFunc({'month' : month});
				if (typeof calbackFunc == 'function') calbackFunc({'today' : 'n/a'});
				
				
				delete parser, tmpDom;
				
			} 
			
			
		});
	}
}