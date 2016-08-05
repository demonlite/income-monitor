engine['trafficshop'] = {
	'category' 		: 'adult',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'TrafficShop ',		// Visible sitename
	'currency' 		: 'USD',				// RUR or USD
	'timezone' 		: 2,					// Server timezone (hours) 
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'https://www.trafficshop.com/',	// for clickable sitename in revenue table
	'registerUrl' 	: 'https://www.trafficshop.com/',	// Registration page URL
	'icon'			: 'data:image/gif;base64,R0lGODlhEAAQALMAAPqXLeGlZunq6sjKy1VXV52Fa/zSo/Z3AKmssJCVmfrjyrGbgnd1cfe+f/Z/AP///yH5BAAAAAAALAAAAAAQABAAAARs8MlJn6pzCNmAx1LCPMZhNqA0DEYQNMJWCYOiGB7AEAM1LACH8CAMEBITAQNAFA4BDUbvgSg4rw7iAiFBLLDXQwD5GCzBzrFEyUQ71KEvGlDgrgkBdIAhU+HbAAELPBhmBS4FDAh9MwmOZBQRADs=',
	'getBalance' 	: function(calbackFunc, login, pass) {

	
		var that = this;
		
		// first day ready

		myRequest({
			type: 'GET',
			url : 'https://www.trafficshop.com/',
			headers : {
				'Referer': 'https://www.trafficshop.com/',
				'Origin' : 'https://www.trafficshop.com'
			},
			success: function(html){

 				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');
				
				var randr =  tmpDom.querySelector('input[name="r"]');
				if (randr) {
					randr = randr.value;
				} else {
					console.log('input[name="r"] not found. Try without him');
				}
				delete parser, tmpDom;

				// Request 2
				myRequest({
					type: 'POST',
					url : 'https://www.trafficshop.com/',
					data: {
						'LOG_IN': 1,
						'r': randr,
						'login':login,
						'password':pass,
						'secure':'on'
					},
					success: function(html){

						//console.log(html);
						
						var parser = new DOMParser;
						var tmpDom = parser.parseFromString(html, 'text/html');
						
						var elem = tmpDom.querySelector('form[name="login"] ul li:first-of-type');
						if (elem && elem.innerText === 'Incorrect password or username') {
							if (typeof calbackFunc == 'function') calbackFunc({'error' : 'INVALID_PASS'});
							return;
						}

						
						var startDate = new Date();
						startDate.setHours( (startDate.getHours() + (startDate.getTimezoneOffset() / 60)) + that.timezone); // comtensation timezone
						if (echoDate('D', null, that.timezone) === 1) {   // if first day of month
							startDate.setDate(0);  // start from yesterday (-1 day)
						} else {
							startDate.setDate(1);  // start from first day
						}
						
						var postdata = 'period=9&SD=1&SM='+echoDate('M', startDate, that.timezone)+'&SY='+echoDate('YYYY', startDate, that.timezone)+'&ED='+echoDate('D', null, that.timezone)+'&EM='+echoDate('M', null, that.timezone)+'&EY='+echoDate('YYYY', null, that.timezone)+'&sel_stat_type=1&x=51&y=12&submit=submit';
						var resp = {
							'month' : 0,
							'yesterday' : 0,
							'today' : 0,
							'balance' : 0
						};
						
						// Request 3 - Skimmed stats
						myRequest({
							type: 'POST',
							url : 'https://www.trafficshop.com/publishers/selling_traffic/skimmed/?type=4',
							data: postdata,
							headers : {
								'Referer':'https://www.trafficshop.com/publishers/selling_traffic/skimmed/?type=4',
								'Origin' :'https://www.trafficshop.com'
							},
							success: function(html){
								
								var parser = new DOMParser;
								var tmpDom = parser.parseFromString(html, 'text/html');
								var elems = tmpDom.querySelectorAll('#content > div > table.data > tbody > tr');
								
								for(var i in elems){
									if (!elems.hasOwnProperty(i)) continue;
									if ( elems[i].querySelectorAll('td').length == 0) continue;
									
									var td1 	= elems[i].querySelector('td:first-of-type').innerText;
									var revenue = elems[i].querySelector('td:last-of-type').innerText;
									
									if ( (td1 === 'Total:') && (echoDate('D', null, that.timezone) !== 1)) {
										resp.month += parseFloat(revenue.clearCurrency());
									}
									if (td1 === echoDate('YYYY/MM/DD', 'yesterday', that.timezone)) resp.yesterday += parseFloat(revenue.clearCurrency());
									if (td1 === echoDate('YYYY/MM/DD', null, that.timezone)) 		resp.today += parseFloat(revenue.clearCurrency());
								}
								
								// compensation first day of month
								if (echoDate('D', null, that.timezone) === 1) {   // if first day of month
									resp.month += resp.today;
								}
								
								if (typeof calbackFunc == 'function') calbackFunc(resp);
							}
						});	


						
						// Request 4 - Popunder stats
						myRequest({
							type: 'POST',
							url : 'https://www.trafficshop.com/publishers/selling_traffic/popunder/?type=4',
							data: postdata,
							headers : {
								'Referer':'https://www.trafficshop.com/publishers/selling_traffic/popunder/?type=4',
								'Origin' :'https://www.trafficshop.com'
							},
							success: function(html){
								
								var parser = new DOMParser;
								var tmpDom = parser.parseFromString(html, "text/html");
								var elems = tmpDom.querySelectorAll('#content > div > table.data > tbody > tr');
								
								for(var i in elems){
									if (!elems.hasOwnProperty(i)) continue;
									if ( elems[i].querySelectorAll('td').length == 0) continue;
									
									var td1 	= elems[i].querySelector('td:first-of-type').innerText;
									var revenue = elems[i].querySelector('td:last-of-type').innerText;
									
									if ( (td1 === 'Total:') && (echoDate('D', null, that.timezone) !== 1)) {
										resp.month += parseFloat(revenue.clearCurrency());
									}
									if (td1 === echoDate('YYYY/MM/DD', 'yesterday', that.timezone)) resp.yesterday += parseFloat(revenue.clearCurrency());
									if (td1 === echoDate('YYYY/MM/DD', null, that.timezone)) 		resp.today += parseFloat(revenue.clearCurrency());
								}
								
								// compensation first day of month
								if (echoDate('D', null, that.timezone) === 1) {   // if first day of month
									resp.month += resp.today;
								}
								
								var balance = tmpDom.querySelector('.balance:not(.balance-advertiser) span:nth-child(1)');
								if (balance) {
									resp.balance = parseFloat(balance.innerText.replace('Publisher: ', '').clearCurrency());
								} else {
									console.log('error parse balance');
								}
								
								if (typeof calbackFunc == 'function') calbackFunc(resp);
								delete parser, tmpDom;
							}
						});
					}
					
					
				});
			}
			
			
		});
	}
}