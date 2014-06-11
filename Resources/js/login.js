$(document).ready(function() {

  var win = Ti.UI.currentWindow;

  var login = '';
  var password = '';

  app.Login = function() {
    var self = this;
    self.login = ko.observable(login);
    self.password = ko.observable(password);
    self.loading = ko.observable(false);
    self.authorize = function() {
      self.loading(true);
      app.api.authorize(login, password, function(err, token) {
        if( err ) { self.loading(false); alert('Не удалось авторизоваться: '+err.msg+'.');  return; }
        window.location.replace('/index.html?token='+token);
      });
    }
  };

  ko.applyBindings(new app.Login());

});
