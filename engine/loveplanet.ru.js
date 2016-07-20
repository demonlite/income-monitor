
engine['loveplanet'] = {
	'category' 		: 'dating',
	'sitename' 		: 'LovePlanet', 
	'currency' 		: 'RUR',
	'TSL' 			: false,					// use https?
	'mainpageUrl' 	: 'http://lp-partners.ru/',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://lp-partners.ru/cgi-bin/pl/affiliates/referral.cgi?id=20732',
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABUElEQVR42qWTTygEURzHvU1OtFdHXCiJE8phb2sPnJR/h6VcxE2SktRubdOWi5ubkm2LTW3tAW0xCicyJyc5iCPXDa3Pq9/bXtNgJlOfvm9+7/f97szvzaqmf14qSnPXxHoccWAUYo8lpyN0AOZ2ZAPaYE7XCFDK1zSE9MALm2dWfQSZglvqe9zXWW+zXlVW0wEya+W5sAhrMC+1L6jBM+buxgwwZ5DNCOPoJODJDnhH4iHNaW2BE0JuTEA9pHkJmmEH+gnwTMAdMvCHOQuncClzaCXg0wQMI9e/mPOwD/cQg0nMh40ZSEgf4gWY9YALsteiTwbzrtm0A5JyTDkYlLI+xiv5Zd07g7lop5tXWEEW2OxlXWY9DtPwChfSO8Z+xf94JuAB0R/GB7xBSo7qSPoSmN2g4ZiAqpzCMSzTXKOWYL2lZ8D9+U/TjfRvDLq+Aa//bRG2ovTLAAAAAElFTkSuQmCC',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		//return;
		
		myRequest({
			type: "GET",
			url : 'http://lp-partners.ru/cgi-bin/pl/affiliates/index.cgi',
			data: 'login='+login+'&pass='+pass,
			success: function(html){
				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, "text/html");
				
				var balance = tmpDom.querySelector('.balance > strong');
				if (balance) {
					balance = balance.innerText;
					console.log('balance', balance);
				} else {
					console.log('error parse balance');
				}
				
				if (typeof calbackFunc == 'function') calbackFunc({'balance' : balance});
				
				
				var login = tmpDom.querySelector('[name="login"]');
				if (login) {
					login = login.value;
					console.log('login', login);
	
					// first day of month
					var from = echoDate('YYYY-MM-DD', 'firstDayThisMonth');
					if (new Date().getDate() == 1) {
						// start from yesterday
						var date = new Date();
						date.setDate(date.getDate() - 1);
						var from = echoDate('YYYY-MM-DD', date);
					} 
					
					
					//login=611&action=101&sub_act=0&csv=1&preset=&id_domain=0&custom=&from_date=27.5.2016&to_date=2.6.2016
					
					myRequest({
						type: "GET",
						url : 'http://lp-partners.ru/cgi-bin/pl/affiliates/index.cgi',
						data: { 
							'sub_act'   : 0,
							'login' 	: login,
							'action' 	: 101,
							'csv' 		: 1,
							'preset' 	: 2,
							'id_domain' : 0,
							'custom'	: '' ,
							'from_date'	: from,
							'to_date'	: echoDate('YYYY-MM-DD')
						},
						dataType: 'html',
						success: function(html){
							// console.log('html', html);
							
							result = {
								month : 0,
								today : 0.00,
								yesterday : 0.00,
							};
							
							var lines = html.split('\n'); 
							for(var i in lines) {
								var bysemi = lines[i].split(';');
								
								if (bysemi.length != 11) continue; // prevent last string (empty) and errors in ansver 
								
								// month
								var amount = parseFloat(bysemi[9].replace(',', '.'));
								if (isNaN(amount)) amount = 0;
								result.month += amount;
								
								// today
								if (bysemi[0] === echoDate('YYYY-MM-DD')) result.today = bysemi[9];
								
								// yesterday
								var date1 = new Date();
								date1.setDate(date1.getDate() - 1);
								if (bysemi[0] === echoDate('YYYY-MM-DD', date1)) result.yesterday = bysemi[9];
							}
							
							if (typeof calbackFunc == 'function') calbackFunc(result);
							
							
							/* 
							
							// OLD code. For parsing html page. If use - fix first day and not exist days in report
							
							var parser = new DOMParser;
							var tmpDom = parser.parseFromString(html, "text/html");
							
							// today
							var today = tmpDom.querySelector('.table > tbody > tr:nth-child(2) > td:nth-child(11)');
							if (today) {
								today = today.innerText;
								//console.log('today', today);
							} else {
								console.log('error parse today');
							}

							// yesterday
							var yesterday = tmpDom.querySelector('.table > tbody > tr:nth-child(3) > td:nth-child(11)');
							if (yesterday) {
								yesterday = yesterday.innerText;
								console.log('yesterday', yesterday);
							} else {
								console.log('error parse yesterday');
							}

							// month
							if (new Date().getDate() == 1) {
								var month = todat;
							} else {
								var month = tmpDom.querySelector('.total > td:nth-child(11)');
								if (month) {
									month = month.innerText;
									console.log('month', month);
								} else {
									console.log('error parse month');
								}
							}
							
							
							var result = {
								'today' : today,
								'yesterday' : yesterday,
								'month' : month,
								'balance' : balance,
							}
							
							if (typeof calbackFunc == 'function') calbackFunc(result); */

						}
						
					});
					
				} else {
					console.log('error parse login');
				}

				delete parser, tmpDom;
				
			}
		});
	}
}