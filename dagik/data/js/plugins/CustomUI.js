
(function() {

  // properties of this plugin
  var params = {
    conf: 'data/conf/custom_ui_conf.txt',
    maxIcons: 30
  }

  var key_names = {
    Enter: 'ENTER',
    Escape: 'ESCAPE',
    Left: 'LEFT_ARROW',
    Up: 'UP_ARROW',
    Right: 'RIGHT_ARROW',
    Down: 'DOWN_ARROW',
    Space: ' ',
    Plus: '+',
    Minus: '-',
    Question: '?',
    Exclamation: '!',
    At: '@',
    Hash: '#',
    Doller: '$',
    Parcent: '%',
    Caret: '^',
    Amparsand: '&',
    Asterisk: '*',
    Tilde: '~',
    Comma: ',',
    Period: '.',
    Colon: ':',
    Semicolon: ';',
    Slash: '/',
    Equal: '=',
    Less: '<',
    Greater: '>',
    LeftParen: '(',
    RightParen: ')',
    LeftCurlyBracket: '{',
    RightCurlyBracket: '}',
    LeftSquareBracket: '[',
    RightSquareBracket: ']',
    Zero: '0',
    One: '1',
    Two: '2',
    Three: '3',
    Four: '4',
    Five: '5',
    Six: '6',
    Seven: '7',
    Eight: '8',
    Nine: '9',
  }
  var a_code = 'a'.charCodeAt(0);
  var A_code = 'A'.charCodeAt(0);
  for (var i=0; i<26; i++) {
    key_names[String.fromCharCode(a_code+i)] = String.fromCharCode(a_code+i);
    key_names[String.fromCharCode(A_code+i)] = String.fromCharCode(A_code+i);
  }

  var transparent_data_url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAAAxJREFUCB1jYKAcAAAARAABRcYjVgAAAABJRU5ErkJggg==";

  var init_params;
  var orginal_config_list;
  var custom_key_commands = [];
  var custom_icons = [];
  var custom_icon_commands = [];
  var custom_icon_images = [];
  
  DOW.RegisterPlugin({

    name: 'CustomUI',
    description: 'Add or change icon buttons, and key functions.',
    vender: 'dagik earth',
    version: '0.1.0',
    api_version: 1,

    // ライブパラメータの宣言
    live_params: {},
      
    init_param: function(_params) {
      init_params = Object.assign({}, params);
      if (_params)
	init_params = Object.assign(init_params, _params);
      params = Object.assign(params, init_params);
    },

    run_param: function(_params) {
      params = Object.assign({}, init_params);
      if (_params)
	Object.assign(params, _params);
    },

    init: function(app) {
      add_parameter_definition();
    },

    run: function(app) {
      // 前回の実行で設定された（かも知れない）カスタムUIを取り除く
      clear_custom_ui(app);
    },

    on_pre_config: function(app) {
      // 読み込む設定ファイルにCustomUI用の設定ファイルを追加する
      orginal_config_list = app.configs;
      app.configs = app.configs.slice();
      if (params.conf)
	app.configs.push(params.conf);
    },

    on_post_config: function(app) {
      // 読み終わったら設定ファイルのリストを元に戻す
      app.configs = orginal_config_list;
      // カスタムUIを設定する
      set_custom_ui(app);
    },

  });
  
  function add_parameter_definition() {
    var definition = DOW.Config.PARAMETER_DEFINITION;
    for (var i = 1; i < params.maxIcons; i++) {
      // アイコンの画像やコマンドの設定項目を追加する
      definition['Icon'+i+'Image'] = [''];
      definition['Icon'+i+'Command'] = [''];
      // 追加するアイコンの位置とサイズを読めるようにしておく
      if (! definition['Icon'+i+'ScaleXY'])
	definition['Icon'+i+'ScaleXY'] = [[0, 0, 0]];
    }
    // キーコマンドの設定項目を追加する
    for (var key in key_names) {
      definition[key+'KeyCommand'] = [''];
    }
  }

  function clear_custom_ui(app) {
    custom_icon_images.forEach(function(item) {
      item.icon.icon1 = item.icon1;
      item.icon.icon2 = item.icon2;
      item.icon.src = item.icon1;
    });
    custom_icon_commands.forEach(function(item) {
      item.icon.command = item.command;
    });
    custom_key_commands.forEach(function(item) {
      if (item.command) DOW.KEY_ACTION[item.key] = item.command;
      else delete DOW.KEY_ACTION[item.key];
    });
    remove_custom_icons();
    custom_icons = [];
    custom_icon_images = [];
    custom_icon_commands = [];
    custom_key_commands = [];
  }
  
  function set_custom_ui(app) {
    app.config.Icon = app.config.Icon ? params.maxIcons : 0;
    for (var i = 1; i < params.maxIcons; i++) {
      var conf_image = 'Icon'+i+'Image';
      var conf_command = 'Icon'+i+'Command';
      if (app.config[conf_image]) {
	var icon = get_icon_or_create(app, 'Icon'+i+'ScaleXY');
	console.log(conf_image+' = '+app.config[conf_image]);
	custom_icon_images.push({ icon: icon, icon1: icon.icon1, icon2: icon.icon2 });
	icon.icon1 = app.config[conf_image];
	icon.icon2 = app.config[conf_image];
	icon.src = icon.icon1;
      }
      if (app.config[conf_command]) {
	var icon = get_icon_or_create(app, 'Icon'+i+'ScaleXY');
	console.log(conf_command+' = '+app.config[conf_command]);
	custom_icon_commands.push({ icon: icon, command: icon.command });
	icon.command = app.config[conf_command];
      }
    }
    for (var key in key_names) {
      if (app.config[key+'KeyCommand']) {
	var dowkey = key_names[key];
	console.log(key+'KeyCommand = '+app.config[key+'KeyCommand']);
	custom_key_commands.push({ key: dowkey, command: DOW.KEY_ACTION[dowkey] });
	DOW.KEY_ACTION[dowkey] = app.config[key+'KeyCommand'];
      }
    }
  }

  function get_icon_or_create(app, config_name) {
    var icon = app.gui.buttons_by_config_name[config_name];
    if (!icon) {
      icon = app.gui.create_button('.', [config_name, undefined, undefined, transparent_data_url ]);
      app.gui.buttons_by_config_name[config_name] = icon;
      DOW.ICONS.push([config_name, undefined, undefined, '']);
      custom_icons.push(icon);
    }
    return icon;
  }

  function remove_custom_icons() {
    custom_icons.forEach(function(icon) {
      for (var i = DOW.ICONS.length - 1; i >= 0; i--) {
	if (DOW.ICONS[i][0] == icon.confg_name) {
	  DOW.ICONS.splice(i, 1);
	  break;
	}
      }
      icon.parentNode.removeChild(icon);
    });
  }

})();
