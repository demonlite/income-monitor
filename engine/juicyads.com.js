engine['juicyads'] = {
	'category' 		: 'adult',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'JuicyADS',		// Visible sitename
	'currency' 		: 'USD',				// RUR or USD
	'timezone' 		: -4,	// or -7?				// Server timezone (hours) 
	'TSL' 			: true,					// use https?
	'referalProg'	: true,					// 
	'mainpageUrl' 	: 'https://manage.juicyads.com/login.php',	// for clickable sitename in revenue table
	'registerUrl' 	: 'https://manage.juicyads.com/signup.php',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAACWElEQVQokY2SW0iUYRCGZ9XCEkRRIcITlGtUVogiURqGtFSEpUSWqEmkZWoZVLpQHlIM8ZDhKtvJQ4haqaChRFp44WHbddeLzIQuWqHdAmuVgm7iqf83SIsumptvBma+mffhlR8r4oPTYeqoNN9MtjWmWY3Z5luZpo7qT/PzK3vk1wOM9zS8vbaBiz5kCMYEmnZzdjVlG1/rd1ietCkNywNKMdJa/O1VN9WRZAq5QlUopd6cE7U0xC4+Kh1vr1sesI30LVSEqX8PFVDqyXWh3pcqoUwo8WTsOjVRH3NDZiyj6oB6THkCmWtJF4qE+5u4406HP60ajO60bKFIQ5qQFzB2Qac0y+zM9EJZGElCtlAsNAn9WibjGA2hyx+DcFXIEo6JPT3Y4XCI5dlDhmvpy6N+KzV+tPozsYvvX/hqZSgcoxc3fKjdTutxKpLNT3tlaqCZ2r0qmXyhXLgrDAWw+Jz3VQx6cFtUSQUaSrQUH5rqbRbLUA/6CBKFU4JeaPSm3YfhaPqFzlDq3SlcYpWi4WS4ZfCxzM3ZHelBZPmRqgiIpCGIGmXPOlWMkrTFoPdSBFC42blzld3+TqU0lh9PxQFeGmlLVNlfFuqCKBEuLR0zUc29I5zeNpq5R6WkoJ21TTj3raG7nBThqKh8jfHkLSVKWRuLQe+M8XgzObFsDVOnwRXnRkYwuYGccONFJfr1ZPtyJYLUMFe0xvTA8LeXrAOd0zo/YjQkhXB+PzlxHAwkSqbj/az9XX946Xe4XJ9NbXXmHJ3tsNaWqDWf0Zla6lwu1z/c+v/xE37wBL71w/gOAAAAAElFTkSuQmCC',
	'getBalance' 	: function(calbackFunc, login, pass) {
		

		var loginCount = 0;
		var that = this;
		
		var firstlogin = function(html) {
			
			console.log('firstlogin run');
			
			// If "Incapsula" fuck the brain.
			if (html.indexOf('content.incapsula.com/jsTest.html') != -1) {
				
				console.log('Need SWHANEDL request');

				var match = /b="(.*?)"/i.exec(html);

				var z = '';
				var b = match[1];
				for (var i = 0; i < b.length; i += 2) {
					z = z + parseInt(b.substring(i, i + 2), 16) + ",";
				}
				z = z.substring(0, z.length - 1);
				
				var code = String.fromCharCode.apply(null, z.split(','));
				var match = /SWHANEDL=(.*?)"/i.exec(code);
				var url = 'https://manage.juicyads.com/_Incapsula_Resource?SWHANEDL=' + match[1];
				
				
				myRequest({
					type: 'GET',
					url : url,
					dataType: 'text',
					headers : {
						'Referer': 'https://manage.juicyads.com/',
						'Origin' : 'https://manage.juicyads.com'
					},
					success: function(html){
						
						//console.log('success');

						tryLogin(reallyGetStat);
						
					},
					fail: function(html){
						//console.log('fail');
					}
				});
				
			} else {
				reallyGetStat(html);
			}
		};
		
		
		function tryLogin(callback){
			myRequest({
				type: 'POST',
				url : 'https://manage.juicyads.com/login2.php',
				data: {
					'username':login,
					'userpass':pass
				},
				headers : {
					'Referer': 'https://manage.juicyads.com/',
					'Origin' : 'https://manage.juicyads.com'
				},
				success: function(html){
					//reallyGetStat(html);
					callback(html);
				},
				fail: function(html){
					console.log('fail login');
					loginCount++;
					
					if (loginCount < 3) {
						var time = (Math.random() * 6000) + 4000;
						setTimeout(function() {
							tryLogin(firstlogin);
						}, time);
					}
				}
			});
		}
		
		
		function reallyGetStat(){
			
			console.log('reallyGetStat');
			
			var startDate = new Date();
			startDate.setHours( (startDate.getHours() + (startDate.getTimezoneOffset() / 60)) + that.timezone); // comtensation timezone
			if (echoDate('D', null, that.timezone) === 1) {   // if first day of month
				startDate.setDate(0);  // start from yesterday (-1 day)
			} else {
				startDate.setDate(1);  // start from first day
			}
			
			myRequest({
				type: 'POST',
				url : 'https://manage.juicyads.com/admin-stats.php',
 				data: {
					'span_month_start' : echoDate('MM', startDate, that.timezone),
					'span_day_start'   : '01',
					'span_year_start'  : echoDate('YYYY', startDate, that.timezone),
					'span_month_end'   : echoDate('MM', null, that.timezone),
					'span_day_end'     : '31',
					'span_year_end'    : echoDate('YYYY', null, that.timezone),
					'method' : '1',
					'f15401' : '1',
					'f15101' : '1',
					'f15201' : '1',
					'f15301' : '1',
					'f15402' : '1',
					'f15102' : '1',
					'f15202' : '1',
					'f15302' : '1'
				}, 
				headers : {
					'Referer': 'https://manage.juicyads.com/',
					'Origin' : 'https://manage.juicyads.com'
				},
				success: function(html){
					var resp = {'month' : 0, 'yesterday' : 0, 'today' : 0, 'balance' : 0};
					var parser = new DOMParser;
					var tmpDom = parser.parseFromString(html, 'text/html');
					var elems = tmpDom.querySelectorAll('table td:nth-child(2) > table table:nth-child(4) > tbody > tr');
					
					var balance = tmpDom.querySelector('table tr > td:nth-child(2) > table table:nth-child(1) > tbody > tr > td:nth-child(3) font > b:nth-child(3)');
					if (balance) {
						resp.balance = parseFloat(balance.innerText.clearCurrency());
						console.log('balance', balance);
					} else {
						console.log('error parse balance');
					}
				
					try {
						var month = elems[elems.length-1].getElementsByTagName('td')[3].innerText;
						resp.month = parseFloat(month.clearCurrency());
					} catch (e) {
						console.log('err', e);
					}
					
					
 					for(var i in elems){
						if (!elems.hasOwnProperty(i)) continue;
						if ( elems[i].querySelectorAll('td').length == 0) continue;
						
						var td1 	= elems[i].querySelector('td:first-of-type').innerText;
						var td2 	= elems[i].getElementsByTagName('td')[3].innerText
						var revenue = elems[i].getElementsByTagName('td')[3].innerText
						
/* 						if (td1 === '2016-02-10') resp.yesterday += parseFloat(revenue.clearCurrency());
						if (td1 === '2016-02-09') resp.today += parseFloat(revenue.clearCurrency()); */
						
 						if (td1 === echoDate('YYYY-MM-DD', 'yesterday', that.timezone)) resp.yesterday += parseFloat(revenue.clearCurrency());
						if (td1 === echoDate('YYYY-MM-DD', null, that.timezone)) 		resp.today += parseFloat(revenue.clearCurrency());
					}
					
					// compensation first day of month
					if (echoDate('D', null, that.timezone) === 1) {   // if first day of month
						resp.month = resp.today;
					}
					
					if (typeof calbackFunc == 'function') calbackFunc(resp);
				}
			});
			
		}
		
		
		myRequest({
			type: 'GET',
			//url : 'https://manage.juicyads.com/index.php',
			url : 'https://manage.juicyads.com/_Incapsula_Resource?SWKMTFSR=1&e=' + Math.random(),
			headers : {
				'Referer': 'https://manage.juicyads.com/',
				'Origin' : 'https://manage.juicyads.com'
			},
			success: function(html){
				
				
				myRequest({
					type: 'GET',
					url : 'https://manage.juicyads.com/index.php',
					headers : {
						'Referer': 'https://manage.juicyads.com/',
						'Origin' : 'https://manage.juicyads.com'
					},
					success: function(html){

					}
				});
				
				

				var time = (Math.random() * 5000) + 3000;
				setTimeout(function(){
					
					// Request 2
					tryLogin(firstlogin);
					
				}, time);
			}
			
			
		});
	}
}