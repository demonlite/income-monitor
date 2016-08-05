engine['exoclick'] = {
	'category' 		: 'adult',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'ExoClick',			// Visible sitename
	'currency' 		: 'USD',				// RUR or USD
	'timezone' 		: -4,					// Server timezone (hours) 
	'TSL' 			: true,					// use https?
	'referalProg'	: undefined,					// 
	'mainpageUrl' 	: 'https://admin.exoclick.com/login.php',	// for clickable sitename in revenue table
	'registerUrl' 	: 'https://exoclick.com/',	// Registration page URL
	'icon'			: 'data:image/png;base64,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',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		// first day not needed to fix
		
		var that = this;
		
		//console.log(that);

		myRequest({
			type: 'GET',
			url : 'https://admin.exoclick.com/login.php',
			headers : {
				'Referer': 'https://admin.exoclick.com/login.php',
				'Origin' : 'https://admin.exoclick.com'
			},
			success: function(html){

 				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');
				
				var randr =  tmpDom.querySelector('input[name="csrf_token"]');
				if (randr) {
					randr = randr.value;
				} else {
					console.log('input[name="csrf_token"] not found. Try without him');
					randr = '';
				}
				delete parser, tmpDom;

				// Request 2
				myRequest({
					type: 'POST',
					url : 'https://admin.exoclick.com/login.php',
					data: {
						'username' : login,
						'pass' : pass,
						'csrf_token' : randr
					},
					headers : {
						'Referer': 'https://admin.exoclick.com/login.php',
						'Origin' : 'https://admin.exoclick.com'
					},
					success: function(html){


 						myRequest({
							type: 'GET',
							url : 'https://admin.exoclick.com/index-publishers.php',
							headers : {
								'Referer': 'https://admin.exoclick.com/',
								'Origin' : 'https://admin.exoclick.com'
							},
							success: function(html){
								var parser = new DOMParser;
								var tmpDom = parser.parseFromString(html, "text/html");
								
								var today = tmpDom.querySelectorAll('.content > div > div > div > span')[3];
								if (today) {
									today = parseFloat(today.innerText.clearCurrency());
								} else {
									console.log('error parse today');
								}

								var last_month = tmpDom.querySelectorAll('.content > div > div > div > span')[5];
								if (last_month) {
									last_month = parseFloat(last_month.innerText.clearCurrency());
								} else {
									console.log('error parse last_month');
								}
								
								var month = tmpDom.querySelectorAll('.content > div > div > div > span')[7];
								if (month) {
									month = parseFloat(month.innerText.clearCurrency());
								} else {
									console.log('error parse month');
								}

								var prediction = tmpDom.querySelectorAll('.content > div > div > div > span')[9];
								if (prediction) {
									prediction = parseFloat(prediction.innerText.split(' ')[0].clearCurrency());
								} else {
									console.log('error parse prediction');
								}
								
								if (typeof calbackFunc == 'function') calbackFunc({'balance' : 'n/a', 'today' : today, 'month' : month, 'prediction' : prediction, 'last_month' : last_month});
								delete parser, tmpDom;
							}
						});
						
/* 						// first day of month
						
						if (date.getDate() == 1) {
							date.setDate(0);  // start from yesterday
						} else {
							date.setDate(1);
						} */
						
						
						
						var startDate = new Date();
						startDate.setHours( (startDate.getHours() + (startDate.getTimezoneOffset() / 60)) + that.timezone); // comtensation timezone
						if (echoDate('D', null, that.timezone) === 1) {   // if first day of month
							startDate.setDate(0);  // start from yesterday (-1 day)
						} else {
							startDate.setDate(1);  // start from first day
						}
						
						
						myRequest({
							type: 'POST',
							url : 'https://admin.exoclick.com/ajax/api.php',
							data: {
								'alias' : 'date',
								'pagination' : 'false',
								'request[stats][filter][]' : 'date',
								//'request[stats][user]' : 'XXXXX',
								'request[stats][debug]' : '0',
								'request[stats][date][from]' : echoDate('YYYY-MM-DD', startDate, that.timezone), 
								'request[stats][date][to]'   : echoDate('YYYY-MM-DD', null, that.timezone),
								'button[text]' : 'Даты',
								'valuesPicker[graphs][0][id]' : 'sgraph1',
								'valuesPicker[graphs][0][default]' : 'Revenues',
								'valuesPicker[graphs][0][type]' : 'column',
								'valuesPicker[graphs][1][id]' : 'sgraph2',
								'valuesPicker[graphs][1][default]' : 'Impressions',
								'valuesPicker[graphs][1][type]' : 'line',
								'valuesPicker[graphs][1][yAxis]' : '1',
								'valuesPicker[values][]' : 'Revenues',
								'valuesPicker[values][]' : 'eCPM',
								'valuesPicker[values][]' : 'Clicks',
								'valuesPicker[values][]' : 'Impressions',
								'valuesPicker[values][]' : 'Video Impressions',
								'valuesPicker[values][]' : 'Views',
								'valuesPicker[values][]' : 'CPV',
								'valuesPicker[values][]' : 'View Ratio',
								'valuesPicker[values][]' : 'CTR %',
								'valuesPicker[conditionallyDisplayedValues][vast][]' : 'Video Impressions',
								'valuesPicker[conditionallyDisplayedValues][vast][]' : 'Views',
								'valuesPicker[conditionallyDisplayedValues][vast][]' : 'CPV',
								'valuesPicker[conditionallyDisplayedValues][vast][]' : 'View Ratio',
								'valuesPicker[conditionallyDisplayedValues][nonVast][]' : 'Impressions',
								'valuesPicker[initiallyHiddenConditions][]' : 'vast',
								'config[column]' : 'ddate',
								'config[columns][]' : 'ddate',
								'config[columns][]' : 'clicks',
								'config[columns][]' : 'impressions',
								'config[columns][]' : 'video_hits',
								'config[columns][]' : 'video_views',
								'config[columns][]' : 'cpv',
								'config[columns][]' : 'vtr',
								'config[columns][]' : 'ctr',
								'config[columns][]' : 'cpm',
								'config[columns][]' : 'revenue',
								'config[service]' : '2',
								'config[serverSide]' : 'false',
								'graph[id]' : 'DATE',
								'graph[table_title]' : 'Ежедневная динамика',
								'graph[column_title]' : 'Дата',
								'valueColumn' : 'revenue',
								'limit' : '50',
								'isLoading' : 'true',
							},
							headers : {
								'Referer': 'https://admin.exoclick.com/',
								'Origin' : 'https://admin.exoclick.com'
							},
							success: function(dat1){
								
								dat = dat1;
								
								if (!dat.result) {
									console.log('Error getting data from https://admin.exoclick.com/ajax/api.php');
									return;
								}
								
								// yesterday
								var yesterday = 0;
								//var tdate = new Date();
								//tdate.setDate(tdate.getDate() - 1); // Yes, -2 day, fucked time zones!
								
								for(var i in dat.result){
									//if (dat.result[i].ddate === echoDate('YYYY-MM-DD', tdate, that.timezone)) yesterday = dat.result[i].revenue;
									//console.log(dat.result[i].ddate, echoDate('YYYY-MM-DD', 'yesterday', that.timezone));
									if (dat.result[i].ddate === echoDate('YYYY-MM-DD', 'yesterday', that.timezone)) yesterday = dat.result[i].revenue;
								}
								
								
								calbackFunc({'yesterday' : yesterday});
							}
						});
					
					
					}
					
					
				});
			}
			
			
		});
	}
}