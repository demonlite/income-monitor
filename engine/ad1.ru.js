
engine['ad1'] = {
	'category' 		: 'CPA',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'AD1 ',				// Visible sitename
	'currency' 		: 'RUR',				// RUR or USD
	'timezone' 		:  3,					// Server timezone (hours) 
	'TSL' 			: false,					// use https?
	'mainpageUrl' 	: 'http://office.ad1.ru/authorization',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://office.ad1.ru/authorization',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABIklEQVR42r3TL0iDQRjHcd93Q8OKTTBocGPBoIwpiAgiY4hppiXDWPAPpsEQbDabRc1qMgoyi2EIBpvNgWMwTbYFEVH0ff0+8HvhkJkcO/hw7x33Ps9z997rDfyzef0MYGtD59lH0LMKfEV3M4RRFiRwgWeUkcQyVrxfpf3VpnGPE7xhHXE0ogqWsIMJvCjbIfawii+kNLZgadm1AJvYR0dZCjjDg+avMYlR5FBXJWvIWIA2xjGLIdygii18K9MtpjCCDzQxbGML8IpBzGEDJb18jEvNtVXdPMbwiDssugdo2WJ4x4IqSejQrD/CNoo4xwEqnj7HDJ60hU+car95nbZVUEMLWcuMKzunnlwk37kLUR9o3l0XOGuiCxb29Wfq2n4ATKpCSIAIcVoAAAAASUVORK5CYII=',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
	
		var that = this;
		
		// first day ready
		// NEED TEST BY REAL ACCOUNT OWNER

		myRequest({
			type: 'GET',
			url : 'http://office.ad1.ru/authorization',
			headers : {
				'Origin' : 'http://office.ad1.ru/authorization'
			},
			success: function(html){

 				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');
				
				var randr =  tmpDom.querySelector('input[name="csrf"]');
				if (randr) {
					randr = randr.value;
				} else {
					console.log('input[name="csrf"] not found. Exit');
					calbackFunc({'error' : 'PARSING_ERROR'});
					return;
				}


				// Request 2
				myRequest({
					type: 'POST',
					url : 'http://office.ad1.ru/authorization',
					data: {
						'authorization_email':login,
						'authorization_password':pass,
						'csrf': randr
					},
					success: function(html){


						var startDate = new Date();
						startDate.setHours( (startDate.getHours() + (startDate.getTimezoneOffset() / 60)) + that.timezone); // comtensation timezone
						if (echoDate('D', null, that.timezone) === 1) {   // if first day of month
							startDate.setDate(0);  // start from yesterday (-1 day)
						} else {
							startDate.setDate(1);  // start from first day
						}
						
						// Request 3
						myRequest({
							type: 'POST',
							url : 'http://office.ad1.ru/statistics/ajax/',
							data: {
								'csrf': randr,
								'dateFrom': echoDate('DD.MM.YYYY', startDate, that.timezone), 
								'dateTo':   echoDate('DD.MM.YYYY', null, that.timezone),
								'type':'time'
							},
							headers : {
								'Referer':'http://office.ad1.ru/statistics/time/',
								'Origin' :'http://office.ad1.ru'
							},
							success: function(html){
								
								if (html.errer) {
									console.log('AD1 error: ', html.errer);
									calbackFunc({'error' : 'PARSING_ERROR'});
									return;
								}

								var resp = {'month' : 0,'yesterday' : 0,'today' : 0};
								var elems = html.data.stats.stats;
								
								for(var i in elems){
									if (!elems.hasOwnProperty(i)) continue;
									
									var td1 	= elems[i]._title;
									var revenue = elems[i].summ_approved;
									
									//console.log('elem' , td1, revenue);
									
									if (td1 === echoDate('DD.MM.YYYY', 'yesterday', that.timezone)) resp.yesterday = parseFloat(revenue);
									if (td1 === echoDate('DD.MM.YYYY', null, that.timezone)) 		resp.today = parseFloat(revenue);
								}
								
								// month
								var elems = html.data.stats.total;
								resp.month = elems.summ_approved;
								
								
								//compensation first day of month
								if (echoDate('D', null, that.timezone) === 1) {   // if first day of month
									resp.month = resp.today;
								}
								
								if (typeof calbackFunc == 'function') calbackFunc(resp);
							}
						});



						// Request 4  - balance
						myRequest({
							type: 'POST',
							url : 'http://office.ad1.ru/statistics/ajax/',
							data: {
								'csrf': randr,
								'dateFrom':  echoDate('DD.MM.YYYY', null, that.timezone),
								'dateTo':    echoDate('DD.MM.YYYY', null, that.timezone),
								'type':'offers'
							},
							headers : {
								'Referer':'http://office.ad1.ru/',
								'Origin' :'http://office.ad1.ru'
							},
							success: function(html){
								
								if (html.errer) {
									console.log('AD1 error: ', html.errer);
									calbackFunc({'error' : 'PARSING_ERROR'});
									return;
								}

								var elems = html.data.stats.total;
								balance = elems.summ_approved;

								if (typeof calbackFunc == 'function') calbackFunc({'balance' : balance});
							}
						});	

						
			
					}
					
					
				});
			}
			
			
		});
	}
}