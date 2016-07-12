
engine['adsense'] = {
	'category' 		: 'context',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'Google Adsense',		// Visible sitename
	'currency' 		: 'USD',				// RUR or USD
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'https://www.google.com/adsense/start/',	// for clickable sitename in revenue table
	'registerUrl' 	: 'https://www.google.com/adsense/start/',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAjVBMVEX////0tAD1vBxHifX1uhP2vyX+ugD1uA5EiftdecQ7d+U/eONDhfNChfX76774uAL2wzaDrvdDfecucubIo2D/vwdom/JCg/dAfu8hcvHeqDz78+Hi7Pv98tZufrj4yEd3p/YjbufUpUn414D9wx/63Yv43JD+yC9Qdc5Sj/VMjfm+oHL65Kf30m38wRrNvziUAAAAiUlEQVQYlXWPyRrCIAwGGzQUGxU3FNeqxSIuff/HM+CBHnRu839zSIriDzPvvcPsjUdE1+YBE9lvLgZNLxAohMjedqzduxcMGZP9ZaI/VQiP8L2hZMx9wKjoU8OuV8sF+zwFGqCUo4rGkxQcJQDo64XIqnMcag5AnioiUgf2vZHMbmut3ax/vf0B7y0IJeTLYx4AAAAASUVORK5CYII=',
	'getBalance' 	: function(calbackFunc, login, pass) {
		

		myRequest({
			url : 'https://accounts.google.com/ServiceLoginBoxAuth',
			headers : {
				'Origin' : 'https://accounts.google.com'
			},
			success: function(html){
				
 				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, "text/html");

				var randr = tmpDom.querySelector('[name="GALX"]');
				if (randr) {
					randr = randr.value;
				} else {
					console.log('Error! input[name="GALX"] not found.');
					return;
				}

				delete parser, tmpDom;
				
				// request 2 - login
				myRequest({
					type : 'POST',
					url : 'https://accounts.google.com/ServiceLoginBoxAuth',
					data : 'GALX='+randr+'&Email='+login+'&Passwd='+pass+'&PersistentCookie=yes&rmShown=1',
					headers : {
						'Origin' : 'https://accounts.google.com'
					},
					success: function(html){
						
						myRequest({
							type : 'POST',
							url : 'https://www.google.com/adsense/m/data/home?hl=ru',
							headers : {
								'Origin':'https://www.google.com',
								'referer':'https://www.google.com/adsense/m/',
								'client-version':'69218dd1efc637f5e670e10803dc6950422bbc72',
								'content-type':'application/x-www-form-urlencoded;charset=UTF-8',
								'x-lightfe-auth':'1'  // IMPORTANT (error 409 without it)
							},
							dataType : 'html',
							success: function(html) {
								
								var tmp = JSON.parse(html.replace(")]}'", ''));
								calbackFunc({
									'today' 		: tmp.earnings[0][2],
									'yesterday' 	: tmp.earnings[1][2],
									'month' 		: tmp.earnings[2][2],
									'balance' 		: 'n/a',
									'last_month'	: tmp.earnings[3][2]
								});
							},
							fail : function(html) {
								console.log('error', html);
								
							}
						});

					}

				});
			}

		});
	}
}	