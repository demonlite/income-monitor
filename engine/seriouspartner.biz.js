
// need fix "first day" error

engine['seriouspartner'] = {
	'category' 		: 'other',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'SeriousPartner',		// Visible sitename
	'currency' 		: 'RUR',				// RUR or USD
	'TSL' 			: false,					// use https?
	'mainpageUrl' 	: 'http://seriouspartner.biz/',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://seriouspartner.biz/',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACBklEQVQ4jV2Tv2pUURDGfzNXgmIgmCJgEdAtJKbQgDYWQTEB16xvIfFPLIKtWOkDpFLE6GMkBIyBsIWNyorGNSGEYLR0tVhQlp0Zi3vuvZuc5pw5Z+abb2a+IxxZ+7OfJtVsPjOvq1tNzcjM9jKzNTVbHmnNfB30l+Kwe3NrSDyWMrN7YqaZG5k5CYDMDDVzNX+l7osnt278A1CAnca3IWCFiIUARUBCiIFMkRsK3IFY+TuxOlQCELFEyGxBSAJCAAIi3yquIMF1YAlAtm9tT4r7Z4lQNWfs8WmGp0fpNjt0H+2ifWPs3RUAus0OPPhI5oaYu4ZfVIh5JDEBhqdHOZhpMTw9eqhLfy5t5ncVEwW5rYHUQfIii8eAn9c+VMYAkqSqEAiirgI1AJHcpdvsML4xVYZKCgyJag+BPF9NyyYl5F9PfgAw8vTsIQKn3l/NexBSQgf0joXEnsAEIkg4ARzMtBh/O0WXSNOA35c3cy2k1Pmo+a7AWpEqgDNvLlRlI8igGIq7itq6Aq8hPHWl7EG32clB5dAwqtDAA1kWgJ1G+5lYLGgk6bqj1ifrO+qljEtpqxlZ+Ivj7bn7xfwfisS6DGYKKY1KiKkekY2ARUhSPrdyvgfSIOJ5gJdhhX/kMgnEgZcCjRPtud7R0oD0nd3uat/rmVtN+9bL3PYzs/X0nb8M+v8HRIMMzSBRpacAAAAASUVORK5CYII=',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		var that = this;
		
		myRequest({
			url : 'http://seriouspartner.biz/index.php?page=main&action=getform&form=login',
			dataType: 'html',
			headers : {
				Origin:'http://seriouspartner.biz',
			},
			success: function(html){
				
 				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, "text/html");
				
				var randr = tmpDom.querySelector('input[name="token"]');
				if (randr) {
					randr = randr.value;
					//console.log('randr', randr);
				} else {
					console.log('Error! input[name="r"] not found.');
					return;
				}
				
				// request 2
				myRequest({
					type : 'POST',
					url : 'http://seriouspartner.biz//index.php?page=main&action=loginAjax',
					data : {
						token: randr,
						email: login,
						password: pass
					},
					headers : {
						Origin:'http://seriouspartner.biz',
						Referer:'http://seriouspartner.biz/index.php'
					},
					dataType: 'JSON',
					success: function(html){
						
						if (html && html.errors) {
							calbackFunc({'error' : 'INVALID_PASS'});
							return;
						}
						
						// request profile (balance)
						myRequest({
							url : 'http://seriouspartner.biz/account/profile',
							headers : {
								Origin:'http://seriouspartner.biz',
								Referer:'http://seriouspartner.biz/index.php?page=account&action=statistics'
							},
							success: function(html) {
								//console.log(html);
								
								var parser = new DOMParser;
								var tmpDom = parser.parseFromString(html, "text/html");
								

								var balance = tmpDom.querySelector('.balance');
								if (balance) {
									balance = parseFloat(balance.innerText);
								} else {
									console.log('error parse balance');
								}
								
								if (typeof calbackFunc == 'function') calbackFunc({'balance' : balance});
								
								delete parser, tmpDom;
							},
							fail : function() {
								console.log('error in request profile');
							}
						});
						
						
						
						
						var result = {
							'today' : 0,
							'yesterday' : 0,
							'month' : 0,
						};
						var ansvCount = 0;
						var ydate = new Date();
						ydate.setDate(ydate.getDate() - 1);
						
						var jsonCB = function(html){

							++ansvCount;
							
							for(var country in html) {
								for(var date in html[country]) {
									var today = 0;
									today += parseInt(html[country][date]['rebills_cost']);
									today += parseInt(html[country][date]['rebills_referral_cost']);
									today += parseInt(html[country][date]['smses_cost']);
									today += parseInt(html[country][date]['smses_referral_cost']);
									today += parseInt(html[country][date]['subscription_referral_cost']);
									
									result.month += today;
									
									if (date === echoDate('YYYY-MM-DD')) result.today += today;
									if (date === echoDate('YYYY-MM-DD', ydate)) result.yesterday += today;
								}
							}
							
							if (needAnsvers == ansvCount) {
								calbackFunc(result);
							}
						}
						
						var curDay = echoDate('D');
						var needAnsvers = curDay * 2;
						
						for(var i=1; i<=curDay; i++) {

							// request NEXT
							myRequest({
								type : 'POST',
								url : 'http://seriouspartner.biz//ajax/statistics_day',
								data : {
									country_code:'RU',
									date:echoDate('YYYY') + '-' + echoDate('MM') + '-' + ('0' + i).slice(-2),
									subaccount_id:0,
									'paysite_id[]':0,
									token:randr
								},
								headers : {
									Origin:'http://seriouspartner.biz',
									Referer:'http://seriouspartner.biz/index.php?page=account&action=statistics'
								},
								dataType: 'JSON',
								success: jsonCB,
								fail : function() {
									console.log('error in request 3-1');
								}
							});	

							// request NEXT
							myRequest({
								type : 'POST',
								url : 'http://seriouspartner.biz//ajax/statistics_day',
								data : {
									country_code:'OTHER',
									date:echoDate('YYYY') + '-' + echoDate('MM') + '-' + ('0' + i).slice(-2),
									subaccount_id:0,
									'paysite_id[]':0,
									token:randr
								},
								headers : {
									Origin:'http://seriouspartner.biz',
									Referer:'http://seriouspartner.biz/index.php?page=account&action=statistics'
								},
								dataType: 'JSON',
								success: jsonCB,
								fail : function() {
									console.log('error in request 3-2');
								}
							});
						}

						
					},
					fail : function() {
						console.log('error in request 2');
					}
					
				});
				
			},
			fail : function() {
				console.log('error in request 1');
			}
			
		});
		
	}
}