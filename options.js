window.onload = function () {

	(function($) {
		$(function() {

			$('ul.tabs').delegate('li:not(.current)', 'click', function() {
				$(this).addClass('current').siblings().removeClass('current').parent().parent().find(' > div.box').hide().eq($(this).index()).fadeIn(150);
			})

		})
	})(jQuery);


	var options = JSON.parse(localStorage.getItem('options'));
	
	$('#hide_with_tip').attr('checked', options.hide_with_tip);
	$('#stay_online').attr('checked', options.stay_online);
	$('#mamba_hide_left_block').attr('checked', options.mamba_hide_left_block);
	$('#opac_viewed').attr('checked', options.opac_viewed);
	
	$('#hide_time').val(options.hide_time);
	$('#cache_exp_time').val(options.cache_exp_time);
	$('#block_ads').attr('checked', options.block_ads);
	$('#show_fun').attr('checked', options.show_fun);
	$('#show_fun_mat_posh').attr('checked', options.show_fun_mat_posh);
	$('#use_vk').attr('checked', options.use_vk);
	
	// Темы 
	$('#theme_mamba_enabled').attr('checked', options.theme_mamba_enabled);
	$('#theme_mamba_opac_elems').val(options.theme_mamba_opac_elems);
	$('#theme_mamba_fix_background').attr('checked', options.theme_mamba_fix_background);
	
	$('#theme_vk_enabled').attr('checked', options.theme_vk_enabled);
	$('#theme_vk_opac_elems').val(options.theme_vk_opac_elems);
	$('#theme_vk_fix_background').attr('checked', options.theme_vk_fix_background);
	
	//console.log (JSON.parse(localStorage.getItem('options')).hide_with_tip);
	
	
	function saveOptions(data) {
	
		var result = JSON.parse(localStorage.getItem('options'));
		data = $.extend(result, data);
		localStorage.setItem('options', JSON.stringify(data));
	
		// отправим опции во все вкладки
		chrome.tabs.query({}, function(tabs) {
			var message = {metod: 'optionsChange', options: data};
			for (var i=0; i<tabs.length; ++i) {
				chrome.tabs.sendMessage(tabs[i].id, message);
			}
		});
		
		//console.log('saveOptions incoming data', data);
	} 
	
	
	$(	'#show_fun, '+
		'#stay_online, '+
		'#hide_with_tip, '+
		'#opac_viewed, '+
		'#block_ads, '+
		'#show_fun_mat_posh, '+
		'#mamba_hide_left_block, '+
		'#theme_mamba_enabled, '+
		'#theme_vk_enabled, '+
		'#use_vk').change(function() {
		var myopt = {};
		myopt[this.id] = $(this)[0].checked;
		saveOptions(myopt);
		console.log('myopt', myopt);
	});
	
	
	

	$('#hide_time').live('keyup', function(){
		var data = parseInt( $(this).val() );
		if ( !isNaN(data) && (data >= 0) && (data <= 2000) ) {
			data = {hide_time: data};
		} else {
			data = {hide_time: 700};
		}
		saveOptions(data);
	});

	$('#cache_exp_time').live('keyup', function(){
		var data = parseInt( $(this).val() );
		if ( !isNaN(data) && (data >= 0) && (data <= 999) ) {
			var data = {cache_exp_time: data};
		} else {
			// если какая-то ошибка, то поставим значение по умолчанию
			var data = {cache_exp_time: 48};
		}
		saveOptions(data);
	});
	
	
	// Изменение прозрачности тем
	var timer_theme_opac_elems;
	
	var q = document.getElementById('theme_mamba_opac_elems');
	q.addEventListener('input', function(){
		var elem = this;
		if (timer_theme_opac_elems) window.clearTimeout(timer_theme_opac_elems);
		timer_theme_opac_elems = window.setTimeout(function() {
			timer_theme_opac_elems = null;
			saveOptions({theme_mamba_opac_elems: elem.value});
		}, 40);
		
	}, true);
	
	var q2 = document.getElementById('theme_vk_opac_elems');
	q2.addEventListener('input', function(){
		var elem = this;
		if (timer_theme_opac_elems) window.clearTimeout(timer_theme_opac_elems);
		timer_theme_opac_elems = window.setTimeout(function() {
			timer_theme_opac_elems = null;
			saveOptions({theme_vk_opac_elems: elem.value});
		}, 40);
		
	}, true);
	

	
	
	
	// Сервисные штуки
	
	$('#closebutton').click( function(){
		window.close();
	});
	
	
	$('#openGelery').click( function(eventObject){
		eventObject.preventDefault();
		//var href = 'http://bb.dev/bh/bg_galery.php';
		var href = 'http://blog-babnika.ru/bh/bg_galery.php';
		// если такая вкладка открыта, то активируем ее. Нет? Тогда откроем новую
		chrome.tabs.getAllInWindow(undefined, function(tabs){
			for (var i = 0, tab; tab = tabs[i]; i++) {
				if( tab.url && (tab.url == href || tab.url.indexOf(href) != -1 ) ) {
					chrome.tabs.update(tab.id,{selected: true});
					return;
				}
			}
			chrome.tabs.create({url:href});
		});
	});
	
	
	// Клик по reformal
	$('#openReformal').click( function(eventObject){
		eventObject.preventDefault();
		var href = 'http://lover-tools.reformal.ru/';
		// если такая вкладка открыта, то активируем ее. Нет? Тогда откроем новую
		chrome.tabs.getAllInWindow(undefined, function(tabs){
			for (var i = 0, tab; tab = tabs[i]; i++) {
				if( tab.url && (tab.url == href || tab.url.indexOf(href) != -1 ) ) {
					chrome.tabs.update(tab.id,{selected: true});
					window.close();
					return;
				}
			}
			chrome.tabs.create({url:href});
			window.close();
		});

	});
	
	
	
	if (document.location.search == '?from=popup') {
		$('#closebutton').show();
	}
	
	$('#icon_mamba').append('<img class="icon" alt="mamba.ru" src="'+source['mamba.ru']['icon']+'" />');
	$('#icon_loveplanet').append('<img class="icon" alt="loveplanet.ru" src="'+source['loveplanet.ru']['icon']+'" />');
	$('#icon_fotostrana').append('<img class="icon" alt="fotostrana.ru" src="'+source['fotostrana.ru']['icon']+'" />');
	$('#icon_dating').append('<img class="icon" alt="dating.ru" src="'+source['dating.ru']['icon']+'" />');
	$('#icon_vk').append('<img class="icon" alt="vk.com" src="'+source['vk.com']['icon']+'" />');
}



