engine['bongacash'] = {
	'category' 		: 'adult',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'BongaCash',		// Visible sitename
	'currency' 		: 'USD',				// RUR or USD
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'https://bongacash.com/reports/general#',	// for clickable sitename in revenue table
	'registerUrl' 	: 'https://bongacash.com/ref?c=264724',	// Registration page URL
	'icon'			: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIAAWBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC5RTQAuUWpALlFsQC5Rd8AuUVCAAAAAAAAAAAAAAAAALlFdAC5RUwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuUXLALlFswC5RZUAuUX/ALlF/QC5RVoAAAAAAAAAAAC5RUwAuUX/ALlFkQAAAAAAAAAAAAAAAAAAAAAAAAAAALlF/QC5RXwAAAAAALlFeAC5Rf0AuUX9ALlFOgAAAAAAAAAAALlF0wC5RcMAuUVMAAAAAAAAAAAAAAAAAAAAAAC5Rf8AuUVwALlFUAC5RRgAuUU4ALlF1wC5ReUAuUVMALlFAgC5RaUAuUVYALlF6wC5RekAuUWfALlFGgAAAAAAuUXrALlFegC5RecAuUW3ALlFAgC5RQQAuUXVALlF3QC5RekAuUX5ALlFMAC5RV4AuUXBALlF/wC5ReUAuUUeALlFuwC5RZcAuUVMALlF/wC5RaUAuUUKALlFjQC5RWQAuUUGALlFGgAAAAAAAAAAAAAAAAC5RWoAuUX/ALlFrwC5RW4AuUXNAAAAAAC5RdcAuUX5ALlF7QC5Re8AuUUyAAAAAAC5RYEAuUXxALlFuwC5RVYAAAAAALlFxwC5RfcAuUUSALlF8wC5RSQAuUWPALlFegC5RTgAuUV+ALlFEgC5RQwAuUWVALlFbAC5RSoAAAAAAAAAAAC5RZ8AuUX5AAAAAAC5RXAAuUWxALlFdAC5RY8AAAAAALlFgwC5Ra8AuUUUALlFvQC5RbEAuUWjALlFXgC5RQQAuUXZALlFwwAAAAAAAAAAALlFhQC5RfMAuUVUAAAAAAC5RQYAuUWvALlFsQC5RRoAAAAAAAAAAAC5RQwAuUWfALlF9QC5RTYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC5RVYAuUW7ALlFwwC5RcUAuUXhALlFpwC5RSoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AACP/wAAB58AAHOfAAB5owAATDEAACX8AAChjAAAr7wAANSMAADOeQAA/4MAAP//AAD//wAA//8AAA==',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		

		myRequest({
			type: "POST",
			url : 'https://bongacash.com/login',
			data: 'log_in%5Busername%5D='+login+'&log_in%5Bpassword%5D='+pass+'&log_in%5Bremember%5D=on',
			success: function(html){
	
 				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, "text/html");
				
				var balance = tmpDom.querySelector('#header > div.logged > div > div > table > tbody > tr > td:nth-child(2) > strong');
				if (balance) {
					balance = parseFloat(balance.innerText.clearCurrency());
					console.log('balance', balance);
				} else {
					console.log('error parse balance');
				}
				
				if (typeof calbackFunc == 'function') calbackFunc({'balance' : balance});
				
				var _csrf_token =  tmpDom.querySelector('input[name="_csrf_token"]');
				if (_csrf_token) {
					_csrf_token = _csrf_token.value;
				} else {
					console.log('input[name="_csrf_token"] not found. Return');
					return;
				}
				
				delete parser, tmpDom;
				
				if (new Date().getDate() == 1) {
					// start from yesterday (30 or 31 of last month)
					var date = new Date();
					date.setDate(date.getDate() - 1);
				} else {
					var date = new Date();
				}
				
				// Request 2
				myRequest({
					type: "POST",
					url : 'https://bongacash.com/reports/xhr',
					data: {
						'report' : 'general',
						'_csrf_token' : _csrf_token,
						'program' : '',
						'white_label_id' : '',
						'campaign' : '',
						'breakline' : 'day',
						'source' : '',
						'quick_select' : '2016-05-27|2016-05-27',
						'range_select[from][day]' :   '01',
						'range_select[from][month]' : echoDate('MM', date),
						'range_select[from][year]' :  echoDate('YYYY', date),
						'range_select[to][day]' : 	  echoDate('DD', 'lastDayThisMonth'),
						'range_select[to][month]' :   echoDate('MM'),
						'range_select[to][year]' :    echoDate('YYYY'),
					},
					headers : {
						'X-Requested-With':'XMLHttpRequest'
					},
					success: function(html){
						

 						var parser = new DOMParser;
						var tmpDom = parser.parseFromString(html, "text/html");

 						var month = tmpDom.querySelector('.list_shadow > table > tbody > tr.total > td.payout.right');
						if (month) {
							month = parseFloat(month.innerText.clearCurrency());
							console.log('month', month);
						} else {
							console.log('error parse month');
						}
						

						var pos = tmpDom.querySelectorAll('.list_shadow > table > tbody > tr').length -1;
						var today = tmpDom.querySelector('.list_shadow > table > tbody > tr:nth-child('+pos+') > td.payout.right');
						if (today) {
							today = parseFloat(today.innerText.clearCurrency());
							console.log('today', today);
						} else {
							console.log('error parse today');
						}
						
						
						var pos = tmpDom.querySelectorAll('.list_shadow > table > tbody > tr').length -2;
						var yesterday = tmpDom.querySelector('.list_shadow > table > tbody > tr:nth-child('+pos+') > td.payout.right');
						if (yesterday) {
							yesterday = parseFloat(yesterday.innerText.clearCurrency());
							console.log('yesterday', yesterday);
						} else {
							console.log('error parse yesterday');
						}
						
						
						if (typeof calbackFunc == 'function') calbackFunc({
							'month' : month,
							'yesterday' : yesterday,
							'today' : today
						}); 
						delete parser, tmpDom;
					}
					
					
				});
			}
			
			
		});
	}
}