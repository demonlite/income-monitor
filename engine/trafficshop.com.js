engine['trafficshop'] = {
	'category' 		: 'adult',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'TrafficShop ',		// Visible sitename
	'currency' 		: 'USD',				// RUR or USD
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'https://www.trafficshop.com/',	// for clickable sitename in revenue table
	'registerUrl' 	: 'https://www.trafficshop.com/',	// Registration page URL
	'icon'			: 'data:image/gif;base64,R0lGODlhEAAQALMAAPqXLeGlZunq6sjKy1VXV52Fa/zSo/Z3AKmssJCVmfrjyrGbgnd1cfe+f/Z/AP///yH5BAAAAAAALAAAAAAQABAAAARs8MlJn6pzCNmAx1LCPMZhNqA0DEYQNMJWCYOiGB7AEAM1LACH8CAMEBITAQNAFA4BDUbvgSg4rw7iAiFBLLDXQwD5GCzBzrFEyUQ71KEvGlDgrgkBdIAhU+HbAAELPBhmBS4FDAh9MwmOZBQRADs=',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
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
				var tmpDom = parser.parseFromString(html, "text/html");
				
				var randr =  tmpDom.querySelector('input[name="r"]');
				if (randr) {
					randr = randr.value;
				} else {
					console.log('input[name="r"] not found. Try without him');
				}
				delete parser, tmpDom;

				// Request 2
				myRequest({
					type: "POST",
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
						var tmpDom = parser.parseFromString(html, "text/html");
						
						var elem = tmpDom.querySelector('form[name="login"] ul li:first-of-type');
						if (elem && elem.innerText === "Incorrect password or username") {
							if (typeof calbackFunc == 'function') calbackFunc({'error' : 'INVALID_PASS'});
							return;
						}
						
						delete parser, tmpDom;
						
						
						// first day of month
						var date = new Date();
						if (date.getDate() == 1) {
							date.setDate(0);  // start from yesterday  if 1 day of month
						} else {
							date.setDate(1);
						}
						
						var postdata = 'period=9&SD=1&SM='+echoDate('M', date)+'&SY='+echoDate('YYYY', date)+'&ED='+echoDate('D')+'&EM='+echoDate('M')+'&EY='+echoDate('YYYY')+'&sel_stat_type=1&x=51&y=12&submit=submit';

						var resp = {
							'month' : 0,
							'yesterday' : 0,
							'today' : 0,
							'balance' : 0
						}
						
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
								var tmpDom = parser.parseFromString(html, "text/html");
								var elems = tmpDom.querySelectorAll('#content > div > table.data > tbody > tr');
								
								for(var i in elems){
									if (!elems.hasOwnProperty(i)) continue;
									if ( elems[i].querySelectorAll('td').length == 0) continue;
									
									var td1 	= elems[i].querySelector('td:first-of-type').innerText;
									var revenue = elems[i].querySelector('td:last-of-type').innerText;
									
									if (td1 === 'Total:') resp.month += parseFloat(revenue.clearCurrency());
									if (td1 === echoDate('YYYY/MM/DD', 'yesterday')) resp.yesterday += parseFloat(revenue.clearCurrency());
									if (td1 === echoDate('YYYY/MM/DD')) resp.today += parseFloat(revenue.clearCurrency());
								}
								
								// compensation first day of month
								if (new Date().getDate() == 1) {
									resp.month = resp.today;
								}
								
								if (typeof calbackFunc == 'function') calbackFunc(resp);
								delete parser, tmpDom;
							}
						});	


						
						// Request 4 - Popunder stats
						myRequest({
							type: "POST",
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
									
									if (td1 === 'Total:') resp.month += parseFloat(revenue.clearCurrency());
									if (td1 === echoDate('YYYY/MM/DD', 'yesterday')) resp.yesterday += parseFloat(revenue.clearCurrency());
									if (td1 === echoDate('YYYY/MM/DD')) resp.today += parseFloat(revenue.clearCurrency());
								}
								
								// compensation first day of month
								if (new Date().getDate() == 1) {
									resp.month = resp.today;
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