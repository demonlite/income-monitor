
engine['profitraf'] = {
	'category' 		: 'files',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'ProfiTraf ',			// Visible sitename
	'currency' 		: 'RUR',				// RUR or USD
	'timezone' 		:  3,					// Server timezone (hours) 
	'TSL' 			: false,					// use https?
	'mainpageUrl' 	: 'http://profitraf.ru/login.pl',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://profitraf.ru/login.pl',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAC4jAAAuIwF4pT92AAACJ0lEQVR42jVPTW/TQBTcqvxRLqgIiRPHSqmQOHLggMIFcQZVDRd6SYuoQELQcGlCSuM0TRM7/t4Pr/fLTmzermH1tJo382b2LZLKlGpb6prrLasUV1WhNTcG2kJVXNegSq3K6h+JmNnCBBicvAUZALRSC5BKbUAVZsvlrgsFQ22RHYIAC6iubJgx1GhgWGWAgSDbGoO6PFqr0uW59awTgjq/VHXnt7upGim9dYILU0oY7Z6uuwUKLbn7iTCV3dm90Gn10Y/46DJ6Pop7o03btujNOeqf7ffPAez3hyezAL5k/yBkBcFMmmffw8Nfiax2vVFyOAqbtj3z8d7r4fEsbN0xuiFaISxNrjQV5um3oPczJqY+vEyg2nY38KK9V6cf52CoiTJUaLhRIhTmKivl44vg4Ovq4Iv/5MLvIk/++Ojlp4Hnt02blSoVMiklirmIuImYfPh5+W6awlzTwDotvPxhut57cXwyz8AQFmXCVMQ0CnEZUhGS4tFw+fY3hk2g3TBbp57/oPd+4G0syfiaarjRioh7Qte4WFFu99g1gAPM15j6hIecN45d5dwnAiR0l5W3GV/m4i6ngKHmuHDA3ouULVIO0n1WLFJLops0B2oes0VMvCT3EuYl5DahFsTFPKVz4AHE5CYls4yi64hCTaNsFtNJnF1HBPBNRCwI8STGjklmMZ6GwBA0CbKrMBtv8nFAxhsAyThgjsn+M/kkzK98PI5yaP8C2DmyzIS4mTsAAAAASUVORK5CYII=',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		// first day - ready
		// timezone - ready
		
		
		var that = this;
		
		var startDate = new Date();
		startDate.setHours( (startDate.getHours() + (startDate.getTimezoneOffset() / 60)) + that.timezone); // comtensation timezone
		if (echoDate('D', null, that.timezone) === 1) {   // if first day of month
			startDate.setDate(0);  // start from yesterday (-1 day)
		} else {
			startDate.setDate(1);  // start from first day
		}
		
		var param = {
			'utm[source]': '',
			'type': 'source',
			'data': 'downloads',
			'utm[medium]': '',
			'utm[campaign]': '',
			'utm[term]': '',
			'utm[content]' : '',
			'site' : '0',
			'date_from' : echoDate('DD-MM-YYYY', startDate, that.timezone),
			'date_to'   : echoDate('DD-MM-YYYY', null, that.timezone),
			'product_type' : 'all'
		}

		var paramUrl = 'http://profitraf.ru/statistics.pl?' + Object.keys(param).map(function(key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
		}).join('&');
		
		myRequest({
			type: 'POST',
			url : 'http://profitraf.ru/login.pl',
			data: {
				'login' : login,
				'password' : pass,
				'referer'  : paramUrl
			},
			headers : {
				'Origin' : 'http://profitraf.ru',
			},
			success: function(html){
				
				var resp = {'month' : 0,'yesterday' : 0,'today' : 0,'balance' : 0};
				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');
	
	
				var balance = tmpDom.querySelector('#header div.content > div:nth-child(1) > strong');
				if (balance) {
					resp.balance = parseFloat(balance.innerText.clearCurrency());
				} else {
					console.log('error parse balance');
				}
			
				var elems = tmpDom.querySelectorAll('#content > table > tbody > tr');
				
				for(var i in elems){
					if (!elems.hasOwnProperty(i)) continue;
					
					var td1 	= elems[i].querySelector('td:first-of-type').innerText;
					var revenue = elems[i].querySelector('td:last-of-type').innerText;
			
					if (td1 === 'Итого:') resp.month += parseFloat(revenue.clearCurrency());
					if (td1 === echoDate('DD.MM.YYYY', 'yesterday')) resp.yesterday += parseFloat(revenue.clearCurrency());
					if (td1 === echoDate('DD.MM.YYYY')) resp.today = parseFloat(revenue.clearCurrency());
				}
				
				// compensation first day of month
				if (echoDate('D', null, that.timezone) === 1) {
					resp.month = resp.today;
				}
				
				calbackFunc(resp);

			},
			fail : function() {
				console.log('error request 1');
			}

		});
		

	}
}