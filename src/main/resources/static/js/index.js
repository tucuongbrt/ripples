$(document).ready(function() {

	login = $('#logbook-in');
	logbook = $('#logbook-login');
	logout = $('#logbook-out');

	if (login.is(':visible')) {
		logout.hide();
	}
	if (logout.is(':visible')) {
		login.hide();
	}

	login.click(function() {
		login.addClass('active');
		login.hide();
		logout.removeClass('active');
		logout.show();
	});

	logbook.click(function() {
		logbook.addClass('active');
		document.location.href = '/log.jsp';
	});

	logout.click(function() {
		logout.addClass('active');
		logout.hide();
		login.removeClass('active');
		login.show();
	});

});
