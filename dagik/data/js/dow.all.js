// 2015-05-16 : 読み込み中に「戻る」ボタン、「リロード」ボタン追加 by Saito-A
// 2015-07-04：経度指定の間違いを修正：-Longitude-90deg. を表示していた(135Eは同じ）by Saito-A  
// 2017-03-21: 設定ファイル内の未定義設定のエラーをスキップ E0013 by Saito-A

var DOW = {};

// 以下の行はMake時にバージョン文字列が埋め込まれます。
DOW.VERSION = '2.0.2-20190303';

if (typeof module === 'object') { module.exports = DOW; }

// 設定ファイルの画面座標系における画面上辺のY座標（中心が原点なので高さの半分でもある）
DOW.WTOP = 2.0;

// 静止画連番アニメーションの標準（speed=8）のフレームレート
DOW.CKK_STD_FPS = 5.0;
// 地球の表示位置の計算方法をCKKに合わせる
DOW.CKK_EARTHXY_POLICY = true;
// 地球の回転操作の方法をCKKに合わせる
DOW.CKK_ROTATION_POLICY = false;

// エラーコードとメッセージ表示文字列の定義
DOW.MESSAGES_JA = {
    // メインメッセージ
    M0001: 'ロード中(loading)<p><button onclick="window.history.back();">戻る(back)</button><button onclick="window.location.reload( false );">リロード(reload)</button></p>',
    M0002: 'ロード中(loading)<p><button onclick="window.history.back();">戻る(back)</button><button onclick="window.location.reload( false );">リロード(reload)</button></p>',
    M1001: 'エラーが発生しました(Errors)<p><button onclick="window.history.back();">戻る(back)</button><button onclick="window.location.reload( false );">リロード(reload)</button></p>',
    M1002: '画像の更新失敗(Update error)<p><button onclick="dow.console.clear();">OK</button></p>',
    // 一般的なエラー
    E0001: 'ブラウザがDagikEarthに対応していません(WebGL)',
    // 設定ファイル関連のエラー
    E0011: '設定ファイルがありません',
    E0012: '設定ファイルが読み込めません',
    E0013: '未定義のパラメータです',
    E0014: 'パラメータの数が足りません',
    E0015: 'パラメータは数値でなければなりません',
    E0016: 'パラメータが不正な値です',
    E0018: 'Web版では正しい(9999以外の)TextureEndを明示してください',
    E0019: '設定ファイルの処理中にエラーが起きました',
    // リソース関連のエラー
    E0101: '画像を読み込めません',
    W0101: '画像を読み込めません',
    I0101: '画像を読み込めません',
    E0102: '書式に誤りがあります',
    I0103: '自動で再読込します',
    // 
    I9999: '参考',
};

DOW.BUTTON_ALT_TEXT_JA = {
    IconScaleXY: 'Play',  	// 'forward_play', 'play.png', 'pause.png'],
    Icon2ScaleXY: 'Reset',	//'initialize',   'initial.png'],
    Icon3ScaleXY: 'Reverse',	//'reverse_play', 'r_play.png', 'pause.png'],
    Icon4ScaleXY: 'Spin on off',	//'auto_spin', 	'spin.png', 'stop_spin.png'],
    Icon5ScaleXY: 'Step forward',	//'step_forward', 'forward.png'],
    Icon6ScaleXY: 'Step backward',	//'step_backward','back.png'],
    Icon7ScaleXY: 'Grid on off',	//'show_grid', 'line.png', 'delete_line.png'],
    Icon8ScaleXY: 'Zoom up',	//'zoom_in', 	'zoomin.png'],
    Icon9ScaleXY: 'Zoom down',	//'zoom_out', 	'zoomout.png'],
    Icon10ScaleXY: 'North up',	//'reset_north', 	'north.png'],
    Icon11ScaleXY: 'Faster',	//'play_fast', 	'fast.png'],
    Icon12ScaleXY: 'Slower',	//'play_slow', 	'slow.png'],
    Icon13ScaleXY: 'Back',	//'quit', 	'quit.png'],
    Icon14ScaleXY: 'Fullscreen',	//'fullscreen', 	'normalscreen.png', 'fullscreen.png'],
    Icon15ScaleXY: '',	//'screen_small', 'logo_small.png'],
    Icon16ScaleXY: '',	//'screen_large', 'logo_large.png'],
    Icon17ScaleXY: '',	//'screen_left', 	'logo_left.png'],
    Icon18ScaleXY: '',	//'screen_right', 'logo_right.png'],
    Icon19ScaleXY: '',	//'screen_down', 	'logo_down.png'],
    Icon20ScaleXY: '',	//'screen_up', 	'logo_up.png'],
    Icon21ScaleXY: 'Switch layer',	//'layer', 	'layer1.png', 'layer2.png'],
    Icon22ScaleXY: 'Screen on off',	//'show_screen', 	'screen_on.png', 'screen_off.png'],
    Icon23ScaleXY: 'Icons on off',	//'hide_all_icons', 'icon_on.png', 'icon_off.png'],
    Icon24ScaleXY: '',	//'draring_pen',	'drawing_off.png', 'drawing_on.png'],
    Icon25ScaleXY: '',	//'drawing_erase','drawing_erase.png'],
    Icon26ScaleXY: '',	//'drawing_save', 'drawing_save.png'],
    Icon27ScaleXY: '',	//'change_layer', 'forward-changelayer.png']
};

DOW.MESSAGES = DOW.MESSAGES_JA;
DOW.BUTTON_ALT_TEXT = DOW.BUTTON_ALT_TEXT_JA;

// 実行時に無視するエラー
DOW.IGNORE_ERRORS = [
    'E0011', // 設定ファイルが無くてもエラーとしない
    'E0012', // 設定ファイルが読み込めなくてもエラーとしない
    'E0013', // 定義されていない設定パラメータでもエラーとしない
];


DOW.ICONS = [
    // ConfigName         ButtonName      Commands        Image1      Image2
    ['IconScaleXY', 'forward_play', 'forward_play', 'play.png', 'pause.png'],
    ['Icon2ScaleXY', 'initialize', 'initialize', 'initial.png'],
    ['Icon3ScaleXY', 'reverse_play', 'reverse_play', 'r_play.png', 'pause.png'],
    ['Icon4ScaleXY', 'auto_spin', 'auto_spin', 'spin.png', 'stop_spin.png'],
    ['Icon5ScaleXY', 'step_forward', 'step_forward_or_wrap', 'forward.png'],
    ['Icon6ScaleXY', 'step_backward', 'step_backward_or_wrap', 'back.png'],
    ['Icon7ScaleXY', 'show_grid', 'show_grid', 'line.png', 'delete_line.png'],
    ['Icon8ScaleXY', 'zoom_in', 'zoom_in', 'zoomin.png'],
    ['Icon9ScaleXY', 'zoom_out', 'zoom_out', 'zoomout.png'],
    ['Icon10ScaleXY', 'reset_north', 'reset_north', 'north.png'],
    ['Icon11ScaleXY', 'play_fast', 'play_fast', 'fast.png'],
    ['Icon12ScaleXY', 'play_slow', 'play_slow', 'slow.png'],
    ['Icon13ScaleXY', 'quit', 'quit', 'quit.png'],
    ['Icon14ScaleXY', 'fullscreen', 'fullscreen', 'normalscreen.png', 'fullscreen.png'],
    ['Icon15ScaleXY', 'screen_small', 'screen_small', 'logo_small.png'],
    ['Icon16ScaleXY', 'screen_large', 'screen_large', 'logo_large.png'],
    ['Icon17ScaleXY', 'screen_left', 'screen_left', 'logo_left.png'],
    ['Icon18ScaleXY', 'screen_right', 'screen_right', 'logo_right.png'],
    ['Icon19ScaleXY', 'screen_down', 'screen_down', 'logo_down.png'],
    ['Icon20ScaleXY', 'screen_up', 'screen_up', 'logo_up.png'],
    ['Icon21ScaleXY', 'layer', 'layer', 'layer1.png', 'layer2.png'],
    ['Icon22ScaleXY', 'show_screen', 'show_screen', 'screen_on.png', 'screen_off.png'],
    ['Icon23ScaleXY', 'hide_all_icons', 'hide_all_icons', 'icon_on.png', 'icon_off.png'],
    ['Icon24ScaleXY', 'draring_pen', 'draring_pen', 'drawing_off.png', 'drawing_on.png'],
    ['Icon25ScaleXY', 'drawing_erase', 'drawing_erase', 'drawing_erase.png'],
    ['Icon26ScaleXY', 'drawing_save', 'drawing_save', 'drawing_save.png'],
    ['Icon27ScaleXY', 'forward_changelayer', 'forward_changelayer', 'forward-changelayer.png']
];

DOW.KEY_ACTION = {

    'ESCAPE': 'fullscreen_off',
    'UP_ARROW': 'up_arrow_key',
    'DOWN_ARROW': 'down_arrow_key',
    'LEFT_ARROW': 'left_arrow_key',
    'RIGHT_ARROW': 'right_arrow_key',

    'q': 'quit',
    'Q': 'quit',
    'a': 'step_forward',
    'w': 'forward_changelayer',
    'A': 'step_forward10',
    'c': 'show_screen',
    'o': 'layer',
    'b': 'step_backward',
    'B': 'step_backward10',
    'r': 'reverse_play',
    'L': 'zoom_in',
    'l': 'zoom_in_petit',
    'H': 'zoom_out',
    'h': 'zoom_out_petit',
    's': 'auto_spin',
    'm': 'show_grid',
    'f': 'fullscreen',
    'i': 'initialize_view, first_frame', // 初期視点・初期画像：再生・停止は変更しない
    'j': 'initialize_view',              // 初期視点：画像は変更しない。再生・停止は変更しない
    'I': 'first_frame',                  // 初期画像：視点は変更しない。再生・停止は変更しない
    'J': 'last_frame',                   // 最終画像：視点は変更しない。再生・停止は変更しない
    'n': 'reset_north',
    'C': 'hide_all_icons',
    ' ': 'pause_or_play', 	// 0x20,
    '+': 'play_fast', // 0x2b,
    '-': 'play_slow', // 0x2d,
    '>': 'spin_fast', // 0x3e,
    '<': 'spin_slow', // 0x3c,
    '1': 'screen_small',
    '2': 'screen_large',
    '3': 'screen_left',
    '4': 'screen_right',
    '5': 'screen_down',
    '6': 'screen_up',
    // お絵描きモード,
    //'d': 'drawing_off',???
    //'p': 'drawing_pen',
    //'e': 'drawing_erase',
    //'E': 'drawing_undo',

    // 開発支援
    'D': 'toggle_console',
    'F': 'loading_console',
    'R': 'force_reload',
};

DOW.log = function (message) { console.log(message); }

/********* PLUGIN FRAMEWORK **********/

DOW.Plugins = {};
DOW.RegisterPlugin = function (plugin) {
    if (DOW.Plugins.hasOwnProperty(plugin.name)) {
        console.warn('Plugin ' + plugin.name + ' has been installed. (name confliction)');
    } else {
        DOW.Plugins[plugin.name] = plugin;
    }
}

DOW.plugins = (function () {

    const PluginApiVersion = 1;
    const PluginEnableApiVersions = [1];

    var plugins = [];

    var hooks = {
        on_gl_ready: { point: 'post', handlers: [] },
        on_pre_config: { point: 'pre', handlers: [] },
        on_post_config: { point: 'post', handlers: [] },
        on_pre_load: { point: 'pre', handlers: [] },
        on_post_load: { point: 'post', handlers: [] },
        on_pre_scene: { point: 'pre', handlers: [] },
        on_post_scene: { point: 'post', handlers: [] },
        on_pre_frame: { point: 'pre', handlers: [] },
        on_post_frame: { point: 'post', handlers: [] },
        on_pre_render: { point: 'pre', handlers: [] },
        on_post_render: { point: 'post', handlers: [] },
        on_pre_stop: { point: 'pre', handlers: [] },
        on_post_stop: { point: 'post', handlers: [] },
    }

    var Plugins = {

        register: function (params) {

            var plugin_params = params.plugins;
            if (plugin_params) {
                plugin_params.default = plugin_params.default || 'enable';
                plugin_params.enable = plugin_params.enable || [];
                plugin_params.disable = plugin_params.disable || [];
            }

            for (var name in DOW.Plugins) {
                // プラグイン登録可否のパラメータがあれば従う
                if (plugin_params) {
                    if (plugin_params.default == 'enable') {
                        if (plugin_params.disable.indexOf(name) !== -1) continue;
                    } else {
                        if (plugin_params.enable.indexOf(name) === -1) continue;
                    }
                }

                var plugin = DOW.Plugins[name];

                // APIバージョンが非対応のものは登録しない
                if (PluginEnableApiVersions.indexOf(plugin.api_version) === -1) {
                    console.warn("Can not register plugin '" + plugin.name + "' (invalid api version: " + plugin.api_version + ")");
                    continue;
                }

                DOW.log("Registering plugin: " + plugin.name + ' (version ' + plugin.version + ' by ' + plugin.vender + ')');
                plugins.push(plugin);
            }
        },

        init: function (params, app) {
            plugins.forEach(function (p) {
                if (p.init_params)
                    p.init_params(params && params.hasOwnProperty(p.name) ? params[p.name] : undefined);
                if (p.init)
                    p.init(app);
                for (var phase in hooks) {
                    if (p.hasOwnProperty(phase)) {
                        if (hooks[phase].point == 'pre')
                            hooks[phase].handlers.unshift(p[phase]);
                        else
                            hooks[phase].handlers.push(p[phase]);
                    }
                }
            });
        },

        run: function (params, app) {
            plugins.forEach(function (p) {
                if (p.run_params)
                    p.run_params(params && params.hasOwnProperty(p.name) ? params[p.name] : undefined);
                if (p.run)
                    p.run(app);
            });
        },

        invoke: function (phase, app) {
            if (hooks.hasOwnProperty(phase))
                hooks[phase].handlers.forEach(function (h) { h(app); });
        },

    }

    return Plugins;

})();


DOW.Console = function (app, parent) {
    this.type = 'Console';

    this.domElement = document.createElement('div');
    this.domElement.id = 'dow_console';
    parent.appendChild(this.domElement);

    this.domElement.innerHTML = "<div class='progress'><canvas width='40px' height='40px'></canvas><div class='message'></div></div><div class='error'></div><div class='details'></div>";

    this.progressElement = this.domElement.childNodes[0];
    this.spinner = this.progressElement.childNodes[0];
    this.progressMessage = this.progressElement.childNodes[1];
    this.errorElement = this.domElement.childNodes[1];
    this.detailsElement = this.domElement.childNodes[2];

    // Detailsに追加されたメッセージにエラーが含まれるかどうか
    this.hasError = false;

    this.phase = 0;
    this.progressing = true;
    var _this = this;
    window.setInterval(function () { _this.update_spinner(); }, 100);
};

DOW.Console.prototype = {

    show: function () { this.domElement.style.display = 'block'; },
    hide: function () { this.domElement.style.display = 'none'; },
    toggle: function () { this.domElement.style.display = (this.domElement.style.display == 'none') ? 'block' : 'none'; },

    showProgress: function (ratio, num_loaded, num_total, message) {
        this.hideError();
        this.progressElement.style.display = 'block';
        this.progressMessage.innerHTML = '' + num_loaded + ' / ' + num_total + '<br>' + message;
        this.show();
    },
    hideProgress: function () {
        this.progressMessage.innerHTML = '';
        this.progressElement.style.display = 'none';
    },

    showError: function (message) {
        this.hideProgress();
        this.errorElement.style.display = 'block';
        this.errorElement.innerHTML = message;
        this.show();
    },
    hideError: function () {
        this.errorElement.innerHTML = ''
        this.errorElement.style.display = 'none';
    },

    addDetail: function (code, message) {
        var etype = code.charAt(0);
        if (etype == 'E') {
            if (DOW.IGNORE_ERRORS.indexOf(code) < 0) this.hasError = true;
            else etype = 'W';
        }
        this.detailsElement.style.display = 'block';
        this.detailsElement.innerHTML += '<li class=detail_' + etype + '>' + DOW.MESSAGES[code] + ': ' + message + "</li>\n";
    },
    clearDetails: function () {
        this.detailsElement.style.display = 'none';
        this.detailsElement.innerHTML = '';
    },

    clear: function () {
        this.hasError = false;
        this.hideProgress();
        this.hideError();
        this.clearDetails();
        this.hide();
    },

    update_spinner: function () {
        if (this.domElement.style.display == 'none' || this.progressElement.style.display == 'none') return;

        var size = this.spinner.height;
        var frequency = 0.5;
        var pi2 = Math.PI * 2;
        this.phase += frequency * pi2 * 0.1;
        while (this.phase > pi2) this.phase -= pi2;

        var gc = this.spinner.getContext('2d');
        //gc.save();
        gc.clearRect(0, 0, size, size);
        gc.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        gc.lineWidth = 5;
        gc.beginPath();
        if (!this.progressing) {
            gc.arc(size / 2, size / 2, size / 3, 0, pi2, true);
        } else {
            gc.arc(size / 2, size / 2, size / 3, this.phase, this.phase + Math.PI, true);
            gc.stroke();
            gc.beginPath();
            gc.arc(size / 2, size / 2, size / 3, -this.phase * 2, -this.phase * 2 + Math.PI, false);
            gc.lineWidth = 1;
        }
        gc.stroke();
        //gc.restore();
    },

};

/***

DOW.Config: Dagik_Earthの設定ファイルを読んで保持する。

使い方：

function callback() {
  // 読み込みが完了した時に実行する内容
}

var dow = new DOW.Config(['data/conf/init_conf.txt', 'data/conf/conf.txt', ...], callback);

// 設定ファイルの読み込みにエラーがあると、配列 dow.errors にエラーの内容が入る。

// 設定値はパラメータ名で読み出せる。
var lon = dow.Longitude;                  // 単一の値は直接
var window_size_x = dow.WindowSize[0];    // 複数の値は配列として

## 設定値のカスタマイズ ##
load関数では、設定ファイルの読み込みの前後に指定した処理を行わせることができる。

読み込み前に実行されるhook関数：pre_loading_hook( config )
読み込み後に実行されるhook関数：post_loading_hook( config )

いずれも引数にconfigインスタンスが渡される。

これらのhook関数を使うと、デフォルト値の設定や非標準のパラメータ名の追加、
パラメータの上書きや無効化などが可能となる。

***/


DOW.Config = function (app) {
    this.type = 'Config';

    // 設定ファイルを読み込む前に呼ばれるhook関数: function(config)
    this.pre_loading_hook = undefined;
    // 設定ファイルが読み終わった段階で呼ばれるhook関数: function(config)
    this.post_loading_hook = undefined;

    this.app = app;

    this.loader = this._loader;
};

// 設定値を後処理するためのよく使う関数
function force_bool(val) { return val === 1; }		// 0,1を真偽値として扱う

// 定義されたパラメータの一覧
// ParameterName: [ 初期値, 値の後処理をする関数 ]
DOW.Config.PARAMETER_DEFINITION = {
    // ----- 画面の設定 ------
    WindowSizeXY: [[800, 600]],            // ウィンドウのサイズ(Mac版のみ)
    WindowPositionXY: [[0, 0]],              // ウィンドウの位置(Mac版のみ)
    FullScreen: [0, force_bool],    // フルスクリーン表示
    Perspective: [0, force_bool],    // [0: orthogonal, 1: perspective] 投影方法の指定
    EyePosition: [20.0],                  // 視点の引き距離(地球の半径より小さい場合は背面投影)
    // ----- アニメーションの設定 ------
    Animation: [0, function (val) { // [0: stop, 1: play, -1: reverse play]
        return (val != 1 && val != -1) ? 0 : val;
    }],
    AnimationSpeed: [8],                     // [-30,30]
    StopAt1stMap: [0.2],                   // アニメーションの最初の画像での待ち時間
    StopAtFinalMap: [0.0],                  // アニメーションの最後の画像での待ち時間
    Repeat: [0, force_bool],   // アニメーションのループ再生
    Spin: [0, force_bool],    // 自動で自転する
    SpinSpeed: [6],                     // [-200,200] 自転速度
    // ----- 地球の位置と大きさ, 起動時の視点 ------
    EarthXY: [[0.0, 0.0]],
    Scale: [1.0],                  // ez < 0の場合はscaleを負に(鏡像処理？)
    Latitude: [0.0],                  // [-90,90] 正面の経度
    Longitude: [0.0],                  // [-180,180] 正面の緯度
    // ----- キャプション(Screen)の位置と大きさ、タイムバー ------
    ScreenOn: [1, force_bool],    // キャプションを表示する
    ScreenScaleXY: [[3.0, -2.5, 1.0]],      // キャプションのサイズと位置
    ScreenFront: [0, force_bool],    // [0: 地球が手前, 1: キャプションが手前] 地球とキャプションの前後関係
    TimebarScaleXY: [[1.0, -1.0, -1.0]],    // タイムバーのサイズと位置
    // ----- 画像ファイルの指定 ------
    TextureName: [''],       // マッピング画像のパスとファイル名(ベース部分)
    TextureSuffix: [''],       // マッピング画像のサフィックス
    ScreenName: [''],       // キャプション画像のパスとファイル名(ベース部分)
    ScreenSuffix: [''],       // キャプション画像のサフィックス
    SecondTextureName: [''],       // 第２マッピング画像のパスとファイル名(ベース部分)
    SecondTextureSuffix: [''],       // 第２マッピング画像のサフィックス
    SecondScreenName: [''],       // 第２キャプション画像のパスとファイル名(ベース部分)
    SecondScreenSuffix: [''],       // 第２キャプション画像のサフィックス
    TextureStart: [0],        // 連番ファイルの先頭の数値
    TextureEnd: [9999],     // 連番ファイルの最後の数値
    SecondTexture_at_startup: [0, force_bool],  // 起動時に第２画像も表示
    /* DOW拡張設定*/
    // 代替素材ファイル
    AltTextureName: [['', '']],  // マッピング画像の代替素材。
    AltScreenName: [['', '']],  // キャプション画像の代替素材。
    AltSecondTextureName: [['', '']],  // 第２マッピング画像の代替素材。
    AltSecondScreenName: [['', '']],  // 第２キャプション画像の代替素材。

    // ----- 二つ目の地球 ------
    NumberOfEarth: [1, function (val) {  // 表示する地球の個数（1 または 2）
        return (val != 2) ? 1 : 2;
    }],
    WindowSizeXY2: [[-9999, -9999]],        // 指定すると第二モニターに表示？
    WindowPositionXY2: [[-9999, -9999]],
    FullScreen2: [0],                    // １なら起動時に2つ目のWindowをfull screenにする}: ckk1.21で追加
    Earth2XY: [[0.0, 0.0]],            // 二つ目の地球の位置(1つ目の地球からの相対)
    Latitude2: [0.0],                   // [-90,90] 起動時の正面の緯度(1つ目の地球に同期させない場合)
    Longitude2: [0.0],                   // [-180,180] 起動時の正面の経度(1つ目の地球に同期させない場合)
    Scale2: [1.0],                   // 二つ目の地球のサイズ(1つ目の地球に同期させない場合)
    /* 処理の意図確認:
      if (init_scale_factor2 > ez - nearlimit) init_scale_factor = ez-nearlimit;
      scale_factor2 = init_scale_factor2;
     */
    ScreenScaleXY2: [[3, -2.5, 1.0]],    // 二つ目の地球用のキャプションのサイズと位置
    TextureOfEarth2: [0, force_bool],  // 二つ目の地球は別のテクスチャーを使う
    EarthRotationSynch: [1, force_bool], // 回転を1つ目の地球に同期
    EarthSizeSynch: [1, force_bool], // 大きさを1つ目の地球に同期
    Earth2AngleAxisXY: [[0.0, 0.0, 1.0]],  // 1つ目の地球との角度差

    NumberOfTextures: [1, function (val) {         // レイヤー数（1または2）2015.03.ckk 追加仕様
        return (val != 2) ? 1 : 2;
    }],
    TextureName2: [''],        // 一つ目の地球と同様の設定（以下同じ）
    TextureSuffix2: [''],
    ScreenName2: [''],
    ScreenSuffix2: [''],
    SecondTextureName2: [''],
    SecondTextureSuffix2: [''],
    SecondScreenName2: [''],
    SecondScreenSuffix2: [''],
    /* DOW拡張設定*/
    // 代替素材ファイル
    AltTextureName2: [['', '']],  // マッピング画像の代替素材。
    AltScreenName2: [['', '']],  // キャプション画像の代替素材。
    AltSecondTextureName2: [['', '']],  // 第２マッピング画像の代替素材。
    AltSecondScreenName2: [['', '']],  // 第２キャプション画像の代替素材。

    // ----- 操作・GUI関連の設定 ------
    InvisibleCursor: [0, force_bool],  // カーソルを非表示にする
    NoMouseDragRotation: [0, force_bool],  // マウスのドラッグで地球を回転させない
    ClickLock: [0, force_bool],  // マウスの移動強制的に送る？
    Icon: [0],                 // [0: For no Icons, 13: Without Fullscreen, 14: Full Icons]
    IconScaleXY: [[0, NaN, NaN]], //Play/Stop
    Icon2ScaleXY: [[0, NaN, NaN]], //Initial
    Icon3ScaleXY: [[0, NaN, NaN]], //Reverse Play/Stop
    Icon4ScaleXY: [[0, NaN, NaN]], //Spin/Stop
    Icon5ScaleXY: [[0, NaN, NaN]], //1step Forward
    Icon6ScaleXY: [[0, NaN, NaN]], //1step Backward
    Icon7ScaleXY: [[0, NaN, NaN]], //Latitude/Longitude Lines
    Icon8ScaleXY: [[0, NaN, NaN]], //Zoom in
    Icon9ScaleXY: [[0, NaN, NaN]], //Zoom out
    Icon10ScaleXY: [[0, NaN, NaN]], //North upward
    Icon11ScaleXY: [[0, NaN, NaN]], // Fast (Play speed)
    Icon12ScaleXY: [[0, NaN, NaN]], // Slow (Play speed)
    Icon13ScaleXY: [[0, NaN, NaN]], //Quit
    Icon14ScaleXY: [[0, NaN, NaN]], //Full Screen

    Icon15ScaleXY: [[0, NaN, NaN]], // Logo Small
    Icon16ScaleXY: [[0, NaN, NaN]], // Logo Large
    Icon17ScaleXY: [[0, NaN, NaN]], // Logo Left
    Icon18ScaleXY: [[0, NaN, NaN]], // Logo Right
    Icon19ScaleXY: [[0, NaN, NaN]], // Logo Down
    Icon20ScaleXY: [[0, NaN, NaN]], // Logo Up

    Icon21ScaleXY: [[0, NaN, NaN]], // Switch Layers
    Icon22ScaleXY: [[0, NaN, NaN]], // Screen Show/Hide

    Icon23ScaleXY: [[0, NaN, NaN]], // Icon Show/Hide
    Icon24ScaleXY: [[0, NaN, NaN]], // お絵描きモードのon off
    Icon25ScaleXY: [[0, NaN, NaN]], // お絵描き消しゴム (erase drawings)
    Icon26ScaleXY: [[0, NaN, NaN]], // お絵描き保存 (save drawings)

    Icon27ScaleXY: [[0, NaN, NaN]], // 

    PresentationRemoteMode: [0, force_bool],  // 左右の矢印をコマ送りの前後にする。（2015.03 ckk 追加機能）
    PresentaionRemoteMode: [0, force_bool],  // Typo?

    // ----- 緯線経線のグリッド表示 ------
    // [緯線経線を表示するかどうか, 経線の数, 緯線の数, 緯線経線の太さ, 赤道の太さ]
    MeridianLatitude: [[0, 12, 6, 3., 5.], function (val) {
        val[0] = force_bool(val[0]);
        return val;
    }],
    // [緯線経線の色(RGBA), 赤道の色(RGBA)]
    ColorMeridianLatitude: [[1, 1, 1, 1, 0.8, 0.2, 0.2, 1.0]],

    // ----- その他 ------
    SpinIntervalSecond: [0.0001],				// 自転動作の時間間隔[秒]
    InertiaOfRotation: [[0.1, 0.01, 0.04, 0.995]], // [Start_criteria, Stop_criteria, Speed of rotation, Damping rate (1= no damping, 0 = no inertia rotation)]

    // ----- お絵かきモード(web版では未実装) -----
    LineThicknessColor: [[5.0, 1.0, 1.0, 1.0, 1.0]],
    PaletteScaleXY: [[0.15, -2.5, 1.2]],

    // ---- Plot モード ----- Ckk 1.23以降
    ArrowsName: [''],
    ArrowsSuffix: [''],
    ArrowsOn: [[1]],
    ArrowsInitDisplay: [[1]],
    LinesName: [''],
    LinesSuffix: [''],
    LinesOn: [[1]],
    LinesInitDisplay: [[1]],
    PointsName: [''],
    PointsSuffix: [''],
    PointsOn: [[1]],
    PointsInitDisplay: [[1]],
    // ---- Window Title ----- ckk1.25以降: 2015-11-12
    WindowTitle: [''],
    WindowTitle2: [''],
    ScreenBGTransparency: [''],
    // -----------------------  
    // -------- ckk1.26以降: 2016-04-28
    AutoReload: [0],
    AutoReloadIntervalMin: [0],
    // -----------------------  
};


DOW.Config.prototype = {

    init: function () {
        this.has_error = false;
        // Set initial values.
        for (var key in DOW.Config.PARAMETER_DEFINITION) {
            this[key] = DOW.Config.PARAMETER_DEFINITION[key][0];
        }
    },

    set_loader_wrapper: function (wrapper) {
        this.loader = wrapper !== undefined ? wrapper(this._loader) : this._loader;
    },

    load: function (conf_files, loaded_handler, ignore_cache) {

        this.init();

        // もし読み込み前の割り込み関数があればそれを呼び出す
        if (this.pre_loading_hook !== undefined)
            this.pre_loading_hook(this);

        // 渡された設定ファイルを順番に読み込む。読み込み完了のハンドラの前にhook関数が呼ばれるようにする。
        var _this = this;
        this._load_one(conf_files, function () {
            // もし読み込み完了時の割り込み関数があればそれを呼び出す
            if (_this.post_loading_hook !== undefined)
                _this.post_loading_hook(_this);
            // 渡されたハンドラを呼び出す
            loaded_handler();
        }, loaded_handler, ignore_cache);

    },

    _loader: {

        load: function (url, onLoad, onProgress, onError) {
            var xhr = new XMLHttpRequest();
            var _this = this;

            xhr.onreadystatechange = function () {
                if (xhr.readyState === xhr.DONE) {
                    // ロードの結果が出たらステータスをチェック
                    if (xhr.status !== 200 && xhr.status !== 0) {
                        onError(['E0011', url + ' (error state:' + xhr.status + ')']);
                    } else if (xhr.responseText == null || xhr.responseText.length == 0) {
                        onError(['E0012', url + ' (Could not read)']);
                    } else {
                        onLoad(xhr.responseText);
                    }
                }
            }

            xhr.open('GET', url, true);
            xhr.setRequestHeader('Pragma', 'no-cache');
            xhr.setRequestHeader('Cache-Control', 'no-cache');
            xhr.send(null);
        },

    },

    _load_one: function (conf_files, loaded_handler, ignore_cache) {

        var _this = this;

        if (conf_files.length > 0) {

            // リストにある先頭の設定ファイルを読み込む（残りは読み込みが終わったら_load_one関数を使って再帰的に読み込む）
            var path = conf_files[0];
            var force_reload_trailer = ignore_cache ? ('?' + Date.now()) : '';

            this.loader.load(path, function (data) {
                // 読み込めた場合のコールバック関数

                // 内容を行毎に読む
                var lines = data.split(/[\n\r]+/);
                for (var i in lines) {
                    // 行頭が#でなければ無視
                    if (lines[i][0] != "#") continue;

                    var words = lines[i].split(/\s+/);
                    var key = words[0].slice(1);

                    // パラメータ名が定義されているかチェック
                    var param_spec = DOW.Config.PARAMETER_DEFINITION[key];
                    if (param_spec == undefined) {
                        // 設定ファイル内の未定義設定のエラーをスキップ E0013　(2017-03-21):  _this.app.console.addDetail('E0013', '"#'+key+'" (line '+i+' in '+path+')');
                        if (_this.app.console.hasError) _this.has_error = true;
                        continue;
                    }

                    // パラメータの個数をチェック
                    if (Array.isArray(param_spec[0]) && words.length < param_spec[0].length + 1) {
                        _this.app.console.addDetail('E0014', lines[i] + ' (line ' + i + ' in ' + path + ')');
                        if (_this.app.console.hasError) _this.has_error = true;
                        continue;
                    } else if (!Array.isArray(param_spec[0]) && words.length < 2) {
                        _this.app.console.addDetail('E0014', lines[i] + ' (line ' + i + ' in ' + path + ')');
                        if (_this.app.console.hasError) _this.has_error = true;
                        continue;
                    }

                    var param = Array.isArray(param_spec[0]) ? words.slice(1, param_spec[0].length + 1) : words[1];
                    var line = words.slice(0, Array.isArray(param_spec[0]) ? param_spec[0].length + 1 : 2).join(' ');

                    // 数値パラメータなら文字列を数値に変換
                    if (Array.isArray(param)) {
                        for (var j in param_spec[0]) {
                            if (typeof param_spec[0][j] === 'number') {
                                param[j] = parseFloat(param[j]);
                                if (isNaN(param[j])) {
                                    _this.app.console.addDetail('E0015', line + ' (line ' + i + ' of ' + path + ')');
                                    if (_this.app.console.hasError) _this.has_error = true;
                                    continue;
                                }
                            }
                        }
                    } else {
                        if (typeof param_spec[0] === 'number') {
                            param = parseFloat(param);
                            if (isNaN(param)) {
                                _this.app.console.addDetail('E0015', line + ' (line ' + i + ' of ' + path + ')');
                                if (_this.app.console.hasError) _this.has_error = true;
                                continue;
                            }
                        }
                    }

                    // パラメータの後処理が必要ならそれを施す
                    if (param_spec.length > 1) {
                        try {
                            param = param_spec[1](param);
                        } catch (e) {
                            _this.app.console.addDetail('E0019', line + ' (line ' + i + ' of ' + path + ')');
                            if (_this.app.console.hasError) _this.has_error = true;
                            continue;
                        }
                    }

                    // ここまで失敗が無ければ設定値を上書きする
                    _this[key] = param;
                }

                // 残りの設定ファイルがあればそれを読み込む
                _this._load_one(conf_files.slice(1), loaded_handler, ignore_cache);

            }, undefined, function (error) {
                // 読み込めなかった場合のコールバック関数
                if (typeof error == 'array')
                    _this.app.console.addDetail(error[0], error[1]);
                else
                    _this.app.console.addDetail('E0012', error);
                if (_this.app.console.hasError) _this.has_error = true;

                // 残りの設定ファイルがあればそれを読み込む
                _this._load_one(conf_files.slice(1), loaded_handler, ignore_cache);
            });

        } else {	// else of 'if (conf_files.length > 0)'

            // 残りの設定ファイルが無ければ（そしてエラーも無ければ）あらかじめ渡された読み込み完了ハンドラを呼び返す
            if (!_this.has_error) {
                loaded_handler();
            } else {
                _this.app.console.showError(DOW.MESSAGES.M1001);
            }

        }

    },

    debug_log: function () {
        for (var key in DOW.Config.PARAMETER_DEFINITION)
            DOW.log(key + ': ' + this[key]);
    },

};
/*
 * KTXファイルフォーマットの圧縮テクスチャーを読み込む
 *
 * KTXファイル形式の仕様：
 * https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/
 * 
 * 圧縮テクスチャーはWebGLのY軸反転が効かないので画像側で反転しておく必要がある。（テクスチャー座標はYが上）
 */

DOW.CompressedTextureUtil = {

    // 対応している圧縮テクスチャーの一覧。
    // 内容は、{ gl, three, name }で、'gl'はOpenGLで定義された識別子の値、
    // 'three'はThreejsで使える圧縮形式の識別子、'name'は表示用の名前である。
    Formats: [],

    // 動作中のプラットフォームで対応している圧縮テクスチャーの一覧を得る。
    checkExtensions: function (renderer) {
        var extension;
        extension = renderer.extensions.get('WEBGL_compressed_texture_s3tc');
        if (extension !== null) {
            DOW.CompressedTextureUtil.Formats.push(
                { gl: extension.COMPRESSED_RGB_S3TC_DXT1_EXT, name: 'RGB_S3TC_DXT1', three: THREE.RGB_S3TC_DXT1_Format },
                { gl: extension.COMPRESSED_RGBA_S3TC_DXT1_EXT, name: 'RGBA_S3TC_DXT1', three: THREE.RGBA_S3TC_DXT1_Format },
                { gl: extension.COMPRESSED_RGBA_S3TC_DXT3_EXT, name: 'RGBA_S3TC_DXT3', three: THREE.RGBA_S3TC_DXT3_Format },
                { gl: extension.COMPRESSED_RGBA_S3TC_DXT5_EXT, name: 'RGBA_S3TC_DXT5', three: THREE.RGBA_S3TC_DXT5_Format }
            );
        }
        extension = renderer.extensions.get('WEBGL_compressed_texture_pvrtc');
        if (extension !== null) {
            DOW.CompressedTextureUtil.Formats.push(
                { gl: extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG, name: 'RGB_PVRTC_4BPPV1', three: THREE.RGB_PVRTC_4BPPV1_Format },
                { gl: extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG, name: 'RGB_PVRTC_2BPPV1', three: THREE.RGB_PVRTC_2BPPV1_Format },
                { gl: extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG, name: 'RGBA_PVRTC_4BPPV1', three: THREE.RGBA_PVRTC_4BPPV1_Format },
                { gl: extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG, name: 'RGBA_PVRTC_2BPPV1', three: THREE.RGBA_PVRTC_2BPPV1_Format }
            );
        }
        extension = renderer.extensions.get('WEBGL_compressed_texture_etc1');
        if (extension !== null) {
            DOW.CompressedTextureUtil.Formats.push(
                { gl: extension.COMPRESSED_RGB_ETC1_WEBGL, name: 'RGB_ETC1', three: THREE.RGB_ETC1_Format }
            );
        }
    },

    // KTXファイルの中身を読み込んで、テクスチャーに渡せるオブジェクトを返す。
    // 返されるオブジェクトの形式は、{ width, height, format, mipmaps, mipmapCount }である。
    parseKTXFile: function (buffer, loadMipmaps) {

        var ktx = { mipmaps: [], width: 0, height: 0, format: null, mipmapCount: 1 };

        var uint8buf = new Uint8Array(buffer);
        var uint32buf = new Uint32Array(buffer);

        var isKTX = function (bytes) {
            return [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A].every(function (v, i) { return v == bytes[i]; });
        }

        if (!isKTX(uint8buf)) {
            ktx.error = "KTXファイルではありません";
            return ktx;
        }

        // Endian checke
        var needsSwapBytes = uint32buf[3] != 0x04030201;
        var readUint32 = needsSwapBytes ? function (index) {
            index *= 4;
            return uint8buf[index] + (uint8buf[index + 1] << 8) + (uint8buf[index + 1] << 16) + (uint8buf[index + 1] << 24);
        } : function (index) {
            return uint32buf[index];
        }

        var glType = readUint32(4);
        var glTypeSize = readUint32(5);
        var glFormat = readUint32(6);
        var glInternalFormat = readUint32(7);
        var glBaseInternalFormat = readUint32(8);
        var pixelWidth = readUint32(9);
        var pixelHeight = readUint32(10);
        var pixelDepth = readUint32(11);
        var numberOfArrayElements = readUint32(12);
        var numberOfFaces = readUint32(13);
        var numberOfMipmapLevels = readUint32(14);
        var bytesOfKeyValueData = readUint32(15);

        // Replace with 1 if this field is 0.
        if (numberOfMipmapLevels == 0)
            numberOfMipmapLevels = 1;

        // 圧縮テクスチャーにのみ対応
        if (glType != 0 || glTypeSize != 1 || glFormat != 0) {
            ktx.error = "KTXLoaderは圧縮テクスチャー専用です";
            return ktx;
        }

        // 3Dテクスチャーには非対応
        if (pixelDepth != 0) {
            ktx.error = "KTXLoaderは3Dテクスチャーに非対応です";
            return ktx;
        }

        // TODO: テクスチャーアレイには非対応
        if (numberOfArrayElements != 0) {
            ktx.error = "KTXLoaderはテクスチャーアレイに非対応です";
            return ktx;
        }

        // TODO: キューブマップには非対応
        if (numberOfFaces != 1) {
            ktx.error = "KTXLoaderはキューブマップに非対応です";
            return ktx;
        }

        // プラットフォームで対応しているかのチェック
        var format = DOW.CompressedTextureUtil.Formats.find(function (f) { return f.gl == glInternalFormat; });
        if (format === undefined) {
            ktx.error = "圧縮フォーマットが非対応です:" + glInternalFormat;
            return ktx;
        }

        var headOfImageData = 4 * 16 + bytesOfKeyValueData;

        var width = pixelWidth;
        var height = pixelHeight;
        for (var i = 0; i < numberOfMipmapLevels; i++) {
            var imageSize = readUint32(headOfImageData / 4);
            var imageData = new Uint8Array(buffer, headOfImageData + 4, imageSize);
            var mipmap = { "data": imageData, "width": width, "height": height };
            ktx.mipmaps.push(mipmap);
            width = Math.max(width >> 1, 1);
            height = Math.max(height >> 1, 1);
            headOfImageData += 4 + imageSize + (3 - ((imageSize + 3) % 4));
            if (!loadMipmaps) break;
        }

        ktx.width = pixelWidth;
        ktx.height = pixelHeight;
        ktx.mipmapCount = ktx.mipmaps.length;
        ktx.format = format.three;

        return ktx;
    }
}

/*
  KTX圧縮テクスチャーローダー(CompressedTextureを生成しない版)

 { mipmaps: [...], width: 横のピクセル数, height: 縦のピクセル数, format: THREE形式の圧縮フォーマット識別子 } が返る。
 CompressedTextureにアサインする時は、imageに{width, height}, mipmaps, formatをセットしてneedsUpdateする。
 */
DOW.KTXLoaderWithoutTexture = function (no_mipmap, manager) {
    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
    this.no_mipmap = no_mipmap == true;
}

DOW.KTXLoaderWithoutTexture.prototype = {

    constructor: DOW.KTXLoaderWithoutTexture,

    load: function (url, onLoad, onProgress, onError) {
        var scope = this;
        var loader = new THREE.FileLoader(this.manager);
        loader.setResponseType('arraybuffer');

        var texData = {};
        loader.load(url, function (buffer) {
            var ktx = DOW.CompressedTextureUtil.parseKTXFile(buffer, !this.no_mipmap);
            if (ktx.error) {
                onError(ktx.error);
            } else {
                Object.assign(texData, ktx);
                if (onLoad) onLoad(texData);
            }
        }, onProgress, onError);

        return texData;
    },

};

/*
 KTX圧縮テクスチャーローダー
 */
DOW.KTXLoader = function (no_mipmap) {
    this._parser = function (buffer, loadMipmaps) {
        return DOW.CompressedTextureUtil.parseKTXFile(buffer, loadMipmaps && no_mipmap != true);
    }
}

DOW.KTXLoader.prototype = Object.create(THREE.CompressedTextureLoader.prototype);
DOW.KTXLoader.prototype.constructor = DOW.KTXLoader;

/***

    テクスチャーアニメーションとその制御

    TextureAnimator:
        Three.jsのテクスチャーをアニメーションさせるクラス。
        生成時の引数としてアニメーションの素材を渡す。
    素材は、Imageの配列、KTXDataの配列、のいずれか

    AnimationController:
        複数のTextureAnimatorの再生を制御するクラス。
        プロパティとして以下を持つ
        speed: 再生速度（1は標準再生速度、負数は逆再生）
        loop: ループ再生するかどうか
        firstFramePause, lastFramePause: ループする場合の冒頭と最後のポーズ時間（秒）
    ※「標準再生速度」とは、静止画連番なら5fps（ckkの標準速度）
         複数の素材の長さが異なる場合は、最も長いものに合わせて個々の素材の速度が調整される。

 ***/

DOW.AnimationController = function () {
    this.type = 'AnimationController';

    // Open Properties
    this.loop = false;
    this.firstFramePause = 0;
    this.lastFramePause = 0;

    // Internal properties
    this._syncMaster = new DOW.AnimatorSyncMaster();
    // Status
    this._player_state = 'STOPED';
};

DOW.AnimationController.prototype = {

    get status() {
        if (this._player_state == 'STOPED') return 0;
        return this._syncMaster.speed > 0 ? 1 : -1;
    },

    get speed() { return this._syncMaster.speed; },
    set speed(val) { this._syncMaster.speed = val; },

    get frame() { return this._syncMaster.frame; },

    get numberOfFrames() {
        return this._syncMaster.numberOfFrames;
    },

    add: function (anims) {
        if (Array.isArray(anims))
            anims.forEach(function (e, i, a) { this._syncMaster.add_animator(e); }, this);
        else
            this._syncMaster.add_animator(anim);
    },

    play: function () {
        if (this._player_state == 'STOPED') {
            this._player_state = 'START_PLAY';
            //DOW.log('STATE -> '+ this._player_state);
        }
    },

    pause: function () {
        if (this._player_state != 'STOPED') {
            this._syncMaster.pause();
            this._player_state = 'STOPED';
            //DOW.log('STATE -> '+ this._player_state);
        }
    },

    seek: function (frame) {
        this._syncMaster.seek(frame);
    },

    step: function (s) {
        var f = this._syncMaster.frame;
        this._syncMaster.frame = f + s;
    },

    // 毎フレーム呼ばれる
    update: function (deltaTime) {

        if (this._player_state === 'STOPED') {
        }

        if (this._player_state === 'START_PLAY') {
            if (this._speed > 0 && this._syncMaster.currentPosition == 1) this._syncMaster.seek(0);
            if (this._speed < 0 && this._syncMaster.currentPosition == 0) this._syncMaster.seek(this._syncMaster.numberOfFrames);
            this._syncMaster.play();
            this._player_state = 'PLAYING';
            //DOW.log('STATE -> '+ this._player_state + '(' + this._syncMaster.currentPosition + ')');
        }

        if (this._player_state === 'PLAYING') {
            this._syncMaster.update(deltaTime);
            if (!this._syncMaster.playing) {
                if (this.loop) {
                    this._pause_timer = this._syncMaster.speed > 0 ? this.lastFramePause : this.firstFramePause;
                    this._player_state = 'POST_PAUSE';
                } else {
                    this._syncMaster.pause();
                    this._player_state = 'STOPED';
                }
                //DOW.log('STATE -> '+ this._player_state + '(' + this._syncMaster.currentPosition + ')');
            }
        }

        if (this._player_state === 'POST_PAUSE') {
            if (this._pause_timer > 0) {
                this._pause_timer -= deltaTime;
            } else {
                this._syncMaster.seek(this._syncMaster.speed > 0 ? 0 : this._syncMaster.numberOfFrames);
                this._syncMaster.update(deltaTime);
                this._pause_timer = this._syncMaster.speed > 0 ? this.firstFramePause : this.lastFramePause;
                this._player_state = 'PRE_PAUSE';
                //DOW.log('STATE -> '+ this._player_state + '(' + this._syncMaster.currentPosition + ')');
            }
        }

        if (this._player_state === 'PRE_PAUSE') {
            if (this._pause_timer > 0) {
                this._pause_timer -= deltaTime;
            } else {
                this._syncMaster.play();
                this._player_state = 'PLAYING';
                //DOW.log('STATE -> '+ this._player_state + '(' + this._syncMaster.currentPosition + ')');
            }
        }

    },

};

DOW.TextureAnimator = function (layer) {
    this.type = 'TextureAnimator';
    this.layer = layer;

    // Resource
    this._time = 0;
    this._current_frame = 0;
    switch (layer.resource_type) {
        case 'image':
            this._texture = new THREE.Texture(layer.resources[0]);
            this._texture.needsUpdate = true;
            DOW.log("image: " + layer.resources[0]);
            break;
        case 'texdata':
            var texData = layer.resources[0];
            this._texture = new THREE.CompressedTexture(texData.mipmaps, texData.width, texData.height, texData.format);
            if (texData.mipmaps.length == 1)
                this._texture.minFilter = THREE.LinearFilter;
            // 縦横が2の累乗か確認（x & (x-1) が0なら2の累乗）
            if ((texData.width & (texData.width - 1)) != 0 || (texData.width & (texData.width - 1)) != 0)
                this._texture.minFilter = THREE.LinearFilter;
            this._texture.needsUpdate = true;
            DOW.log("texData: " + layer.resources[0]);
            break;
    }

    this._playing = false;
    this._enable = false;
};

DOW.TextureAnimator.prototype = {

    constructor: DOW.TextureAnimator,

    get isImages() { return this.layer.resource_type == 'image'; },
    get isTexData() { return this.layer.resource_type == 'texdata'; },

    get length() { return this.layer.length; },
    get duration() { return this.layer.length / DOW.CKK_STD_FPS; },
    get texture() { return this._texture; },

    get aspect() {
        return this.texture.image.width / this.texture.image.height;
    },

    get enable() { return this._enable; },
    set enable(value) {
        if (value && !this._enable)
            this._update_frame();
        this._enable = value;
    },

    setTargetMaterial: function (material) {
        this._material = material;
    },

    seek: function (frame) {
        var index = Math.floor(frame);
        if (index < 0) index = 0;
        if (index > this.layer.length - 1) index = this.layer.length - 1;
        if (this._current_frame != index) {
            this._current_frame = index;
            if (this._enable) this._update_frame();
        }
    },

    _update_frame: function () {
        if (this.isImages) {
            var image = this.layer.resources[this._current_frame];
            if (image && image.width > 0) {
                this._texture.image = image;
                this._texture.needsUpdate = true;
            }
        } else if (this.isTexData) {
            var texData = this.layer.resources[this._current_frame];
            if (texData && texData.mipmaps) {
                this._texture.mipmaps = texData.mipmaps;
                this._texture.image.width = texData.width;
                this._texture.image.height = texData.height;
                this._texture.format = texData.format;
                this._texture.needsUpdate = true;
            }
        }
        // BAD HACK: set map() は THREE.ShaderMaterialには無い。
        if (this._material instanceof THREE.MeshBasicMaterial)
            this._material.map = this._texture;
        else if (this._material instanceof THREE.ShaderMaterial) {
            if (this._material.uniforms.map.value != this._texture)
                this._material.uniforms.map.value = this._texture;
        }

    },

};

DOW.AnimatorSyncMaster = function AnimatorSyncMaster() {
    this.type = 'AnimatorSyncMaster';

    this.sequences = [];

    //this._position = 0;
    this._frame = 0;
    this._speed = 1;
    this._playing = false;
};

DOW.AnimatorSyncMaster.prototype = {

    get currentTime() { return this._frame / DOW.CKK_STD_FPS; },

    get currentPosition() { return this._frame / this.numberOfFrames; },

    get playing() {
        return this._playing;
    },

    get duration() {
        return this.numberOfFrames / DOW.CKK_STD_FPS;
    },

    get numberOfFrames() {
        return this.sequences.reduce(function (num, anim) { return num < anim.layer.length ? anim.layer.length : num; }, 0);
    },

    get frame() {
        //return this._position == 1 ? this.numberOfFrames - 1 : Math.floor(this._position * this.numberOfFrames);
        return Math.floor(this._frame);
    },
    set frame(f) {
        if (f < 0) f = 0;
        if (f >= this.numberOfFrames) f = this.numberOfFrames - 1;
        this._frame = f;
        this.seek(this._frame);
    },

    get speed() { return this._speed; },
    set speed(val) {
        this._speed = val;
    },

    add_animator: function (anim) {
        this.sequences.push(anim);
    },

    play: function () {
        this._playing = true;
    },

    pause: function () {
        this._playing = false;
    },

    seek: function (pos) {
        this._frame = pos;
        this.sequences.forEach(function (e, i, a) { e.seek(pos); });
    },

    update: function (deltaTime) {
        if (!this._playing) return;

        this._frame += deltaTime * this._speed * DOW.CKK_STD_FPS;

        // console.log('frame: '+this._frame);

        if (this._frame >= this.numberOfFrames && this._speed > 0) {
            this._playing = false;
            this._frame = this.numberOfFrames;
        } else if (this._frame <= 0 && this._speed < 0) {
            this._playing = false;
            this._frame = 0;
        }

        this.sequences.forEach(function (e, i, a) { e.seek(this._frame); }, this);
    },

};

/**
   地球やスクリーンに表示する要素を
   今のところ、連番画像（圧縮テクスチャー画像含む）と映像ファイルに対応しているが、
   お絵かきファイルやプロットデータ等の拡張も考慮しておく。

   使い方
   1) リソースURLを指定して作成
   var layer = new LayerXXXXX( url );
   2) ロード
   layer.load(onFirstLoad, onLoad, onError);
   3) 適用
   earth.addTextureLayer( index, layer );
   earth.addLayer( layer, name );
   4) アップデート
   layer.update( frame );

   このクラスでできることは、現時点ではリソースの読み込み管理のみ。
   現状、再生処理は外部のTextureAnimatorに負っているが、将来的にはそれを組み込んで、
   地球やスクリーンへの適用方法の抽象化も担う想定。
*/

(function () {

    /**
       @class Layer
       @param { name } レイヤーの名称(任意)
    */
    var Layer = function (name) {

        this.name = name;

        //TODO: isAnimationがtrueのレイヤーはAnimationControllerで制御される。
        //this.isAnimation = false;

        this._enable = true;

    };

    Layer.prototype = {

        constructor: Layer,

        get enable() { return this._enable; },

        set enable(value) { this._enable = value; },

    };

    /**
       @param { name } レイヤーの名称(任意)
       @param { alt_url } Alt形式の絶対URL
       @param { alt_type } 'image' | 'images'
       @param { ignore_cache } true | false
    */
    var TextureLayer = function (name, alt_url, alt_type, ignore_cache) {

        Layer.call(this, name);      // := super();

        this.resources = [];
        this.ignore_cache = ignore_cache;

        this.done = false;
        this.firstDone = false;
        this.load_count = 0;
        this.error_count = 0;
        this.aborted = false;

        this.alt_url = alt_url;
        this.fixed_length = 9999;

        // リソースタイプ： 'image' | 'texdata'
        if (alt_type == 'image' || alt_type == 'images')
            this.resource_type = alt_url.indexOf('.ktx', alt_url.length - 4) !== -1 ? 'texdata' : 'image';
        else
            this.resource_type = undefined;

        // デフォルトのローダー
        this._loader = this._create_image_loader();
    }

    TextureLayer.prototype = {

        constructor: TextureLayer,

        /**
           @param { onLoad: function(layer, index, url) }
           @param { onProgress: function(layer, ratio) }
           @param { onError: function(layer, index, url, error) }
           @param { create_wrapper_func: function(loader):loader }
           @param { num_sessions: integer }
           @param { ignore_cache } true | false
        */
        load: function (onLoad, onProgress, onError, create_wrapper_func, num_sessions) {

            var loader = this._loader;
            if (create_wrapper_func) loader = create_wrapper_func(loader);
            if (num_sessions == undefined) num_sessions = 1;

            var ic = this.ignore_cache ? '?' + Date.now() : '';

            var layer = this;

            console.log('load: ' + this.alt_url);

            var match = /^(.*)\[(\d+)-(\d+)\](.*)$/.exec(this.alt_url);
            if (!match) {

                this.resources[0] = loader.load(this.alt_url + ic, function (data) {
                    if (layer.aborted) return;
                    layer.resources[0] = data;
                    layer.load_count++;
                    layer.firstDone = true;
                    layer.done = true;
                    onLoad(layer, 0, layer.alt_url);
                }, undefined, function (error) {
                    if (layer.aborted) return;
                    layer.error_count++;
                    if (onError) onError(layer, 0, layer.alt_url, error);
                });

            } else {

                var header = match[1];
                var start = +match[2] + 0;
                var end = +match[3] + 1;
                var trailer = match[4];

                this.fixed_length = Math.min(this.fixed_length, end - start);

                var load_one = function (layer, on_load, on_error) {
                  console.log(layer);
                    if (layer.aborted) return;

                    var index = layer.load_index;
                    layer.load_index++;
                    var url = header + (index + start) + trailer;

                    if (index < layer.fixed_length) {
                        loader.load(url + ic, function (data) {
                            if (layer.aborted) return;
                            // 最初のフレームが取得できたらフラグを立てる
                            if (index == 0) layer.firstDone = true;
                            if (index < layer.fixed_length) {
                                // 確定したコマ数(初期値はTextureEnd)以下なら画像をリソースに追加する
                                layer.resources[index] = data;
                                layer.load_count++;
                                // 次を読み込む。最初のフレームが取得できたなら読み込みセッションの数を増やす。
                                load_one(layer, on_load, on_error);
                                if (index == 0)
                                    while (num_sessions-- > 1) load_one(layer, onLoad, onError);
                            } else {
                                // 確定したコマ数を超えていたら、それ以上は追加せずに完了とする
                                layer.done = true;
                            }
                            // いずれにしてもイベントコールバックは発火させる。
                            if (onProgress) onProgress(layer, (layer.load_count + layer.error_count) / fixed_length);
                            if (on_load) on_load(layer, index, url);
                        }, undefined, function (error) {
                            if (layer.aborted || index >= layer.fixed_length) return;
                            layer.error_count++;
                            if (on_error) on_error(layer, index, url, error);
                        });
                    } else
                        layer.done = true;
                }

                // 最初のフレームをリクエストする
                this.aborted = false;
                this.load_index = 0;
                load_one(this, onLoad, onError);

            }

        },

        get length() {
            return this.resources.length;
        },

        fix_length: function (val) {
            this.fixed_length = val;
            if (this.length < val) {
                //console.log('fix_length('+val+') for '+this.name+ ' length('+this.length+') < val');
            } else if (this.length > val) {
                //console.log('fix_length('+val+') for '+this.name+ ' length('+this.length+') > val');
                this.resources.splice(val);
                this.done = true;
            } else {
                //console.log('fix_length('+val+') for '+this.name+ ' length == val');
                this.done = true;
            }
        },

        abort_loading: function () {
            this.aborted = true;
        },

        _create_image_loader: function () {
            if (this.alt_url.indexOf('.ktx', this.alt_url.length - 4) !== -1)
                return new DOW.KTXLoaderWithoutTexture();
            else {
                var loader = new THREE.ImageLoader();
                loader.setCrossOrigin('use-credentials');
                return loader;
            }
        },

    };
    Object.setPrototypeOf(TextureLayer.prototype, Layer.prototype);

    DOW.Layer = Layer;
    DOW.TextureLayer = TextureLayer;

})();

DOW.Trackball = function (app) {
    this.type = 'Tracker';

    this.app = app;
    // GUIエレメントにイベントハンドラーを仕掛ける（全面を覆う最上位のレイヤなので）
    this.element = app.gui.domElement;
    this.deltaRotation = new THREE.Quaternion();
    this._inertia = 0.0;                            // 回転の慣性（0〜1）

    this._center = new THREE.Vector2();
    this._radius = 1.0;

    var _this = this;

    var lastVector = new THREE.Vector3();
    var currentVector = new THREE.Vector3();
    var lerpVector = new THREE.Vector3();
    var startLoc = new THREE.Vector2();
    var Q_IDENTITY = new THREE.Quaternion(0, 0, 0, 1);

    /* 画面座標を地球表面を指すベクトルに変換する */
    function xy2dagik2d(x, y, vec2d) {
        // Dagik座標系に変換
        var ih = 1 / _this.element.clientHeight;
        vec2d.x = DOW.WTOP * (2 * x - _this.element.clientWidth) * ih;
        vec2d.y = DOW.WTOP * (1 - y * 2 * ih);
    }
    function xy2earth3d(x, y, earth3d, center2d) {
        // Dagik座標系に変換
        var ih = 1 / _this.element.clientHeight;
        var x2 = DOW.WTOP * (2 * x - _this.element.clientWidth) * ih;
        var y2 = DOW.WTOP * (1 - y * 2 * ih);

        // 地球座標系に変換
        x = (x2 - center2d.x) / _this._radius;
        y = (y2 - center2d.y) / _this._radius;
        var rr = x * x + y * y;
        var r = Math.sqrt(rr);

        if (rr > 1) {
            earth3d.set(x / r, y / r, 0);
        } else {
            earth3d.set(x, y, Math.sqrt(1 - rr));
        }

        return r;
    }

    // Passive Event Listener: https://www.chromestatus.com/feature/5745543795965952
    var supportsPassive = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function () {
                supportsPassive = true;
            }
        });
        window.addEventListener("testPassive", null, opts);
        window.removeEventListener("testPassive", null, opts);
    } catch (e) { }
    // Use our detect's results. passive applied if supported, capture will be false either way.
    // elem.addEventListener('touchstart', fn, supportsPassive ? { passive: true } : false);

    this.reset = function () {
        this.deltaRotation.set(0, 0, 0, 1);
        this._tracking = false;
    }

    this.update = function (deltaTime) {
        if (this._tracking) {
            if (this._inertia > 0 && deltaTime < this._inertia) {
                lerpVector.copy(lastVector).lerp(currentVector, deltaTime / this._inertia);
                this.deltaRotation.setFromUnitVectors(lastVector, lerpVector);
                lastVector.copy(lerpVector);
            } else {
                this.deltaRotation.setFromUnitVectors(lastVector, currentVector);
                lastVector.copy(currentVector);
            }
        } else {
            if (Math.acos(this.deltaRotation.w) * 2 > 0.0000001) {
                this.deltaRotation.slerp(Q_IDENTITY, deltaTime * (1 - this._inertia));
            } else {
                this.deltaRotation.set(0, 0, 0, 1);
            }
        }

        return !this.deltaRotation.equals(Q_IDENTITY);
    }

    this.start_track = function (x, y) {
        xy2dagik2d(x, y, startLoc);
        var r = xy2earth3d(x, y, currentVector, DOW.CKK_ROTATION_POLICY ? startLoc : _this._center);
        if (r > 1.1) return false;

        lastVector.copy(currentVector);
        _this.deltaRotation.set(0, 0, 0, 1);
        _this._tracking = true;
        return true;
    }


    this.track = function (x, y) {
        xy2earth3d(x, y, currentVector, DOW.CKK_ROTATION_POLICY ? startLoc : _this._center);
    }

    this.track_end = function (x, y) {
        _this._tracking = false;
    }

    function mouseMove(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        _this.track(ev.clientX, ev.clientY);
    }

    function mouseUp(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        _this.track_end();
        _this.element.removeEventListener('mousemove', mouseMove);
        _this.element.removeEventListener('mouseup', mouseUp);
    }

    function mouseDown(ev) {
        if (_this.start_track(ev.clientX, ev.clientY)) {
            ev.preventDefault();
            ev.stopPropagation();
            _this.element.addEventListener('mousemove', mouseMove, false);
            _this.element.addEventListener('mouseup', mouseUp, false);
        }
    }

    var start_touch_id = -1;
    function touchMove(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var t = undefined;
        for (var i in ev.changedTouches) {
            if (ev.changedTouches[i].identifier == start_touch_id) {
                t = ev.changedTouches[i];
                break;
            }
        }
        if (t != undefined) {
            _this.track(t.clientX, t.clientY);
        }
    }

    function touchEnd(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        start_touch_id = -1;
        _this.track_end();
        _this.element.removeEventListener('touchmove', touchMove);
        _this.element.removeEventListener('touchend', touchEnd);
        _this.element.removeEventListener('touchcancel', touchEnd);
    }

    function touchStart(ev) {
        var t = ev.targetTouches[0];
        // タッチ中ではなく、ボタン上でもなく、地球の上（よりちょっと外側までオーケー）ならタッチ処理を開始する。
        if (start_touch_id < 0 && ev.target == _this.element && _this.start_track(t.clientX, t.clientY)) {
            ev.preventDefault();
            ev.stopPropagation();

            start_touch_id = t.identifier;
            _this.element.addEventListener('touchmove', touchMove, supportsPassive ? { passive: false } : false);
            _this.element.addEventListener('touchend', touchEnd, false);
            _this.element.addEventListener('touchcancel', touchEnd, false);
        }

    }

    this.element.addEventListener('mousedown', mouseDown, false);

    /*
      this.domElement.addEventListener( 'mousewheel', mousewheel, false );
      this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox
    */

    //this.element.addEventListener( 'touchstart', touchStart, false );
    this.element.addEventListener('touchstart', touchStart, supportsPassive ? { passive: false } : false);

    /*
      this.domElement.addEventListener( 'touchend', touchEnd, false );
      this.domElement.addEventListener( 'touchmove', touchMove, false );
      window.addEventListener( 'keydown', keydown, false );
      window.addEventListener( 'keyup', keyup, false );
    */

};

DOW.Trackball.prototype = {

    set center(value) {
        this._center.set(value[0], value[1]);
    },

    get radius() {
        return this._radius;
    },

    set radius(value) {
        this._radius = value;
    },

    get inertia() {
        return this._inertia;
    },

    set inertia(value) {
        if (value < 0) value = 0;
        if (value > 1) value = 1;
        this._inertia = value;
    },

};


DOW.GUI = function (app) {
    this.type = 'GUI';

    this._app = app;

    this.buttons = {};
    this.buttons_by_config_name = {};
    this._visible = true;

    this.domElement = document.createElement('div');
    this.domElement.id = 'dow_ui';
    this.domElement.style.position = 'absolute';
    this.domElement.style.top = 0;
    this.domElement.style.left = 0;
    this.domElement.style.margin = 0;
    this.domElement.style.width = '100%';
    this.domElement.style.height = '100%';

    for (var i in DOW.ICONS) {
        var button = this.create_button(app.icondir, DOW.ICONS[i]);
        this.buttons[button.button_name] = button;
        this.buttons_by_config_name[button.config_name] = button;
    }

};

DOW.GUI.prototype = {

    layout: function (app) {

        // Configに応じて表示非表示を変える。
        for (var i in DOW.ICONS) {
            var desc = DOW.ICONS[i];
            var config_name = desc[0];
            var button = this.buttons_by_config_name[config_name];
            button.conf = app.config[config_name];
            if (button.conf === undefined || button.conf[0] == 0 || app.config.Icon <= i) {
                button.conf = [0, 0, 0];
                button.style.display = 'none';
            } else
                button.style.display = '';
        }

        // 2レイヤーでないならレイヤー切り替え関連のボタンは非表示にする
        if (app.config.NumberOfTextures != 2) {
            this.buttons['layer'].style.display = 'none';
        }

        // 未実装の機能のボタンを非表示にする
        this.buttons['screen_small'].style.display = 'none';
        this.buttons['screen_large'].style.display = 'none';
        this.buttons['screen_left'].style.display = 'none';
        this.buttons['screen_right'].style.display = 'none';
        this.buttons['screen_down'].style.display = 'none';
        this.buttons['screen_up'].style.display = 'none';
        this.buttons['draring_pen'].style.display = 'none';
        this.buttons['drawing_erase'].style.display = 'none';
        this.buttons['drawing_save'].style.display = 'none';

        var ratio = this.domElement.clientHeight / 4;
        var center = this.domElement.clientWidth / 2;
        for (var key in this.buttons_by_config_name) {
            var button = this.buttons_by_config_name[key];
            var left = button.conf[1] * ratio + center;
            var top = (DOW.WTOP - button.conf[2]) * ratio;
            button.style.position = 'absolute';
            button.style.top = top + 'px';
            button.style.left = left + 'px';
            var sz = (button.conf[0] * ratio) + 'px';
            button.style.width = sz;
            button.style.height = sz;
        }
    },

    show: function () {
        this.layout(this._app);
    },

    hide: function () {
        for (var name in this.buttons_by_config_name)
            this.buttons_by_config_name[name].style.display = 'none';
    },

    hide_except_icon23: function () {
        for (var name in this.buttons_by_config_name)
            if (name != 'Icon23ScaleXY')
                this.buttons_by_config_name[name].style.display = 'none';
    },

    _call_command: function (command) {
        if (command) {
            var commands = command.split(',');
            for (var i = 0; i < commands.length; i++)
                try { this._app['command_' + commands[i].trim()](); } catch { }
        }
    },

    create_button: function (icondir, desc) {
        var button = document.createElement('img');
        button.className = 'dow_button';
        button.style.display = 'none';
        button.alt = DOW.BUTTON_ALT_TEXT[desc[0]];
        button.setAttribute('role', 'button');
        // ボタン固有の値
        button.config_name = desc[0];
        button.button_name = desc[1];
        button.command = desc[2];
        button.icon1 = this.path2url(icondir, desc[3]);
        button.icon2 = desc.length > 4 ? this.path2url(icondir, desc[4]) : undefined;
        button.conf = [0, 0, 0];

        this.domElement.appendChild(button);
        button.src = button.icon1;
        var _this = this;
        button.onclick = function () { if (this.command) _this._call_command(this.command); }

        return button;
    },

    path2url: function (icondir, path) {
        if (path.lastIndexOf('data:', 0) === 0 || path.lastIndexOf('file://', 0) === 0
            || path.lastIndexOf('http:', 0) === 0 || path.lastIndexOf('https://', 0) === 0)
            return path;
        else
            return icondir + '/' + path;
    }

};

DOW.Earth = function (layers) {
    this.type = 'Earth';

    this.layers = layers;

    layers.forEach(function (layer) {
        //texture.minFilter = THREE.NearestFilter;
        // 意外といいがピクセルが目立つ。
        //texture.minFilter = THREE.NearestMipMapNearestFilter;
        // 同心円と放射状の区切れがハッキリ見えすぎ。
        //texture.minFilter = THREE.NearestMipMapLinearFilter;
        // 同心円と放射状の区切れがハッキリ見えすぎ。
        layer.texture.minFilter = THREE.LinearFilter;
        // 意外といい。これにAnisotropicを組み合わせるといいかも。
        //texture.minFilter = THREE.LinearMipMapNearestFilter;
        // 極への集中がハッキリ
        //texture.minFilter = THREE.LinearMipMapLinearFilter;
        // 極への集中がハッキリ
        //texture.anisotropy = 4;
        // Anisotoropicは入れてもダメ。そもそもMipMapが悪い。
        layer.texture.generateMipmaps = false;
    });

    // テクスチャーマッピング
    this.material = new THREE.MeshBasicMaterial({ map: layers[0].texture });

    // 緯線罫線
    var vertexShader =
        "varying vec2 vUv;  \n" +
        "void main() {  \n" +
        "  vUv = uv;  \n" +
        "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  \n" +
        "} ";
    var fragmentShader =
        "varying vec2 vUv;  \n" +
        "uniform float line_width;  \n" +
        "uniform float equater_width;  \n" +
        "uniform vec4 line_color;  \n" +
        "uniform vec4 equater_color;  \n" +
        "uniform float num_lon;  \n" +
        "uniform float num_lat;  \n" +
        "float s(in float u, in float w, const in float n) {  \n" +
        "  u *= n;  \n" +
        "  w *= n * 0.25;  // 線の幅を度にするために 90(=absの振幅)/360 をかける  \n" +
        "  return smoothstep(-(1.0+0.2)*w, -(1.0-0.2)*w, - abs((u-0.5 - floor(u-0.5)) - 0.5) * 90.0);  \n" +
        "}  \n" +
        "void main() {  \n" +
        "  float equ_w = equater_width;  \n" +
        "  float lat_w = line_width;  \n" +
        "  float lon_w = line_width * 0.5 / cos(radians((vUv.y - 0.5) * 180.0));  \n" +
        "  float equ_a = s(vUv.y-0.5, equ_w, 1.0);  \n" +
        "  float lin_a = max(0.0, min(1.0, s(vUv.x, lon_w, num_lon) + s(vUv.y, lat_w, num_lat)) - equ_a);  \n" +
        "  gl_FragColor = equater_color * equ_a + line_color * lin_a;  \n" +
        "} ";

    this.grid_uniforms = {
        line_width: { value: 0.4 },
        equater_width: { value: 0.6 },
        line_color: { value: [0.9, 0.9, 0.9, 0.4] },
        equater_color: { value: [0.8, 0.2, 0.2, 0.5] },
        num_lon: { value: 12 },
        num_lat: { value: 6 },
    }
    this.grid_material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: this.grid_uniforms,
        transparent: true,
        depthTest: false,             // デプスのばたつき防止
    });

    this.obj3d = this.setup_obj3d();
};

DOW.Earth.prototype = {

    get scale() {
        return this.obj3d.scale.x;
    },
    set scale(value) {
        this.obj3d.scale.set(value, value, value);
    },

    get position() {
        return [this.obj3d.position.x, this.obj3d.position.y];
    },
    set position(xy) {
        this.obj3d.position.set(xy[0], xy[1], 0);
    },

    get rotation() {
        return this.obj3d.rotation;
    },
    set rotation(q) {
        this.obj3d.rotation.copy(q);
    },

    get showGrid() {
        return this._grid.visible;
    },
    set showGrid(b) {
        return this._grid.visible = b;
    },

    setFrontLonLat: function (lon, lat) {
        var rad = Math.PI / 180.0;
        this.obj3d.rotation.set(lat * rad, -(lon + 90) * rad, 0, 'XYZ');
    },

    // line: [緯線経線を表示するかどうか, 経線の数, 緯線の数, 緯線経線の太さ, 赤道の太さ],
    // color: [緯線経線の色(RGBA), 赤道の色(RGBA)]
    setGridParam: function (param) {
        this.grid_uniforms.line_width.value = param.line[0] ? 0 : param.line[3] * 0.15;
        this.grid_uniforms.equater_width.value = param.line[0] ? 0 : param.line[4] * 0.15;
        this.grid_uniforms.line_color.value = param.color.slice(0, 4);
        this.grid_uniforms.equater_color.value = param.color.slice(4, 8);
        this.grid_uniforms.num_lon.value = param.line[1];
        this.grid_uniforms.num_lat.value = param.line[2];
    },

    localRotate: function (quaternion) {
        this.obj3d.quaternion.multiply(quaternion);
    },

    rotate: function (quaternion) {
        this.obj3d.quaternion.multiplyQuaternions(quaternion, this.obj3d.quaternion);
    },

    northUp: function () {
    },

    changeLayer: function (index) {
        if (index < this.layers.length)
            this.layers.forEach(function (layer, idx) { layer.enable = (idx == index); });
    },

    setup_obj3d: function () {
        var sphere = new THREE.SphereGeometry(1.0, 64, 64);
        this._map = new THREE.Mesh(sphere, this.material);
        this._grid = new THREE.Mesh(sphere, this.grid_material);
        var group = new THREE.Group();
        group.add(this._map);
        group.add(this._grid);
        return group;
    },

}


DOW.Screen = function (layers) {
    this.type = 'Screen';

    this.layers = layers;

    this.aspect = layers[0].aspect || 1;

    // スクリーン用シェーダー
    // 要改善: THREE.ShaderMaterialには set map が無いので、TextureAnmator側で対策している。
    var vertexShader =
        "varying vec2 vUv; \n" +
        "void main() { \n" +
        "  vUv = uv;  \n" +
        "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); \n" +
        "}";
    var fragmentShader =
        "varying vec2 vUv; \n" +
        "uniform sampler2D map; \n" +
        "void main() { \n" +
        "  vec4 color = texture2D(map, vUv); \n" +
        "  // 背景の黒部分を滑らかに透過させる  \n" +
        "  color.a = smoothstep(0.0, 0.2, 0.299 * color.r + 0.587 * color.g + 0.114 * color.b);  \n" +
        "  gl_FragColor = color;  \n" +
        "}";

    this.material = new THREE.ShaderMaterial({
        uniforms: { map: { value: layers[0].texture } },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthTest: false,             // forceFrontかどうかでON/OFFする
    });

    //this.material = new THREE.MeshBasicMaterial({ map: layers[0].texture });
    this.mesh = this.setup_mesh(this.material);

    this.top_left = [0, 0];
};

DOW.Screen.prototype = {

    get scale() {
        return this.mesh.scale.x;
    },
    set scale(value) {
        var half_h = value * 0.5;
        var half_w = half_h * this.aspect;
        this.mesh.scale.set(value, value, value);
        this.mesh.position.set(this.top_left[0] + half_w, this.top_left[1] - half_h, 0);
    },

    get position() {
        return this.top_left;
    },
    set position(xy) {
        var half_h = this.mesh.scale.y * 0.5;
        var half_w = half_h * this.aspect;
        this.mesh.position.set(xy[0] + half_w, xy[1] - half_h, 0);
        this.top_left = xy;
    },

    get visible() {
        return this.mesh.visible;
    },
    set visible(value) {
        this.mesh.visible = value;
    },

    get forceFront() {
        return !this.material.depthTest;
    },
    set forceFront(value) {
        this.material.depthTest = !value;
    },

    changeLayer: function (index) {
        if (index < this.layers.length)
            this.layers.forEach(function (layer, idx) { layer.enable = (idx == index); });
    },

    setup_mesh: function (material) {
        var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.aspect, 1, 1, 1),
            material
        );
        return mesh;
    },

}

/***

DOW.Application: Web版Dagik_Earthのプログラム本体

使い方：

var app = new DOW.Application( element_id, { パラメータ } );
app.Run( { パラメータ } );

パラメータ：
  element_id: Dagik Earth を埋め込むHTML要素のID名
  content_base: コンテンツディレクトリの起点URL
  configs: 設定ファイルの配列（デフォルトは['data/conf/init_conf.txt', 'data/conf/conf.txt', 'data/conf/dow_conf.txt']）
  icondir: インタフェース用アイコン(png)のディレクトリ（デフォルトは js/icons）
  frame_update_hook: フレーム更新のたびに呼ばれるhook関数
  load_completed_hook: 全てのフレームが読み込まれると呼ばれるhook関数
  console: コンソールオブジェクトを外部から指定できる
  image_loader_wrapper: 画像等のローダーにラッパー関数を外部から指定できる
  config_loader_wrapper: 設定ファイルのローダーにラッパー関数を外部から指定できる
  northup_method: NorthUpの回転方法（'rotate','move','hybrid'のいずれか。末尾に'+up'または'&up'を付けられる）

ローダーラッパー：
  DOWが外部リソースを読み込む時に特殊な読み込み方ができるように、ラッパーを注入できるようにした。
  ラッパーは、元のローダーを引数にして、新しいローダーを返す関数である。

  ローダーは、以下のインタフェースを備えたオブジェクトである。
  {
    load: function( url, onLoad(data), onProgress(ratio), onError(error) )
  }

***/

/**
 * @param { string } element_id		- Dagik Earth を埋め込むHTML要素のID名
 * @param { Object } [params]			- オプションパラメータ
 * @param { string } [params.content_base]	- コンテンツディレクトリの起点URL
 * @param { Array<string> } [params.configs]	- 設定ファイルの配列（デフォルトは['data/conf/init_conf.txt', 'data/conf/conf.txt', 'data/conf/dow_conf.txt']）
 * @param { string } [params.icondir='js/icons']	- インタフェース用アイコン(png)のディレクトリ（デフォルトは js/icons）
 * @param { function(): void } [?params.frame_update_hook]	- フレーム更新のたびに呼ばれるhook関数
 * @param { function(): void } [?params.load_completed_hook]    - 全てのフレームが読み込まれると呼ばれるhook関数
 * @param { boolean } [?params.fast_view]	- 最初のフレームが準備できたらレンダリングを開始する
 * @param { Object } [?params.console] 	- コンソールオブジェクトを外部から指定できる
 * @param { Object } [?params.image_loader_wrapper] 	- 画像等のローダーにラッパーを外部から指定できる
 * @param { Object } [?params.config_loader_wrapper] 	- 設定ファイルのローダーにラッパーを外部から指定できる
 * @param { string } [?params.northup_method] 	- NorthUpの回転方法（'rotate','move','hybrid'。'+up','&up'をオプションで追加できる）
 */
DOW.Application = function (element_id, params) {

    console.log("DagikEarth on the Web (version " + DOW.VERSION + ")");

    this.type = 'Application';

    // プラグインを登録する
    DOW.plugins.register(params);

    this.content_base = params.hasOwnProperty('content_base') ? params.content_base + '/' : '';
    this.configs = params.hasOwnProperty('configs') ? params.configs : ['data/conf/init_conf.txt', 'data/conf/conf.txt', 'data/conf/dow_conf.txt'];
    this.icondir = params.hasOwnProperty('icondir') ? params.icondir : 'data/js/icons';
    this.frame_update_hook = params.hasOwnProperty('frame_update_hook') ? params.frame_update_hook : undefined;
    this.load_completed_hook = params.hasOwnProperty('load_completed_hook') ? params.load_completed_hook : undefined;
    this.fast_view = params.hasOwnProperty('fast_view') ? params.fast_view : true;
    this.console = params.hasOwnProperty('console') ? params.console : undefined;
    this.image_loader_wrapper_function = params.hasOwnProperty('image_loader_wrapper')
        ? params.image_loader_wrapper
        : function (loader) { return loader; }
    this.config_loader_wrapper_function = params.hasOwnProperty('config_loader_wrapper') ? params.config_loader_wrapper : undefined;
    this.northup_method = params.hasOwnProperty('northup_method') ? params.northup_method : 'hybrid';

    // プラグインにパラメータを渡す
    DOW.plugins.init(params, this);

    this.domElement = document.getElementById(element_id);
    this.domElement.className = 'dow_main';
    this.domElement.style.position = 'relative';

    this.renderer;
    this.scene;
    this.camera;
    // GL描画要素
    this.earth1;
    this.screen1;
    // 操作要素
    this.gui;
    this.trackball;

    // Getter/Setterで操作するプロパティ
    this._current_layer = 0;  // 表示レイヤ
    this._show_screen = true;
    this._spin_status = false;
    this._animation_status = 0; // [-1:back, 0:stop, 1:forward]
    this._animation_speed = 8;
    this._show_grid = false;
    this._earth_scale = 1;      // configで設定された値なら1
    this._show_icons = true;

    // このQuaternionがセットされていると、そこを目標に視点変更する。
    // セットされている間、トラックボール操作は受け付けない。
    // 現在は North Up、およびキー操作による回転で使われている。
    this._manual_rotation = null;

    // リソース読み込み中ならそれらをキャンセルするためのフラグ
    this.flag_cancel_loading = false;

    // 設定ファイルのリーダーを用意する
    this.config = new DOW.Config(this);

    // WebGL環境があるか確認する
    var webgl_ok;
    try {
        // Code from Detector.js
        var canvas = document.createElement('canvas');
        webgl_ok = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        webgl_ok = false;
    }

    if (webgl_ok) {
        // WebGL環境をセットアップしてDOMツリーに追加
        this.renderer = new THREE.WebGLRenderer();
        this.domElement.appendChild(this.renderer.domElement);
        this.renderer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
        this.renderer.setClearColor(new THREE.Color(0, 0, 0), 1);

        // デバイスの解像度に合わせる
        DOW.log("PixelRatio: default=" + this.renderer.getPixelRatio() + " device=" + window.devicePixelRatio);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // 圧縮テクスチャーを扱えるように、対応している圧縮形式を調べておく。
        DOW.CompressedTextureUtil.checkExtensions(this.renderer);

        // GLセットアップ完了のプラグインフック
        DOW.plugins.invoke('on_gl_ready', this);
    }

    // GUIを作ってDOMツリーに追加
    this.gui = new DOW.GUI(this);
    this.domElement.appendChild(this.gui.domElement);

    // 処理中の表示やエラー表示をする画面を用意（パラメータで渡されていない場合）
    if (!this.console) {
        this.console = new DOW.Console(this, this.domElement);
        this.domElement.appendChild(this.console.domElement);
    }
    this.console.clear();

    // WebGLに対応していない場合はエラーを表示
    if (!webgl_ok) {
        this.console.addDetail('E0001', '');
        return;
    }

    // THREEのCacheは無効にする
    THREE.Cache.enabled = false;

    var app = this;
    // イベントハンドラを登録する
    document.addEventListener('keydown', function (ev) { if (app.renderer && app.flag_scene_prepared) app.key_event(ev); });
    document.addEventListener('keypress', function (ev) { if (app.renderer && app.flag_scene_prepared) app.key_event(ev); });
    // リサイズイベントハンドラ（連続するリサイズイベントを250msecのあいだ無効化する）
    var resize_call_count = 0;
    window.addEventListener('resize', function (ev) {
        //if (! app.renderer || ! app.gui || ! app.flag_do_loop)
        if (!app.renderer || !app.gui)
            return;
        ++resize_call_count;
        window.setTimeout(function () {
            if (--resize_call_count > 0) return;
            app.layout();
            app.gui.layout(app);
        }, 250);
    });

    // フレーム更新ループのスイッチ
    this.frame_updater = undefined;
};


DOW.Application.prototype = {

    Run: function (params) {

        if (!this.renderer) return;

        // 動いているコンテンツがあれば終了する
        this.Stop();

        if (params !== undefined) {
            // パラメータを上書きする
            if (params.hasOwnProperty('content_base'))
                this.content_base = params.content_base + '/';
            if (params.hasOwnProperty('configs'))
                this.configs = params.configs;
            if (params.hasOwnProperty('icondir'))
                this.icondir = params.icondir;
            if (params.hasOwnProperty('fast_view'))
                this.fast_view = params.fast_view;
            if (params.hasOwnProperty('frame_update_hook'))
                this.frame_update_hook = params.frame_update_hook;
            if (params.hasOwnProperty('load_completed_hook'))
                this.load_completed_hook = params.load_completed_hook;
            if (params.hasOwnProperty('image_loader_wrapper'))
                this.image_loader_wrapper_function = params.image_loader_wrapper;
            if (params.hasOwnProperty('config_loader_wrapper'))
                this.config_loader_wrapper_function = params.config_loader_wrapper;
            if (params.hasOwnProperty('northup_method'))
                this.northup_method = params.northup_method;
        }

        // プラグインにパラメータを渡す
        DOW.plugins.run(params, this);

        // 現在動いているコンテンツを停止させる(レンダリングループを停止する)
        //this.flag_do_loop = false;

        // リソース読み込み中ならそれらをキャンセルする
        this.flag_cancel_loading = true;

        // 自動リロードの指定がある場合の次回のリロード時刻(unix epoch msec)
        this.next_reload_time = undefined;

        // 読み込み中画面を表示する
        this.console.clear();
        this.console.showProgress(0, 0, 0, DOW.MESSAGES.M0001);

        // 設定ファイルを読み込む（読み終わったら setup_resources を呼ぶ）

        // 設定ファイル読み込み前のプラグインフック
        DOW.plugins.invoke('on_pre_config', this);

        var app = this;
        this.flag_cancel_loading = false;
        this.config.set_loader_wrapper(this.config_loader_wrapper_function);
        this.config.load(
            // config files
            this.configs.map(function (conf) { return app.get_absolute_path(conf); }),
            // callback function
            function () {
                // 設定ファイル読み込み後のプラグインフック
                DOW.plugins.invoke('on_post_config', app);
                app.setup_resources();
            },
            // ignore cache
            true
        );

        // フレームループを開始する
        this.frame_updater = this.start_frame_loop();
    },

    Stop: function () {
        if (this.frame_updater) {
            // 再生終了前のプラグインフック
            DOW.plugins.invoke('on_pre_stop', this);

            // リソースの読み込みを中断する
            this.flag_cancel_loading = true;
            if (this.layers)
                for (var name in this.layers) { this.layers[name].abort_loading(); }

            // フレームの更新を停止する
            this.frame_updater.loop = false;
            this.frame_updater = undefined;

            // 再生終了後のプラグインフック
            DOW.plugins.invoke('on_post_stop', this);
        }

        this.flag_scene_prepared = false;
    },

    // 表示レイヤの指定
    get current_layer() { return this._current_layer; },
    set current_layer(value) {
        this._current_layer = value;
        if (this.earth1) this.earth1.changeLayer(value);
        if (this.screen1) this.screen1.changeLayer(value);
        var btn = this.gui.buttons['layer'];
        if (btn) btn.src = value == 0 ? btn.icon1 : btn.icon2;
    },

    get show_screen() { return this._show_screen; },
    set show_screen(flag) {
        this._show_screen = flag;
        if (this.screen1) this.screen1.visible = flag;
        var btn = this.gui.buttons['show_screen'];
        if (btn) btn.src = flag ? btn.icon1 : btn.icon2;
    },

    get show_grid() { return this._show_grid; },
    set show_grid(flag) {
        this._show_grid = flag;
        if (this.earth1) this.earth1.showGrid = flag;
        var btn = this.gui.buttons['show_grid'];
        if (btn) btn.src = flag ? btn.icon2 : btn.icon1;
    },

    get spin_status() { return this._spin_status; },
    set spin_status(flag) {
        this._spin_status = flag;
        var btn = this.gui.buttons['auto_spin'];
        if (btn) btn.src = flag ? btn.icon2 : btn.icon1;
    },

    get animation_status() { return this._animation_status; },
    set animation_status(value) {
        this._animation_status = value;
        if (value == 0) {
            this.animationController.pause();
        } else {
            var s = this.speedFromCKK(this.animation_speed) * this.animation_status;
            this.animationController.speed = s;
            this.animationController.play();
        }
        // update GUI
        var btn = this.gui.buttons['forward_play'];
        if (btn) btn.src = value != 1 ? btn.icon1 : btn.icon2;
        btn = this.gui.buttons['reverse_play'];
        if (btn) btn.src = value != -1 ? btn.icon1 : btn.icon2;
    },

    get animation_speed() { return this._animation_speed; },
    set animation_speed(value) {
        this._animation_speed = value > 30 ? 30 : (value < -30 ? -30 : value);
        var s = this.speedFromCKK(this.animation_speed) * this.animation_status;
        this.animationController.speed = s;
    },

    get earth_scale() { return this._earth_scale; },
    set earth_scale(value) {
        this._earth_scale = value;
        if (this.earth1) this.earth1.scale = this.config.Scale * this._earth_scale;
        if (this.trackball) this.trackball.radius = this.earth1.scale;
    },

    get show_icons() { return this._show_icons; },
    set show_icons(value) {
        this._show_icons = value;
        if (value) this.gui.show();
        else this.gui.hide_except_icon23();
    },

    setup_resources: function () {

        // Titleを変更する : ckk1.25での変更に対応 #WindowTitleで指定。: 2015-11-12
        document.title = this.config.WindowTitle;
        //

        console.log('TextureEnd: ' + this.config.TextureEnd);

        // 画像リソースが連番Alt形式で与えられていた場合、TextureStartとTextureEndを上書きする。
        if (this.config.AltTextureName[0] != '' && this.config.AltTextureName[1] == 'images') {
            var found = this.config.AltTextureName[0].match(/\[(\d+)-(\d+)\]/);
            if (found.length == 3) {
                this.config.TextureStart = parseInt(found[1]);
                this.config.TextureEnd = parseInt(found[2]) + 1;
            }
        }

        /*
        // E0018: Web版では、連番ファイルの末尾の番号が明示されていない（init_conf.txtに書かれた9999のまま）場合エラーとする。
        if (this.config.TextureEnd == 9999 && DOW.IGNORE_ERRORS.indexOf('E0018') < 0) {
          this.console.showError( DOW.MESSAGES.M1001 );
          this.console.addDetail( 'E0018', '' );
          return;
        }
        */

        // 素材名をAlt形式に整形
        var image_range = '[' + this.config.TextureStart + '-' + (this.config.TextureEnd - 1) + ']';
        console.log(image_range)
        if (this.config.AltTextureName[0] == '') {
            console.log('alt texture name: ' + this.config.AltTextureName[0]);
            this.config.AltTextureName = [this.config.TextureName + image_range + '.' + this.config.TextureSuffix, 'images'];
        }
        if (this.config.AltSecondTextureName[0] == '') {
            this.config.AltSecondTextureName = [this.config.SecondTextureName + image_range + '.' + this.config.SecondTextureSuffix, 'images'];
        }
        if (this.config.AltTextureName2[0] == '') {
            this.config.AltTextureName2 = [this.config.TextureName2 + image_range + '.' + this.config.TextureSuffix2, 'images'];
        }
        if (this.config.AltSecondTextureName2[0] == '') {
            this.config.AltSecondTextureName2 = [this.config.SecondTextureName2 + image_range + '.' + this.config.SecondTextureSuffix2, 'images'];
        }
        if (this.config.AltScreenName[0] == '') {
            this.config.AltScreenName = [this.config.ScreenName + image_range + '.' + this.config.ScreenSuffix, 'images'];
        }
        if (this.config.AltSecondScreenName[0] == '') {
            this.config.AltSecondScreenName = [this.config.SecondScreenName + image_range + '.' + this.config.SecondScreenSuffix, 'images'];
        }
        if (this.config.AltScreenName2[0] == '') {
            this.config.AltScreenName2 = [this.config.ScreenName2 + image_range + '.' + this.config.ScreenSuffix2, 'images'];
        }
        if (this.config.AltSecondScreenName2[0] == '') {
            this.config.AltSecondScreenName2 = [this.config.SecondScreenName2 + image_range + '.' + this.config.SecondScreenSuffix2, 'images'];
        }

        var texture_layers = [];
        // マッピング画像の読み込みをセット
        texture_layers.push(this.texture_layer('earth1_layer1_map', this.config.AltTextureName));
        texture_layers.push(this.texture_layer('earth1_layer1_screen', this.config.AltScreenName));
        // 第2レイヤーがあればその素材も読む
        if (this.config.NumberOfTextures == 2) {
            texture_layers.push(this.texture_layer('earth1_layer2_map', this.config.AltSecondTextureName));
            texture_layers.push(this.texture_layer('earth1_layer2_screen', this.config.AltSecondScreenName));
        }
        console.log("texture_layers", texture_layers)
        this.layers = texture_layers.reduce(function (dict, layer) { dict[layer.name] = layer; return dict; }, {});

        // リソースの読み込みを始める（同じ呼び出しでリロードもできる）
        this.load_resources();
    },

    /*
      load_resources: リソース読み込みの準備ができると setup_resources から呼び出されるほか、
                      単独のコマンドとしてリソースの再読み込みにも使える。
      （画像ファイル等を読み込んで、読み終わったら (まだ呼ばれてなければ)setup_scene を呼ぶ）
      @param { reload: bool } リロードかどうか
    */
    load_resources: function (reload) {

        // 読み込みがキャンセルされていたら読み込まずに終了
        if (this.flag_cancel_loading)
            return;

        // リソース読み込み前のプラグインフック
        DOW.plugins.invoke('on_pre_load', this);

        var texture_layers = [];
        for (var name in this.layers) texture_layers.push(this.layers[name]);

        var app = this;

        this.console.showProgress(0, 0, 0, DOW.MESSAGES.M0002);

        var load_completed = false;
        var fixed_length = this.config.TextureEnd - this.config.TextureStart;

        var isDone = function (e, i, a) { return e.done || !e.enable; }
        var isFirstLoaded = function (e, i, a) { return e.firstDone || !e.enable; }
        var progress = function (v, e, i, a) {
            if (e.enable) {
                v[0] += e.load_count; v[1] += e.error_count; v[2] += e.fixed_length;
            }
            return v;
        };

        // 画像の読み込み完了を待って、完了したら(まだ呼ばれてなければ)setup_sceneを呼ぶ
        function loading_check() {

            var both_of_map_and_screen_are_enable = app.layers.earth1_layer1_map && app.layers.earth1_layer1_map.enable
                || app.layers.earth1_layer1_screen && app.layers.earth1_layer1_screen.enable;

            if (!app.flag_scene_prepared
                && (app.fast_view && texture_layers.every(isFirstLoaded) || texture_layers.every(isDone))) {

                if (both_of_map_and_screen_are_enable) {
                    app.setup_scene();
                } else {
                    app.console.showError(DOW.MESSAGES.M1001);
                }

            }

            if (both_of_map_and_screen_are_enable && texture_layers.every(isDone)) {
                if (app.flag_scene_prepared) app.console.clear();
                if (!load_completed) {
                    load_completed = true;
                    // リソース読み込み後のプラグインフック
                    DOW.plugins.invoke('on_post_load', this);
                    // 読み込み完了のhook関数があればそれを呼び出す
                    if (app.load_completed_hook) app.load_completed_hook();
                    if (reload) console.log('reloaded');
                }
            }
        }

        // 画像が読み込めたときのハンドラー
        var onLoad = function (layer, index, url) {
            // showProgress()を先にやらないとload_check_and_do()の中のconsole.hide()が効かない。
            var progress_count = texture_layers.reduce(progress, [0, 0, 0]);
            // 読み込み枚数の分母が初期値のままで大きいとびっくりするので決まるまで隠す。
            var total = progress_count[2] >= 9999 ? '---' : progress_count[2];
            app.console.showProgress(
                progress_count[0] / progress_count[2],
                progress_count[0],
                total,
                DOW.MESSAGES.M0002
            );

            loading_check();
        }

        // 画像が読み込めなかった時のエラーハンドラー
        var onError = function (layer, index, url) {
            if (reload) {
                // リロード中のエラーならエラーを通知してその先の読み込みを中断する。
                layer.abort_loading();
                app.console.addDetail('E0101', url);
                app.console.addDetail('I0103', '(' + app.config.AutoReloadIntervalMin + '分後)');
                app.console.showError(DOW.MESSAGES.M1002);
            } else {
                if (index == 0) {
                    if (layer.name == 'earth1_layer1_map' || layer.name == 'earth1_layer1_screen')
                        app.console.addDetail('W0101', url);
                    else
                        app.console.addDetail('I0101', url);
                    // 最初の画像が読み込めなければそのレイヤーはdisableにする
                    layer.enable = false;
                    // そしてその先はもう読まない。
                    layer.abort_loading();
                } else {
                    // 2枚目以降の画像でエラーになったらそこまでを全てのレイヤーの規定コマ数とする
                    if (index < fixed_length) {  // <-- fixed_lengthより後ろのコマで読み込みエラーがあってもfixed_lengthは変えない。
                        fixed_length = index;
                        texture_layers.forEach(function (l) { l.fix_length(index); });
                    }
                }
                loading_check();
            }
        }

        // 画像の読み込みを幅優先で（それぞれのレイヤーを一枚づつ）読み込み開始する
        texture_layers.forEach(function (layer) {
            if (layer.enable) {
                // リロード中はエラーにはしない。
                layer.load(onLoad, undefined, onError, app.image_loader_wrapper_function, 2);
            }
        });

    },

    texture_layer: function (name, alt_config_name) {
        var alt_url = alt_config_name[0];
        var alt_type = alt_config_name[1];
        var ignore_cache = alt_type == 'image';
        return new DOW.TextureLayer(name, this.get_absolute_path(alt_url), alt_type, ignore_cache);
    },

    get_absolute_path: function (path) {
        if (path.lastIndexOf('http://', 0) === 0 || path.lastIndexOf('https://', 0) === 0 || path.lastIndexOf('file://', 0) === 0) {
            return path;
        } else {
            return this.content_base + path;
        }
    },

    /*
      setup_scene: シーン生成（リソースの読み込みが終わると呼び出される）
    */
    setup_scene: function () {

        var app = this;

        // シーン作成前のプラグインフック
        DOW.plugins.invoke('on_pre_scene', this);

        // カメラをセットアップする
        var aspect = this.domElement.clientWidth / this.domElement.clientHeight;
        if (this.config.Perspective) {
            var fovy = Math.atan(DOW.WTOP / this.config.EyePosition) * 2 * 180 / Math.PI;
            this.camera = new THREE.PerspectiveCamera(fovy, aspect, 0.01, 1000);
        } else {
            this.camera = new THREE.OrthographicCamera(-DOW.WTOP * aspect, DOW.WTOP * aspect, DOW.WTOP, -DOW.WTOP, 0.01, 1000);
        }
        this.camera.position.z = this.config.EyePosition;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        // アニメーションコントローラーを準備する。
        this.animationController = new DOW.AnimationController();
        this.animationController.loop = this.config.Repeat;
        this.animationController.firstFramePause = this.config.StopAt1stMap;
        this.animationController.lastFramePause = this.config.StopAtFinalMap;

        // 地球を作る
        if (this.layers.earth1_layer1_map && this.layers.earth1_layer1_map.enable) {
            // 地球
            var layers = [new DOW.TextureAnimator(this.layers.earth1_layer1_map)];
            if (this.layers.earth1_layer2_map && this.layers.earth1_layer2_map.enable)
                layers.push(new DOW.TextureAnimator(this.layers.earth1_layer2_map));
            this.animationController.add(layers);
            var earth = new DOW.Earth(layers);
            layers.forEach(function (item) { item.setTargetMaterial(earth.material); });
            this.earth1 = earth;
        }
        if (this.layers.earth1_layer1_screen && this.layers.earth1_layer1_screen.enable) {
            // キャプション
            layers = [new DOW.TextureAnimator(this.layers.earth1_layer1_screen)];
            if (this.layers.earth1_layer2_screen && this.layers.earth1_layer2_screen.enable)
                layers.push(new DOW.TextureAnimator(this.layers.earth1_layer2_screen));
            this.animationController.add(layers);
            var screen = new DOW.Screen(layers);
            layers.forEach(function (item) { item.setTargetMaterial(screen.material); });
            screen.scale = this.config.ScreenScaleXY[0];
            screen.position = [this.config.ScreenScaleXY[1], this.config.ScreenScaleXY[2]];
            screen.visible = this.config.ScreenOn;
            screen.forceFront = this.config.ScreenFront;
            this.screen1 = screen;
        }

        // 緯線罫線の設定を適用する
        if (this.earth1)
            this.earth1.setGridParam({ line: this.config.MeridianLatitude, color: this.config.ColorMeridianLatitude });
        this.show_grid = this.config.MeridianLatitude[0];

        // シーンにまとめる
        this.scene = new THREE.Scene();
        if (this.earth1) this.scene.add(this.earth1.obj3d);
        if (this.screen1) this.scene.add(this.screen1.mesh);
        this.scene.add(new THREE.AmbientLight(0xffffff));
        // 要素を画面内に配置する（リサイズ時にも呼ばれるのでハンドラとして作成）
        this.layout();

        // Gui要素の表示を反映
        this.show_icons = true;
        this.gui.layout(this);

        //// 動作の初期状態を設定
        this.command_initialize();

        // マウス入力を回転に変えるトラックボールコントロール
        if (this.earth1) {
            this.trackball = new DOW.Trackball(this);
            this.trackball.inertia = 0.2;
            this.trackball.radius = this.earth1.scale;      // scaleとpositionはcommand_initialize()の後で有効
            this.trackball.center = this.earth1.position;
        }

        // シーン作成後のプラグインフック
        DOW.plugins.invoke('on_post_scene', this);

        app.flag_scene_prepared = true;
    },

    start_frame_loop: function () {

        var updater = { loop: true };

        // レンダリングをまわす。
        var lastTime = Date.now() * 0.001;
        var q = new THREE.Quaternion();
        var app = this;

        var update_scene = function (timeDeltaSec) {

            // フレームアップデートのhook関数があればそれを呼び出す
            if (app.frame_update_hook) app.frame_update_hook();

            // 地球の回転操作
            var rotq = null;
            if (app._manual_rotation != null) {
                // 視点の明示的な回転
                if (Math.acos(app._manual_rotation.w) * 2 > 0.01) {
                    rotq = new THREE.Quaternion(w = 0).slerp(app._manual_rotation, timeDeltaSec * 5);
                    rotq.inverse();
                    app._manual_rotation.multiply(rotq);
                    rotq.inverse();
                } else {
                    app._manual_rotation = null;
                }
            } else {
                // マウスの回転操作を処理
                if (app.trackball) {
                    if (!app.config.NoMouseDragRotation && app.trackball.update(timeDeltaSec))
                        rotq = app.trackball.deltaRotation;
                }
            }
            if (rotq != null) {
                if (app.earth1 !== undefined) app.earth1.rotate(rotq);
            }

            // 自転:#SpinIntervalSecondあたりにjiten_kankaku(0.3度)*jitensokudo(設定値)/100
            // つまり、設定値は1秒間の回転角の1/30
            if (app.spin_status) {
                var angle = 0.003 * app.spin_speed * (timeDeltaSec / app.config.SpinIntervalSecond);
                q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle * Math.PI / 180);
                if (app.earth1 !== undefined) app.earth1.localRotate(q);
            }

            // アニメーション
            app.animationController.update(timeDeltaSec);

            // GUIの表示更新
            if (app.animation_status != 0 && app.animationController.status == 0)
                app.animation_status = 0;

        }

        var frame_loop = function () {

            var timeDeltaSec = Date.now() * 0.001 - lastTime;
            lastTime += timeDeltaSec;

            if (app.flag_scene_prepared) {

                // コンテンツのフレーム更新
                DOW.plugins.invoke('on_pre_frame', app);
                update_scene(timeDeltaSec);
                DOW.plugins.invoke('on_post_frame', app);

                // 自動リロードのチェック
                // 自動リロードの指定がある場合は、次回のリロード時刻を予約する（レンダリング中にチェックされる）
                if (app.config.AutoReload && !app.next_reload_time)
                    app.next_reload_time = Date.now() + app.config.AutoReloadIntervalMin * 60 * 1000;
                else if (app.next_reload_time && app.next_reload_time < Date.now()) {
                    app.next_reload_time = Date.now() + app.config.AutoReloadIntervalMin * 60 * 1000;
                    app.load_resources(true);
                }
            }

            // 次のフレームのレンダリング呼び出しを予約
            if (updater.loop)
                requestAnimationFrame(frame_loop);

            if (app.flag_scene_prepared) {
                // レンダリング自体はthree.jsにお任せ
                // TODO: 更新が必要かの判断を入れて、不要な画面更新を控える方が電池に優しい
                DOW.plugins.invoke('on_pre_render', app);
                app.renderer.render(app.scene, app.camera);
                DOW.plugins.invoke('on_post_render', app);
            } else {
                app.renderer.clear(true, true, true);
            }
        };

        // this.console.hide();

        frame_loop();

        return updater;
    },

    layout: function () {
        // 領域のサイズを取得
        var width = this.domElement.clientWidth;
        var height = this.domElement.clientHeight;
        // Rendererの領域を更新
        this.renderer.setSize(width, height);
        DOW.log('layout.setSize(' + width + ', ' + height + ')');
        if (this.camera) {
            // Cameraのアスペクト比を更新
            var aspect = width / height;
            if (this.config.Perspective) {
                this.camera.aspect = aspect;
            } else {
                this.camera.right = DOW.WTOP * aspect;
                this.camera.left = - DOW.WTOP * aspect;
            }
            this.camera.updateProjectionMatrix();
        }
    },

    // キーイベントハンドラ
    key_event: function (ev) {
        var key;
        if (ev.type == 'keydown') {
            switch (ev.keyCode) {
                // left:37, up:38, right:39, down:40, esc:27, enter:13
                case 13: key = 'ENTER'; break;
                case 27: key = 'ESCAPE'; break;
                case 37: key = 'LEFT_ARROW'; break;
                case 38: key = 'UP_ARROW'; break;
                case 39: key = 'RIGHT_ARROW'; break;
                case 40: key = 'DOWN_ARROW'; break;
            }
        } else if (ev.type == 'keypress') {
            key = String.fromCharCode(ev.charCode);
        }
        if (key !== undefined) {
            var command = DOW.KEY_ACTION[key];
            if (command !== undefined) {
                var commands = command.split(',');
                for (var i = 0; i < commands.length; i++)
                    this['command_' + commands[i].trim()]();
            }
        }
    },


    /********* コマンド *********/
    command_initialize: function () {
        DOW.log("command_initialize");
        this.command_initialize_view();
        this.command_initialize_control();
        // アニメーション表示を初期状態に
        this.animationController.seek(0.0);
        this.animation_status = this.config.Animation;
        this.animation_speed = this.config.AnimationSpeed;
    },

    command_initialize_view: function () {
        DOW.log("command_initialize_view");
        // 視点を初期状態に
        this.earth_scale = 1;
        if (this.earth1) {
            var scale = this.earth1.scale;
            this.earth1.position = DOW.CKK_EARTHXY_POLICY ? [this.config.EarthXY[0] * scale, this.config.EarthXY[1] * scale] : this.config.EarthXY;
            this.earth1.setFrontLonLat(this.config.Longitude, this.config.Latitude);
        }
        // トラックボール操作を停止
        if (this.trackball) this.trackball.reset();
    },

    command_initialize_control: function () {
        DOW.log("command_initialize_control");
        // 自転を初期状態に
        this.spin_status = this.config.Spin;
        this.spin_speed = this.config.SpinSpeed;
        // 表示レイヤを初期状態に
        this.current_layer = this.config.SecondTexture_at_startup && this.config.NumberOfTextures == 2 ? 1 : 0;
        // グリッド表示を初期状態に
        this.show_grid = this.config.MeridianLatitude[0];
        // スクリーン表示を初期状態に
        this.show_screen = this.config.ScreenOn;
    },

    command_fullscreen: function () {
        DOW.log("command_fullscreen");
        var fullscreen_element;
        if (document.fullscreenElement !== undefined) fullscreen_element = document.fullscreenElement;
        else if (document.webkitFullscreenElement !== undefined) fullscreen_element = document.webkitFullscreenElement;
        else if (document.mozFullScreenElement !== undefined) fullscreen_element = document.mozFullScreenElement;
        else if (document.msFullscreenElement !== undefined) fullscreen_element = document.msFullscreenElement;
        else return;

        if (fullscreen_element == null) {
            if (this.domElement.requestFullscreen) this.domElement.requestFullscreen();
            else if (this.domElement.webkitRequestFullscreen !== undefined) this.domElement.webkitRequestFullscreen();
            else if (this.domElement.mozRequestFullScreen) this.domElement.mozRequestFullScreen();
            else if (this.domElement.msRequestFullscreen) this.domElement.msRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.cancelFullScreen) document.cancelFullScreen();
            else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        }

    },

    command_fullscreen_off: function () {
        DOW.log("command_fullscreen_off");
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.cancelFullScreen) document.cancelFullScreen();
        else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    },

    command_hide_all_icons: function () {
        DOW.log("command_hide_all_icons");
        this.show_icons = !this.show_icons;
    },

    command_quit: function () {
        DOW.log("command_quit");
        window.history.back();
    },


    command_show_grid: function () {
        this.show_grid = !this.show_grid;
        DOW.log("command_show_grid");
    },

    command_show_screen: function () {
        this.show_screen = !this.show_screen;
        DOW.log("command_show_screen");
    },

    command_reset_north: function () {
        DOW.log("command_reset_north");
        if (!this.trackball || !this.earth1)
            return;
        // まずトラックボールによる慣性回転を止める
        if (this.trackball) this.trackball.reset();
        // northpoleは北極が向いているXYZ座標の単位ベクトル。これを所定の方向に移動させるための回転を求める。
        var northpole = new THREE.Vector3(0, 1, 0).applyQuaternion(this.earth1.obj3d.quaternion);

        // メソッドが'hybrid'の場合、地球のスケールによって適用するメソッドを切り替える
        var method = this.northup_method;
        if (method == 'hybrid')
            method = this.earth_scale > 1 ? 'rotate' : 'move+up';

        // 2段階で回転させる場合、北極がほぼ中心軸上で上側にあれば、それを(0, 1, 0)に回転させる。
        if (method.indexOf('+up', method.length - 3) !== -1) {
            if (northpole.x > -0.01 && northpole.x < 0.01 && northpole.y > 0.01) {
                this._manual_rotation = new THREE.Quaternion().setFromUnitVectors(northpole, new THREE.Vector3(0, 1, 0));
                return;
            }
        }
        var copy_of_np = new THREE.Vector3().copy(northpole);
        switch (method) {
            case 'rotate':
            case 'rotate+up':
            case 'rotate&up':
                // 中心を変えない回転（CKKと同じ動作）
                copy_of_np.z = 0;
                copy_of_np.normalize();
                this._manual_rotation = new THREE.Quaternion().setFromUnitVectors(copy_of_np, new THREE.Vector3(0, 1, 0));
                break;
            case 'move':
            case 'move+up':
            case 'move&up':
                // 中心から同じ距離だけ離れた中心子午線上に極点を移動する回転
                copy_of_np.x = 0;
                copy_of_np.y = Math.sqrt(1 - copy_of_np.z * copy_of_np.z);
                this._manual_rotation = new THREE.Quaternion().setFromUnitVectors(northpole, copy_of_np);
                break;
        }
        // 北極点を(0, 1, 0)にもってくる回転を同時にかける場合に追加する回転
        if (method.indexOf('&up', method.length - 3) !== -1) {
            northpole.applyQuaternion(this._manual_rotation);
            this._manual_rotation.premultiply(new THREE.Quaternion().setFromUnitVectors(northpole, new THREE.Vector3(0, 1, 0)));
        }
    },

    command_layer: function () {
        if (this.config.NumberOfTextures == 2)
            this.current_layer = this.current_layer == 0 ? 1 : 0;
        DOW.log("command_layer");
    },

    command_forward_play: function () {
        DOW.log("command_forward_play");
        this.animation_status = this.animation_status == 1 ? 0 : 1;
    },

    command_reverse_play: function () {
        DOW.log("command_reverse_play");
        this.animation_status = this.animation_status == -1 ? 0 : -1;
    },

    command_pause_or_play: function () {
        DOW.log("command_pause_or_play");
        this.animation_status = this.animation_status == 0 ? 1 : 0;
    },

    command_first_frame: function () {
        this.animationController.seek(0.0);
        DOW.log("command_first_frame");
    },

    command_last_frame: function () {
        this.animationController.seek(this.animationController.numberOfFrames - 1);
        DOW.log("command_last_frame");
    },

    command_play_fast: function () {
        this.animation_speed++;
        DOW.log("command_play_fast");
    },

    command_play_slow: function () {
        this.animation_speed--;
        DOW.log("command_play_slow");
    },

    speedFromCKK: function (ckk_val) {
        return Math.pow(2.0, ckk_val / 2.0 - 4.0);
    },

    command_step_backward: function () {
        this.animation_status = 0;
        this.animationController.step(-1);
        DOW.log("command_step_backward");
    },

    command_step_backward_or_wrap: function () {
        this.animation_status = 0;
        if (this.animationController.frame == 0)
            this.command_last_frame();
        else
            this.animationController.step(-1);
        DOW.log("command_step_backward_or_warp");
    },

    command_step_backward10: function () {
        this.animation_status = 0;
        this.animationController.step(-10);
        DOW.log("command_step_backward10");
    },

    command_step_forward: function () {
        this.animation_status = 0;
        this.animationController.step(1);
        DOW.log("command_step_forward");
    },

    command_step_forward_or_wrap: function () {
        this.animation_status = 0;
        if (this.animationController.frame == this.animationController.numberOfFrames - 1)
            this.command_first_frame();
        else
            this.animationController.step(1);
        DOW.log("command_step_forward_or_wrap");
    },

    command_step_forward10: function () {
        this.animation_status = 0;
        this.animationController.step(10);
        DOW.log("command_step_forward10");
    },


    command_auto_spin: function () {
        this.spin_status = !this.spin_status;
        DOW.log("command_auto_spin");
    },

    command_spin_fast: function () {
        this.spin_speed += 1;
        DOW.log("command_spin_fast");
    },

    command_spin_slow: function () {
        this.spin_speed -= 1;
        DOW.log("command_spin_slow");
    },


    command_zoom_in: function () {
        this.earth_scale *= 1.1;
        DOW.log("command_zoom_in");
    },

    command_zoom_in_petit: function () {
        this.earth_scale *= 1.01;
        DOW.log("command_zoom_in_petit");
    },

    command_zoom_out: function () {
        this.earth_scale /= 1.1;
        DOW.log("command_zoom_out");
    },

    command_zoom_out_petit: function () {
        this.earth_scale /= 1.01;
        DOW.log("command_zoom_out_petit");
    },


    command_screen_down: function () { DOW.log("command_screen_down"); },

    command_screen_large: function () { DOW.log("command_screen_large"); },

    command_screen_left: function () { DOW.log("command_screen_left"); },

    command_screen_right: function () { DOW.log("command_screen_right"); },

    command_screen_small: function () { DOW.log("command_screen_small"); },

    command_screen_up: function () { DOW.log("command_screen_up"); },

    // 回転操作
    command_rotate_x_plus: function () {
        this._manual_rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.2);
    },
    command_rotate_x_minus: function () {
        this._manual_rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.2);
    },
    command_rotate_y_plus: function () {
        this._manual_rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.2);
    },
    command_rotate_y_minus: function () {
        this._manual_rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.2);
    },

    // お絵かき機能（Web版は無効）
    command_drawing_pen: function () { },
    command_drawing_erase: function () { },
    command_drawing_undo: function () { },
    command_drawing_save: function () { },

    // 矢印付きレイヤー切り替え
    command_forward_changelayer: function () {
        this.command_step_forward_or_wrap();
        this.command_layer();
        DOW.log("command_forward_changelayer");
    },

    // 矢印キーの操作
    command_up_arrow_key: function () {
        this.command_rotate_y_plus();
    },
    command_down_arrow_key: function () {
        this.command_rotate_y_minus();
    },
    command_right_arrow_key: function () {
        if (this.config.PresentationRemoteMode || this.config.PresentaionRemoteMode) this.command_step_forward();
        else this.command_rotate_x_plus();
    },
    command_left_arrow_key: function () {
        if (this.config.PresentationRemoteMode || this.config.PresentaionRemoteMode) this.command_step_backward();
        else this.command_rotate_x_minus();
    },


    command_force_reload: function () {
        console.log('reload');
        this.load_resources(true); // reload
    },

    // 開発支援機能
    command_toggle_console: function () {
        this.console.toggle();
    },
    command_loading_console: function () {
        this.console.loading();
    },
};
