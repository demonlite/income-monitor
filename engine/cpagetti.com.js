engine['cpagetti'] = {
	'category' 		: 'CPA',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'cpagetti',			// Visible sitename
	'currency' 		: 'RUR',				// RUR or USD
	'timezone' 		:  3,					// Server timezone (hours) 
	'TSL' 			: false,				// use https?
	'mainpageUrl' 	: 'http://cpagetti.com/admin/dashboard/index',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://cpagetti.com/',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAB3RJTUUH4AgOExQhdphX8gAAAtJJREFUeJxdkl9MEgEAh+E4Dg/h9ERSFDhWpMAqHyo0zaUSbeV6KNOtaGLoQ29uuVnaqq2HtHJtbW6uLVRM3fxTaz6US1GssK1sqYUg1ZJQFqD8FZXjuOuhUtbv+ftefvvoFEXR/m150WbsM8xOjHl+Omg0WgYmySs9rtJohbmybYb+RyBw3HCreaz78ekL+7KxNP9a9IPJbvnkYrFAAGSqLtZob7dAMPxXIHC8VVPJoi9nYemB1RCCsmUHUCGWHPSTA+0TX+1BSW4mhMqb+5+CEESnKEp/reH14BMEYUqlzI/vfS7nOgeB+QJE16AUYqmjPabpd2FlqQziF9a2tAFOm3WspzM5KXZJyy08wiFicV5GCsxhRdbxB9cnhzpMynwkCaKK1ZIxg95pszLyUI7FbK5vlCWhGQ/vLlBgcl1rW/2jroorV8Uy+Yvel5HQRsAfxXL4MJLmWlpjSOJbElG8pELZfmcWj7PPN904UVPHAEEAAEQyOZopGO4YCoWIw8ckdAZnxjQLuB1L5ZpD8zP+H3YPHt0sOlNJS1hxRRXMYcdwEtu7K+gLux1LAI1GE4jRYf1MnCABgEHG44kCSZIURUlyeCnpvPlpC8iEgAxM4nWHfN7w1kYUzcyeGuxPFKYG+kgiVlOv9K5EAqthvkjEuKytDqzY7J/dp8rTFuZdX8xmJouVJc2JE7GpwX7DzaaCAna++mDP/RGPGy86W0V3LFgaVUVcLlhbJ1gPR7o7V9NE0sAvF0HESIIoKGCr1Ok262ZvlwNGku8ZzYBYrlBX69gIPP5qTSyTNrWpQNKDb214XX6fJ8zlgMaJyMjzVaGUr67WieWKnTQsb01ZWaCu8WS6kGef+/Zm9HsoEOWmwtie1DXPZjAq3EkjMb6tSFSRxy87d3S3QhAOhBfnVp7pzf/Ht/2J02Y19nbPTo57HEsgBPFF4v3FJWUarViu2GZ+AwepWvXTIz2TAAAAAElFTkSuQmCC',
	'getBalance' 	: function(calbackFunc, login, pass) {
	
		// not tested on live account 
		// not tested on first day of month
	
		var that = this;

		myRequest({
			type: 'GET',
			url : 'http://cpagetti.com/',
			success: function(html){
			
				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');

				var randr =  tmpDom.querySelector('input[name="_csrf"]');
				if (randr) {
					randr = randr.value;
				} else {
					console.log('input[name="_csrf"] not found.');
					calbackFunc({'error' : 'UNKNOWN'});
					return;
				}
				
				// Request 2
				myRequest({
					type: 'POST',
					url : 'http://cpagetti.com/site/login',
					data: {
						'_csrf' : randr,
						'LoginForm[email]' : login,
						'LoginForm[password]' : pass
					},
					success: function(html){
						
						
						var startDate = new Date();
						startDate.setHours( ( startDate.getHours() + (startDate.getTimezoneOffset()/60) ) + that.timezone); // comtensation timezone
						if (echoDate('D', null, that.timezone) === '1') {   // if first day of month
							startDate.setDate(0);  // start from yesterday (-1 day)
						} else {
							startDate.setDate(1);  // start from first day
						}
						
						myRequest({
							type: 'GET',
							url : 'http://cpagetti.com/stat/date',
							data : {
								'report_type' : 'csv',
								'Stat[group_by]' : 'date',
								'Stat[dollar_balance]' : '0',
								'Stat[date_search]' : echoDate('YYYY.MM.DD', startDate) + ' - ' + echoDate('YYYY.MM.DD', null),// '2016.07.14 - 2016.08.14',
								'StatSubFilterForm[sub1]' : '0',
								'StatSubFilterForm[sub2]' : '0',
								'StatSubFilterForm[sub3]' : '0',
								'StatSubFilterForm[sub4]' : '0',
								'StatSubFilterForm[sub5]' : '0'
							},
							success: function(html){
							
								var resp = {'month' : 0, 'yesterday' : 0, 'today' : 0};
								var lines = html.split('\n'); 
								//console.log('lines', lines);
								for(var i in lines) {
									var bysemi = lines[i].split(',');

									if (bysemi.length != 13)  continue; // prevent last string (empty) and errors in ansver 
									if (bysemi[0] === 'Дата') continue;

									var amount = parseFloat(bysemi[10]) + parseFloat(bysemi[11]); // maybe not need replacing
									if (isNaN(amount)) amount = 0;
									
									//console.log(bysemi[0]);
									
									resp.month += amount;		// month
									if (bysemi[0] === echoDate('DD.MM.YYYY'))				resp.today = amount;		// today
									if (bysemi[0] === echoDate('DD.MM.YYYY', 'yesterday')) 	resp.yesterday = amount;	// yesterday
								}
								
								// compensation first day of month
								if (echoDate('D', null, that.timezone) === '1') {
									resp.month = resp.today;
								}
								
								if (typeof calbackFunc == 'function') calbackFunc(resp);
							}
						});						
					
					


					}
					
					
				});
			}

			
		});
	}

}