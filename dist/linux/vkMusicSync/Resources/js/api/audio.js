$(document).ready(function() {
  window.app = $.extend(true, {
    api: {
      audio: function(token, cb) {
        var url = 'https://api.vk.com/method/audio.get?access_token='+token;
        $.getJSON(url)
          .done(function(res) {
            cb(null, res.response);
          })
          .fail(function() {
            cb({ msg: 'нет соединение или доступа' })
          });
      }
    }
  }, window.app);
});
