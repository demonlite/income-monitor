engine['sociate'] = {
	'category' 		: 'social',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'Sociate',			// Visible sitename
	'currency' 		: 'RUR',				// RUR or USD
	'timezone' 		:  3,					// Server timezone (hours) 
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'https://sociate.ru/wallet/finances/#/payments',	// for clickable sitename in revenue table
	'registerUrl' 	: 'https://sociate.ru/info/income_mon',	// Registration page URL
	'icon'			: 'data:image/x-icon;base64,AAABAAEAEBAAAAEACABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAA6NvCALyTSwDIp20AyadtAMSgYADVu48A0LSCALuRSAC+l1AAw55dAM+yfwDl1bkAuo9FANzGoQDHo2cA5NO2ALiNQgDIp2wAt4s/AN7KpgDOrnkAtok8ANS5iwDbxqAA3MagALiNQQDRtYUAt4s+AMSfYADYwJcA4M2sANvGnwC9lE0A38upALeLPQDLrHQA5ta7ALqQRwDYwJYAwp1cAMOdXAC5jkQA4M2rALqORADSt4YAyahuAN/LqADRtYMAu5JJALqQRgDHpGgAuY5DALqOQwC4jEAAzq96AMakZwDLq3QAvZVPANO4iQC+lU8AuY5CALyTTAC3jD8A0raGALiMPwDEoGEAu5FJAL6XUQDLq3MA4c6tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHhcAAAAANhwAAAAAAAAkDRILLi0CNScGGgAAAAAEKAAAADQ0NCcAAEUJAAAAOgAAPBM0ND0AAAAAPQAAFA0hNDQ0NDQ0AAAAAAo7OBw0NDQ0NDQRDwAlAABFHTE0NDQ0NDQ0GjAYPxAAFT4INDQ0NDQ0NBobGUEfADchRBo0NDQ0NDQRAwAgAAA5HQBGMzQ0NDQ0NDIAAAAABQcAAAArQkE0NDQ9AAAAACwAAAAAAAAMITQ0NA4AAEAmAAAAAAAAAAABKUMqLyIaAAAAAAAAAAAAAAAAABYjAAAAAAAAAAAAAAAAAAAAAAAAAP//AAD55wAA4AMAAM4ZAADYPQAAgDwAAAAsAAAABAAAAAQAAAAsAACAPAAA4D0AAPgZAAD+AwAA/+cAAP//AAA=',
	'getBalance' 	: function(calbackFunc, login, pass) {
	
		// not tested on live account 
		// not tested on first day of month
	
		var that = this;

		
		// Request 2
		myRequest({
			type: 'POST',
			url : 'https://sociate.ru/accounts/login/',
			data: {
				'remember_me' : 1,
				'next' : '/',
				'target_initial_tariff' : '',
				'target_initial_plan' : '',
				'identification' : login,
				'password' : pass
			},
			success: function(html){
				
				
				var startDate = new Date();
				startDate.setHours( ( startDate.getHours() + (startDate.getTimezoneOffset()/60) ) + that.timezone); // comtensation timezone
				if (echoDate('D', null, that.timezone) === '1') {   // if first day of month
					startDate.setDate(0);  // start from yesterday (-1 day)
				} else {
					startDate.setDate(1);  // start from first day
				}
				
				/* myRequest({
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
					
				});	*/		 			
			
			


			}
			
			
		});

	}

}