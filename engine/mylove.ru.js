engine['mylove'] = {
	'category' 		: 'dating',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'MyLove',		// Visible sitename
	'currency' 		: 'RUR',				// RUR or USD
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'http://partner.mylove.ru/stat/total',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://partner.mylove.ru/?29154766',	// Registration page URL
	'icon'			: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlmAkR5ZgJEkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlmAkR5ZgJPaWYCT4lmAkSQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZgJKCWYCT/lmAk/5ZgJPiWYCRJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACWYCQDlmAkqJZgJP+WYCT/lmAk+JZgJEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlmAkPZZgJBUAAAAAAAAAAJZgJAOWYCSolmAk/5ZgJP+WYCT4lmAkSAAAAAAAAAAAAAAAAAAAAAAAAAAAlmAkRpZgJPWWYCTRlmAkFQAAAAAAAAAAlmAkA5ZgJKiWYCT/lmAk/5ZgJPiWYCRIAAAAAAAAAAAAAAAAlmAkRpZgJPWWYCT/lmAk/5ZgJI0AAAAAAAAAAAAAAACWYCQDlmAkqJZgJP+WYCT/lmAk+JZgJEgAAAAAlmAkKpZgJPWWYCT/lmAk/5ZgJLGWYCQGAAAAAAAAAAAAAAAAAAAAAJZgJAOWYCSolmAk/5ZgJP+WYCT1lmAkL5ZgJKuWYCT/lmAk/5ZgJLGWYCQGAAAAAAAAAACWYCQPlmAkFQAAAAAAAAAAlmAkA5ZgJKeWYCT/lmAk/5ZgJLOWYCTrlmAk/5ZgJOWWYCQIAAAAAAAAAACWYCQPlmAkypZgJNGWYCQVAAAAAAAAAACWYCQFlmAk3JZgJP+WYCTzlmAk75ZgJP+WYCTZlmAkAQAAAACWYCQPlmAkypZgJP+WYCT/lmAk0ZZgJBUAAAAAAAAAAJZgJM2WYCT/lmAk9ZZgJLSWYCT/lmAk/5ZgJKCWYCRelmAk0pZgJP+WYCT/lmAk/5ZgJP+WYCTXlmAkYZZgJJqWYCT/lmAk/5ZgJLqWYCQ2lmAk+ZZgJP+WYCT/lmAk/5ZgJP+WYCT/lmAk2pZgJNiWYCT/lmAk/5ZgJP+WYCT/lmAk/5ZgJPqWYCQ5AAAAAJZgJEqWYCTmlmAk/5ZgJP+WYCT/lmAkxZZgJB+WYCQdlmAkw5ZgJP+WYCT/lmAk/5ZgJOmWYCRPAAAAAAAAAAAAAAAAlmAkCJZgJEaWYCRalmAkM5ZgJAEAAAAAAAAAAAAAAACWYCQylmAkWJZgJEeWYCQJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP5/AAD8PwAA/h8AAP8PAADnhwAAw8MAAIfhAAAP8AAAHngAABw4AAAIEAAAgAEAAMGDAAD//wAA//8AAA==',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		


				
				// Request 2
				myRequest({
					type: 'POST',
					url : 'https://partner.mylove.ru/login/',
					headers : {
						'Referer': 'https://partner.mylove.ru/',
						'Origin' : 'https://partner.mylove.ru'
					},
					data: {
						'email':login,
						'password':pass
					},
					success: function(html){

						//console.log(html);
						
						var parser = new DOMParser;
						var tmpDom = parser.parseFromString(html, "text/html");
						
						
						var balance = tmpDom.querySelector('#inheader > div:nth-child(1) > a:nth-child(2) > span:nth-child(2)');
						if (balance) {
							balance = balance.innerText;
						} else {
							console.log('error parse balance');
						}
						
						if (typeof calbackFunc == 'function') calbackFunc({'balance' : balance});
						

						
						// Request 3
						myRequest({
							type: "GET",
							url : 'https://partner.mylove.ru/stat/total',
							dataType: 'html',
							success: function(html){
								
								//console.log('html', html);
								
								var parser = new DOMParser;
								var tmpDom = parser.parseFromString(html, "text/html");
								
								//tmpDom2 = tmpDom;
								var resp = {};
								
								var month = tmpDom.querySelector('.ptable > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(5)');
								if (month) {
									resp.month = parseFloat(month.innerText.clearCurrency());
								} else {
									console.log('error parse month');
								}

								var last_month = tmpDom.querySelector('.ptable > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6)');
								if (last_month) {
									resp.last_month = parseFloat(last_month.innerText.clearCurrency());
								} else {
									console.log('error parse last_month');
								}

								var today = tmpDom.querySelector('.ptable > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)');
								if (today) {
									resp.today = parseFloat(today.innerText.clearCurrency());
								} else {
									console.log('error parse today');
								}
								
								var yesterday = tmpDom.querySelector('.ptable > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(3)');
								if (yesterday) {
									resp.yesterday = parseFloat(yesterday.innerText.clearCurrency());
								} else {
									console.log('error parse yesterday');
								}
								
								if (typeof calbackFunc == 'function') calbackFunc(resp);
								delete parser, tmpDom;
							}
							
							
						});
					}
					
					
				}); 

	}
}