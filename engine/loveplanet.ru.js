
engine['loveplanet'] = {
	'category' 		: 'dating',
	'sitename' 		: 'LovePlanet', 
	'currency' 		: 'RUR',
	'timezome' 		: 3,					// Server Timezome (hours) 
	'TSL' 			: false,					// use https?
	'mainpageUrl' 	: 'http://lp-partners.ru/',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://lp-partners.ru/cgi-bin/pl/affiliates/referral.cgi?id=20732',
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABUElEQVR42qWTTygEURzHvU1OtFdHXCiJE8phb2sPnJR/h6VcxE2SktRubdOWi5ubkm2LTW3tAW0xCicyJyc5iCPXDa3Pq9/bXtNgJlOfvm9+7/f97szvzaqmf14qSnPXxHoccWAUYo8lpyN0AOZ2ZAPaYE7XCFDK1zSE9MALm2dWfQSZglvqe9zXWW+zXlVW0wEya+W5sAhrMC+1L6jBM+buxgwwZ5DNCOPoJODJDnhH4iHNaW2BE0JuTEA9pHkJmmEH+gnwTMAdMvCHOQuncClzaCXg0wQMI9e/mPOwD/cQg0nMh40ZSEgf4gWY9YALsteiTwbzrtm0A5JyTDkYlLI+xiv5Zd07g7lop5tXWEEW2OxlXWY9DtPwChfSO8Z+xf94JuAB0R/GB7xBSo7qSPoSmN2g4ZiAqpzCMSzTXKOWYL2lZ8D9+U/TjfRvDLq+Aa//bRG2ovTLAAAAAElFTkSuQmCC',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		
		// first day  - ready / tested
		// timezone   - ready / tested
		
		
		var that = this;
		
		myRequest({
			type: 'GET',
			url : 'http://lp-partners.ru/cgi-bin/pl/affiliates/index.cgi',
			data: 'login='+login+'&pass='+pass,
			success: function(html){
				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');
				
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

/* 					// first day of month
					var date = new Date();
					if (date.getDate() == 1) {
						date.setDate(0);  // start from yesterday
					} else {
						date.setDate(1);
					} */
					
					var startDate = new Date();
					startDate.setHours( (startDate.getHours() + (startDate.getTimezoneOffset() / 60)) + that.timezome); // comtensation timezone
					if (echoDate('D', null, that.timezome) === 1) {   // if first day of month
						startDate.setDate(0);  // start from yesterday (-1 day)
					} else {
						startDate.setDate(1);  // start from first day
					}
					
					myRequest({
						type: 'GET',
						url : 'http://lp-partners.ru/cgi-bin/pl/affiliates/index.cgi',
						data: { 
							'sub_act'   : 0,
							'login' 	: login,
							'action' 	: 101,
							'csv' 		: 1,
							'preset' 	: 0,//    2,
							'id_domain' : 0,
							'custom'	: '' ,
							'from_date'	: echoDate('D.M.YYYY', startDate),
							'to_date'	: echoDate('D.M.YYYY')
						},//login=6560782&action=101&sub_act=0&csv=1&preset=&id_domain=0&custom=&from_date=26.7.2016&to_date=1.8.2016
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

								var amount = parseFloat(bysemi[9].replace(',', '.'));
								if (isNaN(amount)) amount = 0;
								
								result.month += amount;// month
								if (bysemi[0] === echoDate('YYYY-MM-DD')) result.today = amount;	// today
								if (bysemi[0] === echoDate('YYYY-MM-DD', 'yesterday')) result.yesterday = amount;	// yesterday
							}
							
							// compensation first day of month
							if (new Date().getDate() == 1) {
								result.month = result.today;
							}
							
							if (typeof calbackFunc == 'function') calbackFunc(result);
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