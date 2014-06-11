$(document).ready(function() {
  window.app = $.extend(true, {
    api: {
      authorize: function(login, password, cb) {

        var url = 'https://oauth.vk.com/authorize?client_id=4115910&scope=audio&redirect_uri=https://oauth.vk.com/blank.html&display=page&v=5.5&response_type=token&revoke=1';

        var authWind = Ti.UI.createWindow({ id: 'vkAuth', url: url, visible: false });
        var authToken;
        var stage = 0;

        authWind.addEventListener('page.load', function(e) {
          try {
            var url = e.url;
            var res = url.match(/access_token=(\w+)/);
            if( res && res[1] ) {
              authToken = res[1];
              authWind.close();
              cb(null, authToken);
            } else {
              var doc = authWind.getDOMWindow().document;
              if( stage == 0 ) {
                doc.forms.login_submit.email.value = login;
                doc.forms.login_submit.pass.value = password;
                doc.forms.login_submit.submit.click();
                stage++;
              } else {
                doc.getElementById('install_allow').click();
              }
            }
          } catch(e) {
            cb({ msg: 'неожиданная ошибка', type: 'catch', data: e });
          }
        });
        authWind.open();
      }
    }
  }, window.app);
});
