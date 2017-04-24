engine['redpays'] = {
	'category' 		: 'dating',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'RedPays ',		// Visible sitename
	'currency' 		: 'RUR',				// RUR or USD
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'http://redpays.com/ru/partner',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://redpays.com/ru/partner',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABHVBMVEUAAAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD///9Yw9qdAAAAXXRSTlMAAC4xB6qxCUPx9EkHpq0JQu/ySSA/XH2c1Nedfl1AIpf2/v73niGv/7QkGaz+/7AcF6j/rhpG9/lNYf9piPv7jwSt/M1oZcr8tAYQyddwGBZs1M4TCVYlAAAiVwvnNGWXAAAAoUlEQVQYGQXBIU/DYBgGwHvat03TJig0mZlBocEg8PBXN49FIaiZAYNBEwITI+HjLiCSPw0C0ic5NSiISnJKQyBLHuzy1VCIChVp5DxJcofHJEk2yQ2Ap6QbxxGA62FILpMrwJqsncMwHADjuOqalyrgdXjWOk0VsO1Rot/wngsKvdz2Zx/fVcfj8rt9U8z5XLJ3n585dMzzPO9b203TNPEPe4olEbQMzBkAAAAASUVORK5CYII=',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		var that = this;
		
		myRequest({
			type: 'GET',
			url : 'http://redpays.com/ru/site/login',
			success: function(html){
	
 				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');
				
				
				var _csrf_token =  tmpDom.querySelector('input[name="YII_CSRF_TOKEN"]');
				if (_csrf_token) {
					_csrf_token = _csrf_token.value;
					
					console.log(that.sitename, '_csrf_token is', _csrf_token);
				} else {
					console.log(that.sitename, 'input[name="YII_CSRF_TOKEN"] not found. Return');
					return;
				}
				
				
				// request 2 : login
				myRequest({
					type: 'POST',
					url : 'http://redpays.com/ru/site/login',
					data: {
						'YII_CSRF_TOKEN' : _csrf_token,
						'LoginForm[email]':login,
						'LoginForm[password]' : pass,
						'LoginForm[rememberMe]':0,
						'login':''
					},
					headers : {
						'Referer': 'http://redpays.com/ru/site/login',
						'Origin' : 'http://redpays.com'
					},
					success: function(html){
						
						var parser = new DOMParser;
						var tmpDom = parser.parseFromString(html, 'text/html');
						
						
						
						var balance = tmpDom.querySelector('#yw2 > li:nth-child(1) > a > b');
						if (balance) {
							balance = balance.innerText;
							console.log(that.sitename, 'balance', balance);
						} else {
							console.log(that.sitename, 'error parse balance');
						}
						
						if (typeof calbackFunc == 'function') calbackFunc({'balance' : balance});

						
						// Request 2
						
						// first day of month
						var startDate = new Date();
						if (startDate.getDate() == 1) {
							startDate.setDate(0);  // start from yesterday  if 1 day of month
						} else {
							startDate.setDate(1);
						}
						
						myRequest({
							type: 'GET',
							url : 'http://redpays.com/ru/partner/statistics/index',
							data: {
								'Event[range]' : echoDate('DD.MM.YYYY', startDate) + ' - ' + echoDate('DD.MM.YYYY'),
								'YII_CSRF_TOKEN' : _csrf_token,
								'ajax' : 'data-grid'
							},
							headers : {
								'Referer': 'http://redpays.com/ru/site/login',
								'Origin' : 'http://redpays.com',
								'X-Requested-With' : 'XMLHttpRequest'
							},
							success: function(html){
								
								// console.log(that.sitename, 'get table', html);
								
								var parser = new DOMParser;
								var tmpDom = parser.parseFromString(html, 'text/html');

								var resp = {'month' : 0, 'yesterday' : 0, 'today' : 0};

								resp.yesterday = tmpDom.querySelector('[data-chart="'+echoDate('YYYY-MM-DD', 'yesterday')+'"] td:nth-child(8)').innerText;
								resp.today     = tmpDom.querySelector('[data-chart="'+echoDate('YYYY-MM-DD')+'"] td:nth-child(8)').innerText;
								resp.month     = tmpDom.querySelector('tfoot td:nth-child(8)').innerText;

								// compensation first day of month
								if (new Date().getDate() == 1) {
									resp.month = resp.today;
								}
								
								calbackFunc(resp);

							},
							fail : function() {
								console.log(that.sitename, 'error request 2');
							}
						});
						
						
					},
					fail : function() {
						console.log('error request 1');
					}

				});
			},
			
			fail : function() {
				console.log('redpays.com. Error in request for gets csrf_token');
			}
		});
		
		

	}
}