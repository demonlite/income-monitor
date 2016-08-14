engine['shakes'] = {
	'category' 		: 'CPA',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'shakes ',				// Visible sitename
	'currency' 		: 'USD',				// RUR or USD
	'timezone' 		:  3,					// Server timezone (hours) 
	'TSL' 			: false,					// use https?
	'mainpageUrl' 	: 'http://shakes.pro/index.php?r=user/login',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://shakes.pro/index.php?r=user/login',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozQUQ4Q0UwNzBCOEQxMUU0ODA3OEY1RENEQkNEOTE1RSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozQUQ4Q0UwODBCOEQxMUU0ODA3OEY1RENEQkNEOTE1RSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjNBRDhDRTA1MEI4RDExRTQ4MDc4RjVEQ0RCQ0Q5MTVFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjNBRDhDRTA2MEI4RDExRTQ4MDc4RjVEQ0RCQ0Q5MTVFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+6adryAAAAQVJREFUeNpi/O/TxoAHHIbStrgUMDEQBoz4JFmQ2CuBWAKIHYD4Pw6bQYYdAOIXQByOboAU1ABGJAOwuUYK2eXIBthBJf4hiakCMQcQX4byQXIayGqQwwBk6180G5OAOAVN7C+yC5kIhE8cEEcDMTu+WDiMFF0gP9ZAbfkN9a8wEP8A4j9AXItkKVgfE1pUgZzWAsQBQPwNyaL3QOwKxM1oYcTIgiOR7EGLf5Dth9DU2OILA5DkT2gAJgAxMzR94E1IDEjRCBLXBuJnUPEdQGyEpgYjFkBOvAEV24akGQReAvF2qNx1ZO8gu+AFNBD/44na/1B1L7EZEEZEbgQZYE/V3AgQYAAhuTgAXn4jQgAAAABJRU5ErkJggg==',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
	
		var that = this;


		// Request 2
		myRequest({
			type: 'POST',
			url : 'http://shakes.pro/index.php?r=user/login',
			data: {
				'UserLogin[username]' : login,
				'UserLogin[password]' : pass,
			},
			success: function(html){
				
				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');

				
				var balance = tmpDom.querySelector('.personal-info dl > dd:nth-child(4)');
				if (balance) {
					balance = parseFloat(balance.innerText.clearCurrency());
					calbackFunc({'balance' : balance});
				} else {
					console.log('error parse balance');
				}
				
				
				var startDate = new Date();
				startDate.setHours( ( startDate.getHours() + (startDate.getTimezoneOffset()/60) ) + that.timezone); // comtensation timezone
				if (echoDate('D', null, that.timezone) === '1') {   // if first day of month
					startDate.setDate(0);  // start from yesterday (-1 day)
				} else {
					startDate.setDate(1);  // start from first day
				}
				
				
				myRequest({
					type: 'GET',
					url : 'http://shakes.pro/index.php',
					data: {
						'r' : 'stat/default/index',
						'date' : echoDate('DD.MM.YYYY', startDate) + ' - ' + echoDate('DD.MM.YYYY', null),
/* 						'Stats[o_id]' : '',
						'Stats[stream_id]' : '',
						'Stats[sub1]' : '',
						'Stats[sub2]' : '',
						'Stats[sub3]' : '',
						'Stats[sub4]' : '',
						'yt0' : '', */
						'download' : 'csv'
					},

					success: function(html){
						
	
						var resp = {'month' : 0, 'yesterday' : 0, 'today' : 0};
						var lines = html.split('\n'); 
						for(var i in lines) {
							var bysemi = lines[i].split(';');

							
							if (bysemi.length != 14)  continue; // prevent last string (empty) and errors in ansver 
							if (bysemi[0] === 'Дата') continue;

							var amount = parseFloat(bysemi[10].replace(',', '.')) + parseFloat(bysemi[11].replace(',', '.')) + parseFloat(bysemi[12].replace(',', '.')); // maybe not need replacing
							if (isNaN(amount)) amount = 0;
							
							//console.log(bysemi[9], bysemi[10]);
							
							if (bysemi[0] === echoDate('YYYY-MM-DD'))				resp.today = amount;	// today
							if (bysemi[0] === echoDate('YYYY-MM-DD', 'yesterday')) 	resp.yesterday = amount;	// yesterday
							if (bysemi[0] === 'Итого') 								resp.month = amount;	// month
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

}