
engine['cpazilla'] = {
	'category' 		: 'dating',				// Site category: dating, teasers, advertising, e.t.c
	'sitename' 		: 'CPAzilla ',		// Visible sitename
	'currency' 		: 'RUR',				// RUR or USD
	'TSL' 			: true,					// use https?
	'mainpageUrl' 	: 'https://cpazilla.ru/user/stats',	// for clickable sitename in revenue table
	'registerUrl' 	: 'http://cpazilla.ru/?ref=51bf1f357355386e6e000002',	// Registration page URL
	'icon'			: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/89UB//TWAP3z1QP98dME///dAP762gL16M4T7+PMH/nu0gv//twA/vrZAfzw0gb+9dUB//PUAP/01AD/9NQA/9JUAP3QUgP/1VUA+tVUDMicM2mgcBi6k18U145bE96ZZhXNroAgnt+2QT//21kA/NBRBv/TUwD/0VMB/9JTAP3SWAP/11wA7cdSI5tpGMh+SQX/fEYC/XpFAv98RgP+eUIB/3lFAf6CTgj6vZEwgv7ZXAP90FgE/9RbAP/TWgD+0lcA88xTG5VgD9iDTAP/iFIG+pZiENy3iCibwZYwe7uNLIycaBTTh1AE+35GAP+7jiuH/95dAPrNUwr/01YB/99eALODJZ2FTgP/jlYK+q1+IrX30lUW/+RiAP/iYAD/4WAA+tZYD7OEJaqLVAf+iVMH99ivQFD/3V4A/NJXBerETC+UXQzujFUH/6RwGcr72lsM/NVYCsKSL4qfaRXcuIUmoP3ZWgqufCG6jlcJ+41UB/vUpzxo9dFWFu3HTyTKlzF+lFwL/I9WB//QoTh2/+VhAMmaMoWMUQX/jlYH/5xlEeTCkS2YjlQG+49VBv/GljGLrXcftqNtF8yueiCrwIwqkJddC/yYXw3237BBVv/jYQC2giSsllwK/55kD/aYXgz/mV4L+ZdeC//CkS6Z/+NhAMKSLouncBjN99RXEciULomaYA79mV4L/tmrPmT/4mEAxJIsmZNXBv+eZA/3oGYQ9K12G9eSVQX/z6M4e/3XWQX/2FsLtYAhs7uGJaHkt0VKoWUQ9JteC/++iiet/+FhAO/DTCu0fR/El1kI/7qDI7fovUlAoWQP8JlcCf/ZqzxuxY4rkLB3G8arcBbP/tpcBLV8H72hZA3+omYQ+9amO3T/4mEA+9ldCe/IUDD2z1Yf/+VkAMWTLp2gYg3/pWgS5+W8SUfyzVMf9s5VFf/XVwDpvUc7o2ML96VoDvulZw74wownqeGyP1nuwkkx5rpFR8uXLZSucxXgnl4I/7mBHrr701UM/9VXAP7SVQL90lsE/9thAN+zR1KlaRXyo2cT/6FjEf+kaBT/pmoV+6NmE/+fYRD9nmAP/7eAI8X20FkY/9ZeAP3RWwX/1F0A/9FLAP3OSAX/104A7L4/NL+FGLGtbQfmpWUD86RjAvenZwTxsnUN19GbKID50EoR/tFLAf7OSQT/0EsA/89LAf/npAD/6KUA/eWjBf/qpwD/7qgB8NudKeXLkkfkypFH58+WQPjjoxX/76oA/eekBf7mowH/6KQA/+ekAf/npAD///8A////Af///wD9/v8E/f7/Bv///wH///8A////AP///wD+//8C/P7/B////wL///8A////Af///wD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
	'getBalance' 	: function(calbackFunc, login, pass) {
		
		

		myRequest({
			type: 'POST',
			url : 'https://cpazilla.ru/user/login/?redirect=%2F',
			data: {
				'email': login,
				'password': pass,
				'submit_btn':''
			},
			headers : {
				'Referer': 'https://cpazilla.ru/user/login',
				'Origin' : 'https://cpazilla.ru'
			},
			success: function(html){
				
 				var parser = new DOMParser;
				var tmpDom = parser.parseFromString(html, 'text/html');
				
				var balance = tmpDom.querySelector('#nav-user-info > li.balance > a > span');
				if (balance) {
					balance = parseFloat(balance.innerText);
					console.log('balance', balance);
				} else {
					console.log('error parse balance');
				}
				
				if (typeof calbackFunc == 'function') calbackFunc({'balance' : balance});
				delete parser, tmpDom;
				
				// Request 2
				
				// first day of month
				var date = new Date();
				if (date.getDate() == 1) {
					date.setDate(0);  // start from yesterday  if 1 day of month
				} else {
					date.setDate(1);
				}
				
				myRequest({
					type: 'GET',
					url : 'https://cpazilla.ru/user/stats',
					data: {
						'act'       : '',
						'date_from' : echoDate('YYYY-MM-DD', date),
						'date_to'   : echoDate('YYYY-MM-DD')
					},
					success: function(html){
						
						//console.log(html);
						
 						var parser = new DOMParser;
						var tmpDom = parser.parseFromString(html, 'text/html');


						var resp = {'month' : 0, 'yesterday' : 0, 'today' : 0};
						var elems = document.querySelectorAll('#stats_table > tbody > tr');
						
						for(var i in elems){
							if (!elems.hasOwnProperty(i)) continue;
							
							var td1 	= elems[i].querySelector('td:first-of-type').innerText;
							var revenue = elems[i].querySelector('td:last-of-type').innerText;

							//console.log(td1, revenue);

							if (td1 === echoDate('YYYY-MM-DD', 'yesterday')) resp.yesterday += parseFloat(revenue.clearCurrency());
							if (td1 === echoDate('YYYY-MM-DD')) resp.today += parseFloat(revenue.clearCurrency());
						}
	
						var month = tmpDom.querySelector('#stats_table > tfoot > tr > td:nth-child(12) > strong');
						if (month) {
							resp.month = parseFloat(month.innerText);
							console.log('month', month);
						} else {
							console.log('error parse month');
						}
					
						// compensation first day of month
						if (new Date().getDate() == 1) {
							resp.month = resp.today;
						}
						
						calbackFunc(resp);

					},
					fail : function() {
						console.log('error request 2');
					}
				});
				
				
			},
			fail : function() {
				console.log('error request 1');
			}

		});
	}
}