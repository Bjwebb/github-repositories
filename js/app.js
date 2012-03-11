window.App = {

	/**
	 * Initialize extension application.
	 */
	init: function(){
		Authentication.validate(function(user) {

			User.init(user);	
			Content.init();
			Navigation.init();
			Settings.init();
			Switcher.init();
			App.bind();	
			jQuery('body').removeClass('loading').find('#application').show();

		}, function() {
			Authentication.prompt();
		});
	},

	/**
	 * Bind applicaiton events.
	 */
	bind: function() {

		// Get notifications.
		Socket.postMessage("window", "Notifier", "update", []);

		// Create user link tooltips.
		jQuery('.user_links [tooltip]').each(function() {
			var element = jQuery(this);
			var html = "<span class='tooltip'>"
			         + "<span class='arrow'></span>"
					 + "<span class='bubble'>" + element.attr('tooltip') + "</span>"
					 + "</span>";

			jQuery(this).append(html);

			element.on('hover', function() {
				element.find('.tooltip').fadeToggle(75);
				var bubble = element.find('.bubble');
				bubble.css('margin-left', -bubble.width() / 2 + "px");
			});
		});

		// Set notification click events.
		jQuery('.user_links li[rel="notifications"]').on('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			window.open("https://github.com/inbox/notifications", '_blank');
		});

		// Set log out click events.
		jQuery('.user_links li[rel="log_out"]').on('click', function() {
			Storage.clear();
			App.close();
		});

		// Set refresh button mouse and click events.
		var refresh = jQuery('.refresh');
		refresh.on('click', function() {
			window[Navigation.selected].load.refresh(User.context, Navigation.selected);
		});
		refresh.on('mousedown', function() {
			refresh.addClass('down');
		});
		refresh.on('mouseup', function() {
			refresh.removeClass('down');
		});
		refresh.on('mouseleave', function() {
			refresh.removeClass('down');
		});
	},

	/**
	 * Close extension.
	 */
	close: function(){
		window.close();
		chrome.tabs.getCurrent(function(tab) {
			chrome.tabs.remove(tab.id, function(){});
		});
	},

	/**
	 * Update
	 */
	update: function(count) {
		var notifications = jQuery('.user_links li[rel="notifications"]');

		if(count != '') {
			var html = "<span class='count'>" + count + "</span>";
			notifications.append(html);
		}
		else {
			notifications.html("");
		}
	}
};

// Prevent any future conflicts.
$.noConflict();

// Initialize application after page has loaded.
jQuery(window).bind("load", function() {
	
	// Kill the extension if local storage is not supported.
	if(!Storage.isSupported()) {
		App.close();
	}
	else {
		App.init();
	}
});