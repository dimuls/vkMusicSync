$(document).ready(function() {

  app.api.token = $.url().param('token');

  app.Song = function(data, sync) {
    var self = this;
    ko.mapping.fromJS(data, {}, self);
    self.loaded = ko.observable(false);
    self.loading = ko.observable(false);
    self.filename = ko.computed(function() {
      return $("<div/>").html(self.artist()+' - '+self.title()+'.mp3').text();
    });
    self.filepath = ko.computed(function() {
      return sync.path()+'/'+self.filename();
    });
    self.load = function(cb) {
      // console.debug('song : load');
      /* self.loading(true);
      _.delay(function() {
        self.loading(false);
        self.loaded(true);
        cb();
      }, 1000 + Math.random() * 5000); */

      self.loading(true);

      var file = Ti.Filesystem.getFile(self.filepath());
      var fileStream = file.open(Ti.Filesystem.MODE_APPEND);
      var httpClient = Ti.Network.createHTTPClient();

      httpClient.onload = function() {
        console.debug('file '+self.filename()+' loaded');
        fileStream.close();
        httpClient = null;
        self.loading(false);
        self.loaded(true);
        cb();
      };

      httpClient.open('GET', self.url());
      httpClient.receive(function(chunk) {
        console.debug('file '+self.filename()+' chunk reveived');
        fileStream.write(chunk);
      });
    };
  }

  app.Loader = function(songs, loadingLimit) {
    var self = this;

    self.songs = {
      toLoad: ko.observableArray(songs),
      loaded: ko.observableArray()
    };

    self.loadingLimit = loadingLimit || 5;

    self.total = songs.length,

    self.toLoad = ko.computed(function() {
      return self.songs.toLoad().length;
    });

    self.loaded = ko.computed(function() {
      return self.songs.loaded().length;
    });

    self.loading = ko.computed(function() {
      return self.total - (self.songs.toLoad().length + self.songs.loaded().length);
    });

    self._load = _.throttle(function() {
      // console.debug('loader : _load : toLoad='+self.toLoad()+', loaded='+self.loaded()+', loading='+self.loading());
      if( self.toLoad() == 0 ) {
        return self.loading() == 0;
      }
      var songsToLoad = self.loadingLimit - self.loading();
      while( songsToLoad-- > 0 ) {
        var song = self.songs.toLoad.pop();
        song.load(function() {
          self.songs.loaded.push(song);
          self._load();
        });
      }
    }, 100);

    self.load = function(cb) {
      // console.debug('loader : loading');
      self._load();
      var i;
      i = setInterval(function() {
        if( self._load() ) { clearInterval(i); cb(); }
      }, 1000);
    }
  }

  app.Sync = function() {
    var self = this;

    self.win = Ti.UI.currentWindow;
    self.loader = null;

    self.state = ko.observable('init');
    self.state.subscribe(function(state) {
      switch(state) {
        case    'init': self.win.setTitle('vkMusicSync v1.0: Инициализация'     ); break;
        case  'params': self.win.setTitle('vkMusicSync v1.0: Параметры загрузки'); break;
        case 'loading': self.win.setTitle('vkMusicSync v1.0: Загрузка песен'    ); break;
        case  'loaded': self.win.setTitle('vkMusicSync v1.0: Загрузка завершена'); break;
      }
    });

    self.path = ko.observable();
    self.songs = ko.mapping.fromJS([], {
      create: function(opt) { return ; },
      key: function(song) { return ko.unwrap(song.id); }
    });

    self.choosePath = function() {
      Ti.UI.currentWindow.openFolderChooserDialog(function(path) {
        self.path(path[0]);
      });
    }

    self.start = function() {
      self.state('loading');
      self.loader.load(function() {
        self.state('loaded');
      });
    }

    app.api.audio(app.api.token, function(err, songs) {
      if( err ) { alert('Не удалось получить список песен: '+err.msg+'.'); return; }
      self.loader = new app.Loader(_.map(songs, function(song) { return new app.Song(song, self) }));
      self.state('params');
    });

  };

  ko.applyBindings(app.sync = new app.Sync());
});
