engine['mamba'] = {
	'category' 		: 'dating',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'Mamba ',				// Visible sitename
	'currency' 		: 'RUR',				// RUR or USD
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'https://partner.mamba.ru/login.phtml',	// for clickable sitename in revenue table
	'registerUrl' 	: 'https://partner.mamba.ru/login.phtml',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAB3RJTUUH3gUZCTYwoQXazAAAAaZJREFUeJyNks1LG0Echt/ZnYRNzMcqJocQIoUmxQriwUP14s0eBD+OehVUGnoo9ND/oJ5EL1YRQdr/oNBDiceAAS8eSrGRYIgiysZ13RiTzGRnesiKjdCYlznMA79nGOYdksvl4jdbkbsfXsfA/8PUiBGYOu9dofHrzZj1FYDsMA54HCNm7kEIUvumexyr4/BjuKpTWrd+H7g8OPaMQLlFnQb0me0W1wvLZ8eo2vAHEXsJQnCeR/UWPSHEX0HzAwC5X4Pvg3v/7Jw/Mbuk9r+unP652t+lmndgZpGEXtSMy+vMxvCoCYDcfQaAnk8SAL84Uj0qCSaIFrZPjnxhn6o4JJQg3kD5MKPtTxICRTAI9vB22dXql2F7axRAKDnCsqvVzaHKzjiAvpEJ3lAFeyIcZwSDsNxC2K/vgsExSgAUjxcICAZFckjuCqWCIzmKBReLJ20om5C8XYjMr0uO6MJ6C6MLbdgSYKZhpiEf8u/+Cd58DJtpEHOpq44fu2tSnda7/RpNTVfs1DQcdLns5BQtv3lHmjyY/0nvzU5n+/sqqbflsfd/AS0Y4MYCiKBxAAAAAElFTkSuQmCC',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		// first day not neet to fix - today balance not available

		myRequest({
			type: 'GET',
			url : 'https://partner.mamba.ru/login.phtml',
			headers : {
				'Referer': 'https://partner.mamba.ru/login.phtml',
				'Origin' : 'https://partner.mamba.ru'
			},

			success: function(html){

 				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, "text/html");
				
				var randr =  tmpDom.querySelector('input[name="s_post"]');
				if (randr) {
					randr = randr.value;
				} else {
					console.log('input[name="s_post"] not found. Try without him');
				}

				// Request 2
				myRequest({
					type: 'POST',
					url : 'https://partner.mamba.ru/login.phtml',
					data: {
						's_post' : randr,
						'login' : login,
						'password' : pass,
						'sbmFrmLogin' : 'авторизоваться'
					},
					headers : {
						'Referer': 'https://partner.mamba.ru/login.phtml',
						'Origin' : 'https://partner.mamba.ru'
					},
					cookies : {
						// i not sure what i can use this
						'mmbTracker' : '1452464929_X2axcc8qwQGb3NCt4N6ttUuGxeZhcCyBnSIK2c6pS41hE6cU5YDJJ5klQCogARBs33OB5fBrnJGvIwjkhLtiC98xLoWB3hBgoosT8pV'
					},
					success: function(html){

						var parser = new DOMParser;
						var tmpDom = parser.parseFromString(html, "text/html");
						
						var elem = tmpDom.querySelector('form [style="color:red"]');
						if (elem) {
							if (typeof calbackFunc == 'function') calbackFunc({'error' : 'INVALID_PASS'});
							return;
						}
						
						var resp = {
							'yesterday' : 0,
							'today' : 'n/a',
							'balance' : 0
						}
						
						var balance = tmpDom.querySelector('.b-head-balane');
						if (balance) {
							resp.balance = parseFloat(balance.innerText.clearCurrency());
						} else {
							console.log('error parse balance');
						}
						
						// yesterday
						var txtDate = echoDate('YYYY-MM-DD', 'yesterday');
						
						var tbl = tmpDom.querySelectorAll('.b-report__table tbody tr[class]');
						for(var i in tbl){
						if (!tbl.hasOwnProperty(i)) continue;
							if ( $('.td1', tbl[i]).text() == txtDate) {
								var brutto = $('.td5', tbl[i]).text().clearCurrency();
								resp.yesterday = (brutto === '-') ? 0 : parseFloat(brutto);
							}
						}
						
						calbackFunc(resp);
						

						
						// prepare  Request 3
						
						var fromExp = /getPrograms\(\)\.join\(','\)\s\|\|\s'(.*)'/im.exec(tmpDom.body.innerHTML);
						
						if (!fromExp[1]) {
							console.log('mamba : error parse programIds');
							return;
						}
					
						// Request 3 - month
						myRequest({
							type: 'POST',
							url : 'https://partner.mamba.ru/report/index.phtml?action=update',
							data: {
								'period' 	: echoDate('YYYY-MM-DD', 'firstDayThisMonth') + ':' + echoDate('YYYY-MM-DD'),
								'type' 		: 'all',
								'programIds': fromExp[1],
								'linkIds' 	: '',
								's_post' 	: randr
							},
							headers : {
								'Referer': 'https://partner.mamba.ru/report/index.phtml',
								'Origin' : 'https://partner.mamba.ru'
							},
							success: function(html){
								
								calbackFunc({'month' : html.summary});
								
								// Request 4 - logoff
								myRequest({
									type: 'GET',
									url : 'https://partner.mamba.ru/logout.phtml?&s_post='+randr,
									headers : {
										'Referer': 'https://partner.mamba.ru/report/index.phtml',
										'Origin' : 'https://partner.mamba.ru'
									},
									success: function(html){

									}
								});
								
							}
							
							
						});
						
					} // end of 'success'
					
				});

			}

		});
	}
}