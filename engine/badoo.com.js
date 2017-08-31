engine['badoo'] = {
	'category' 		: 'social',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'Badoo',				// Visible sitename
	'currency' 		: 'EUR',				// RUR or USD
	'timezone' 		:  3,					// Server timezone (hours) 
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'https://partner.badoo.com/signin.phtml',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://partner.badoo.eu/signup.phtml',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAwFBMVEVwAONwAONwAONwAONwAOJwAONwAOJwAOJwAONvAOJvAONwAOJwAONmAO5nAO1oAOxoAO1pAOppAOtqAOlqAOprAOhrAOlsAOZsAeZtAOVvAOJvAONwAOBwAOFwAOJwAONxAOBxAOFzBNx2B9iCDseJE72eIaGhI5zDPWvKQ17QR1bTSFXVSFPYS07eUEX3YST5ZB/6Yx/7ZB78ZB39ZR3+Zhr+Zhv+bA//Zxr/Zxv/aBj/axH/bA3/bQ3/bgr/bgvP42ZpAAAADXRSTlN5q9b0+Pv8/f3+/v7+G4CbVwAAAMlJREFUGNMlwe1OwmAMBtDnabsNHZI5NISYyP1fl4mK8iVkBrb2rT88h6LrrxX+bROjaBP0TPdMp66Em2SqGwC3IMA7dj+VFINLmUp/4GbCbWnpMPq+QWUu5/Vz2gmdkx8LtxStp1FbDFHXymIACsQcligAhOpeZ6hG1u5KfZyaq3RXZjwcjrMwnVNDYjGhPf2OFdIsozrnOMNlvDRFqTHM9/31WI1b3u9u9Ylz9AjVAW2E4rDkK/H9xEyQuZP+097kpRAkAJZ49z93xWtBi862+QAAAABJRU5ErkJggg==',
	'getBalance' 	: function(calbackFunc, login, pass) {
	
		// not tested on live account 
		// not tested on first day of month
		
		var that = this;
	


		// Request 1
		myRequest({
			type: 'GET',
			url : 'https://partner.badoo.com/signin.phtml',
			headers : {
				'Referer':'https://partner.badoo.com/signin.phtml',
				'Origin' :'https://partner.badoo.com'
			},
			success: function(html){
				
				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');
				
				
				var csrf_token =  tmpDom.querySelector('input[name="rt"]');
				if (csrf_token) {
					csrf_token = csrf_token.value;
					
					console.log(that.sitename, 'csrf_token is', csrf_token);
				} else {
					console.log(that.sitename, 'input[name="rt"] not found. Return');
					return;
				}
				
				
				// Request 2 - авторизация
				myRequest({
					type: 'POST',
					url : 'https://partner.badoo.com/signin.phtml',
					dataType : 'html',
					data: {
						'rt' : csrf_token,
						'email' 	: login,
						'password' 	: pass,
						'post' 	: '',
					},
					headers : {
						'Referer':'https://partner.badoo.com/signin.phtml',
						'Origin' :'https://partner.badoo.com',
					},
					success: function(html){

						
						// Request 3 - статистика
						myRequest({
							type: 'GET',
							url : 'https://partner.badoo.com/reports.phtml?mode=graphs&link=-1&type=payments&date=' + echoDate('YYYY_M'),
							dataType : 'html',
							headers : {
								'Referer':'https://partner.badoo.com/index.phtml',
								'Origin' :'https://partner.badoo.com',
							},
							success: function(html){
								
								var parser = new DOMParser;
								var tmpDom = parser.parseFromString(html, 'text/html');
								
								var resp = {};

								resp.today     = tmpDom.querySelector('.cwrap table > tbody > tr:nth-child('+echoDate('D')+') > td:nth-child(3)').innerText;
								resp.month     = tmpDom.querySelector('tfoot.ext_info > tr.tr_income > td:nth-child(2)').innerText;

								// compensation first day of month
								if (new Date().getDate() == 1) {
									resp.yesterday = 'n/a';
								} else {
									resp.yesterday  = tmpDom.querySelector('.cwrap table > tbody > tr:nth-child('+echoDate('D', 'yesterday')+') > td:nth-child(3)').innerText;
								}
								
								calbackFunc(resp);
								
							}
						});

						// Request 4 - баланс
						myRequest({
							type: 'GET',
							url : 'https://partner.badoo.com/wallet.phtml',
							dataType : 'html',
							headers : {
								'Referer':'https://partner.badoo.com/index.phtml',
								'Origin' :'https://partner.badoo.com',
							},
							success: function(html){
								
								var parser = new DOMParser;
								var tmpDom = parser.parseFromString(html, 'text/html');

								var balanceStr  = tmpDom.querySelector('.lo_wide_content h1').innerText;
								var found = /\d+\.\d+/.exec(balanceStr);
								
								console.log(that.sitename, balanceStr, found);
								
								if (found && found[0]) {
									calbackFunc({balance : found[0]});
								} else {
									calbackFunc({balance : 'err'});
								}

								
								
							}
						});
						
					}
				});	




			}
			
			
		});
		
		

		


	}

}