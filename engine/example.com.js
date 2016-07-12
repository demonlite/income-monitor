
engine['example'] = {
	'category' 		: 'dating',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'Example Site',		// Visible sitename
	'currency' 		: 'RUR',				// RUR or USD
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'http://site.com/',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://site.com/',	// Registration page URL
	'icon'			: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABUElEQVR42qWTTygEURzHvU1OtFdHXCiJE8phb2sPnJR/h6VcxE2SktRubdOWi5ubkm2LTW3tAW0xCicyJyc5iCPXDa3Pq9/bXtNgJlOfvm9+7/f97szvzaqmf14qSnPXxHoccWAUYo8lpyN0AOZ2ZAPaYE7XCFDK1zSE9MALm2dWfQSZglvqe9zXWW+zXlVW0wEya+W5sAhrMC+1L6jBM+buxgwwZ5DNCOPoJODJDnhH4iHNaW2BE0JuTEA9pHkJmmEH+gnwTMAdMvCHOQuncClzaCXg0wQMI9e/mPOwD/cQg0nMh40ZSEgf4gWY9YALsteiTwbzrtm0A5JyTDkYlLI+xiv5Zd07g7lop5tXWEEW2OxlXWY9DtPwChfSO8Z+xf94JuAB0R/GB7xBSo7qSPoSmN2g4ZiAqpzCMSzTXKOWYL2lZ8D9+U/TjfRvDLq+Aa//bRG2ovTLAAAAAElFTkSuQmCC',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		
		var that = this;


		
		myRequest({
			type : 'GET',
			url : 'http://site.com/',
			dataType: 'html',
			success: function(html){
				
				
				// for returns result use calbackFunc(obj)
				// calbackFunc(obj) can be run many times. 
				// function accept 1 parameter - object like:  
				if (typeof calbackFunc == 'function') calbackFunc({
					'today' : 34.0,
					'yesterday' : 12.98,
					'month' : 34.76,
					'balance' : 333.65,
				});
				
				// instead console.log you can use log.call(that, ...)
				// it automaticly add sitename in begining of line
				log.call(that, 'test');
			},
			fail : function() {
				log.call(that, 'fail in request 1');
			}
			
		});
		
		
		
		
	}
}