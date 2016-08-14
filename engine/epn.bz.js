
engine['epn'] = {
	'category' 		: 'CPA',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'ePN ',				// Visible sitename
	'currency' 		: 'USD',				// RUR or USD
	'timezone' 		:  0,					// Server timezone (hours) 
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'https://epn.bz/ru/cabinet/#/statistics/',	// for clickable sitename in revenue table
	'registerUrl' 	: 'https://epn.bz/inviter?i=f54ec',	// Registration page URL
	'icon'			: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABMLAAATCwAAAAAAAAAAAAA2QO8ANkDvADZA7wA2QO8ANkDvRzZA77A2QO/nNkDv8DZA7/A2QO/rNkDvwjZA71s2QO8HNkDvADZA7wA2QO8ANkDvADZA7wA2QO8QNkDvpzZA7/82QO//NkDv/zZA7/82QO/6NkDv/zZA7/82QO//NkDvxTZA7yQ2QO8ANkDvADZA7wA2QO8NNkDvvTZA7/82QO//NkDvojZA70o2QO8bNkDvEzZA7zk2QO+GNkDv7TZA7/82QO/bNkDvJTZA7wA2QO8ANkDvljZA7/82QO/3NkDvVDZA7wA2QO9NNkDviDZA74o2QO9YNkDvBzZA7yQ2QO/UNkDv/zZA78w2QO8KNkDvMzZA7/k2QO//NkDvajZA7wU2QO+3NkDv/zZA7/82QO//NkDv/zZA79s2QO8rNkDvGzZA7+M2QO//NkDvYzZA75E2QO//NkDv0jZA7wA2QO+TNkDv/zZA7/82QO//NkDv/zZA7/82QO//NkDv2zZA7z02QO/GNkDv/zZA7882QO/MNkDv/zZA73o2QO8INkDv9jZA7/82QO//NkDv/zZA7/82QO//NkDv/zZA7/82QO//NkDv/zZA7/82QO/vNkDv7jZA7/82QO9YNkDvIjZA78Y2QO/DNkDvwzZA78M2QO/DNkDvwzZA78M2QO/DNkDvyTZA79Q2QO//NkDv7jZA7+s2QO//NkDvYzZA7wA2QO8XNkDvFjZA7xY2QO8WNkDvFjZA7xY2QO8WNkDvFzZA7wU2QO87NkDv/zZA7+82QO/DNkDv/zZA74k2QO8ANkDvyjZA7+82QO/vNkDv7zZA7+82QO/vNkDv7zZA7/I2QO8iNkDvWzZA7/82QO/uNkDvhTZA7/82QO/hNkDvCTZA7242QO//NkDv/zZA7/82QO//NkDv/zZA7/82QO+yNkDvADZA77M2QO//NkDvwDZA7yY2QO/zNkDv/zZA7442QO8ANkDvhjZA7/Y2QO//NkDv/zZA7/82QO+tNkDvBzZA71U2QO/9NkDv/zZA7042QO8ANkDvfDZA7/82QO//NkDvfzZA7wA2QO8eNkDvXDZA72A2QO8rNkDvADZA71c2QO/0NkDv/zZA77U2QO8DNkDvADZA7wE2QO+dNkDv/zZA7/82QO/INkDvazZA7z42QO86NkDvXzZA77M2QO//NkDv/zZA78Q2QO8UNkDvADZA7wA2QO8ANkDvADZA7302QO/vNkDv/zZA7/82QO//NkDv/zZA7/82QO//NkDv/TZA75w2QO8QNkDvADZA7wA2QO8ANkDvADZA7wA2QO8ANkDvJjZA74I2QO/ANkDv6jZA7+42QO/LNkDvkTZA7zk2QO8ANkDvADZA7wA2QO8A8AcAAMADAACAAQAAhAAAAAAAAAAQAAAAAAAAAAAAAAAQAAAAEAAAAAAIAAAIAAAAhCAAAIABAADgAwAA8A8AAA==',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
	
		var that = this;
		


		// Request 2
		myRequest({
			type: 'POST',
			url : 'https://epn.bz/ru/auth/login',
			data: {
				'username':login,
				'password':pass,
			},
			success: function(html){

				var firstDay = false;
				var startDate = new Date();
				startDate.setHours( ( startDate.getHours() + (startDate.getTimezoneOffset()/60) ) + that.timezone); // comtensation timezone
				if (echoDate('D', null, that.timezone) === '1') {   // if first day of month
					startDate.setDate(0);  // start from yesterday (-1 day)
					firstDay = true;
				} else {
					startDate.setDate(1);  // start from first day
				}
				
				
				myRequest({
					type: 'POST',
					url : 'https://epn.bz/en/stats/get-statistic-by-day',
					data: {
						creative_id:"-1",
						currency:"USD",
						offer_type:"ali",
						order:"ts",
						order_direction:1,
						sub_id:"-1",
						ts_from: echoDate('YYYY-MM-DD', startDate),
						ts_to:   echoDate('YYYY-MM-DD', null, that.timezone)
					},

					success: function(html){
						
						ht = JSON.parse(html);
						
						var resp = {'month' : 0, 'yesterday' : 0, 'today' : 0};
						var elems = JSON.parse(html);
						var monthSum = 0;

						var lastMonth = new Date();
						lastMonth.setMonth(lastMonth.getMonth()-1);

						
						for(var i in elems){
							if (!elems.hasOwnProperty(i)) continue;
							
							var dateItem = elems[i].date;
							var revenue  = parseFloat(elems[i].money_outcome_hold) + parseFloat(elems[i].money_outcome);
                            var tmp = echoDate('YYYY', lastMonth) + '-' + echoDate('MM', lastMonth);
                            
							if (dateItem === 'Всего:') continue;
							
							// clear last month dates
                            if ( dateItem.indexOf(tmp) != -1) {
 								if (!firstDay || ( dateItem.indexOf(echoDate('YYYY-MM-DD', startDate)) === -1)) {
									continue;
								}
                            }
							
							//console.log('elem' , dateItem, revenue);
							
							resp.month += revenue;
							
							if (dateItem === echoDate('YYYY-MM-DD', 'yesterday')) resp.yesterday = revenue;
							if (dateItem === echoDate('YYYY-MM-DD')) 	resp.today = revenue;
						}
						
						// compensation first day of month
						if (echoDate('D', null, that.timezone) === '1') {
							resp.month = resp.today;
						}
						
						if (typeof calbackFunc == 'function') calbackFunc(resp);
					}
				});
				
				
				// balance
				myRequest({
					type: 'POST',
					url : 'https://epn.bz/en/profile/get-balance',
					success: function(html){
						
						var ht = JSON.parse(html);
						var balance = parseFloat(ht.balance_hold) + parseFloat(ht.balance_hold)
						
						if (typeof calbackFunc == 'function') calbackFunc({'balance' : balance});
					}
				});
			


			}
			
			
		});
		
	}

}