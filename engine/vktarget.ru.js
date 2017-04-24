engine['vktarget'] = {
	'category' 		: 'social',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'VKtarget',			// Visible sitename
	'currency' 		: 'RUR',				// RUR or USD
	'timezone' 		:  3,					// Server timezone (hours) 
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'https://vktarget.ru/',	// for clickable sitename in revenue table
	'registerUrl' 	: 'https://vktarget.ru/',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAADA0lEQVQoz03SSUwTUQCA4bl58qDBRA7KwUSNmhA9EBMlEI0YsCEhIEaMCS4Bd3FjCdSBhqVlqaWWUmzZodYKpZZpabFYZjrTvpk3b4Ypa4AWRMVQKLifPRiN//k7/hj4G4RQEgURslzAD2iSZSgu4IeAQWyA8VMcCxAPAQDYH4143uf1KBqf55Woc+XtV1TmPOWrzFJDWiGeXFBZ09Z364m8rLoJsiwGAEAIeUacSRcfJlxulJuDruloYGmTi2za4PvMJk/CHSOuaduWfDX7WpGIIMZxXMA/Lit4erJsQFz97guvV1hhoYl60E4980xzK1vNPba4S8rtKfk6bbMgCFhIRLVa0+Ebhvn1nyqndKaW6GcW6cVYYG5N4ZiubLUOOkbxscj+88XdHSZBQBhLU0lFBjW5rPEvJjd4o1u/9HTknIHO6YLzs9KU35de7RKjP3J1b/NLaicQxKxDw3sf9pIrX1OqbHw4Vjw4cVjh6edXn7n5S3ird3a1yTl17yV0oI9pj3QwSGP6buspld0S+pCmHPGFN+KeuqmlKDm1vIYojWciuYWmV7ZSG71j4ViGchAwFNba81qm9XQEw6e14wPSh/24k1+Kni3r1FlcRDh2RDFCrXxJUbld8xsy9TBLk5ipq/94RY9VWj1Y5QosRxPkzvIhkeJmvOJcqo7M74V26ePZepdjci29wsgyFEbY7fHXNb2hWEadrdQeMk9+2l08cLTGs/f+y6Q6dyT2/VTDO9wlVr4RM4rqRchiIhvMKWs+oyeJyeW4BxacmPYtrBvGZ1pGJUpauGCkTtSPji99i7/dXq7UhkQBExBvG7TtvFh9882ck184VjWUqCByX5DZOveBQl22nkThjdNNY/vO3R51EjwPMQCAwEOd3rQ7r05m8HeHPhvJufIBTk6EOt9JLUzkUIV9j+xuT1cHQvz/83FmsyX1RvWu6/oUFXG5zZfVxiQ+bt+RXpR1t9I97BAQ/0di//YWEI8A09tnwTWmErWxVG3C65tf9fcJXBD91QCA3/5K8PMBkmvfAAAAAElFTkSuQmCC',
	'getBalance' 	: function(calbackFunc, login, pass) {
	
		// not tested on live account 
		// not tested on first day of month
	
		var that = this;

		// Request 1
		myRequest({
			type: 'GET',
			url : 'https://vktarget.ru/',
			headers : {
				'Referer':'https://vktarget.ru/',
				'Origin' :'https://vktarget.ru'
			},
			success: function(html){
				
				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');
				
				
				var match = tmpDom.documentElement.innerHTML.match('magicbox(.*?)magicbox');
				if (match[1]) {
					var vkn = match[1];
				} else {
					var vkn = tmpDom.documentElement.nextSibling.nodeValue.match(/magicbox(.*)magicbox/)[1];
				}
			
 				// Request 2
				myRequest({
					type: 'POST',
					url : 'https://vktarget.ru/api/all.php',
					data: {
						'action' : 'auth',
						'email' 	: login,
						'password' 	: pass,
						'js_on' 		: new Date().getFullYear(),
						'timezone_diff' : new Date().getTimezoneOffset(),
						'recaptcha' : '',
						'x':1240,
						'y':359
					},
					headers : {
						
						'Referer':'https://vktarget.ru/',
						'Origin' :'https://vktarget.ru',
						'VKN' : vkn,
						'X-Requested-With' : 'XMLHttpRequest'
					},
					success: function(html){
						
						if (html) {
							var json = JSON.parse(html);
							
							if (json.desc === 'Authorization failed') {
								calbackFunc({'error' : 'AUTHENTICATION_ERROR'});
								return;
							}			
							
							if (json.balance !== undefined) {
								calbackFunc({'balance' : json.balance});
							}
							
							
						}
						
					}
				});			
			


			}
			
			
		});	

		


	}

}