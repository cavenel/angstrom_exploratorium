
(function() {

  // properties of this plugin
  var params = {
    projection: 'default',   // 'default', 'fisheye'
    lens_offset: 0,
    view_angle: 180,
    resolution: 512,
    r: 'r',
    a: 'a',
    func: 'return vec2(r, a);',
  }

  var init_params;
  var cube_camera;
  var dish_mesh;
  var app_scene;
  var screen1_visible;
  var uniforms;
  
  DOW.RegisterPlugin({

    name: 'CustomProjection',
    description: 'Enabling fisheye projection.',
    vender: 'dagik earth',
    version: '0.1.1',
    api_version: 1,

    // ライブパラメータの宣言
    live_params: {
      projection: {
	type: [ 'default', 'fisheye' ],
	desc: 'prjection type: "fisheye" or "default"',
	get: function() { return params.projection; },
	set: function(val) {
	  if (typeof(val) === 'string' && [ 'default', 'fisheye' ].indexOf(val) !== -1)
	    params.projection = val;
	}
      },
      lens_offset: {
	type: 'number',
	desc: 'offset of lens from the center of sphere. front is positive.',
	get: function() { return params.lens_offset; },
	set: function(val) {
	  if (typeof(val) === 'number' && val > -2 && val < 1 )
	    params.lens_offset = val;
	}
      },
      view_angle: {
	type: 'number',
	desc: 'projection angle in degree',
	get: function() { return uniforms.view_angle.value * 360.0; },
	set: function(val) {
	  if (typeof(val) === 'number' && val > 0 && val <= 360 )
	    uniforms.view_angle.value = val / 360.0;
	}
      },
    },

    init_params: function(_params) {
      init_params = Object.assign({}, params);
      if (_params)
	init_params = Object.assign(init_params, _params);
      params = Object.assign(params, init_params);
    },

    run_params: function(_params) {
      params = Object.assign({}, init_params);
      if (_params)
	Object.assign(params, _params);
    },

    run: function(app) {
      if (dish_mesh && cube_camera)
	dish_mesh.material = create_material(params, cube_camera.renderTarget.texture);
    },

    on_gl_ready: function(app) {
      cube_camera = new THREE.CubeCamera(0.1, 100, params.resolution);
      //dish_mesh = create_mesh(12, create_material(params, cube_camera.renderTarget.texture));
      dish_mesh = create_mesh(12, undefined);
      app_scene = undefined;
    },
    
    on_pre_render: function(app) {
      if (params.projection != 'fisheye') return;
      if (app.scene != app_scene) {
	app.scene.add(dish_mesh);
	app_scene = app.scene;
      }

      dish_mesh.position.set(app.earth1.obj3d.position.x, app.earth1.obj3d.position.y, 0);
      dish_mesh.scale.setScalar(app.earth1.scale);
      cube_camera.position.set(app.earth1.obj3d.position.x, app.earth1.obj3d.position.y, app.earth1.obj3d.position.z + params.lens_offset * app.earth1.scale);

      if (app.screen1) {
	screen1_visible = app.screen1.mesh.visible;
	app.screen1.mesh.visible = false;
      }
      dish_mesh.visible = false;

      var gl = app.renderer.context;
      var cull_face = gl.getParameter(gl.CULL_FACE_MODE);
      var depth_func = gl.getParameter(gl.DEPTH_FUNC);
      gl.cullFace(gl.FRONT);
      //gl.depthFunc(gl.GEQUAL); // ????
      cube_camera.update(app.renderer, app.scene);
      gl.cullFace(cull_face);
      gl.depthFunc(depth_func);

      if (app.screen1) app.screen1.mesh.visible = screen1_visible;
      if (app.earth1) app.earth1.obj3d.visible = false;
      dish_mesh.visible = true;
    },
    
    on_post_render: function(app) {
      if (params.projection != 'fisheye') return;
      if (app.screen1) app.screen1.mesh.visible = screen1_visible;
      if (app.earth1) app.earth1.obj3d.visible = true;
      dish_mesh.visible = false;
    },
    
  });
  
  function create_material(props, texture) {
    var vertexShader =
	"varying vec2 pos; \n" +
	"void main() { \n" +
	"  pos = position.xy; \n" +
	"  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); \n" + 
	"}";
    
    var fragmentShader =
	"const float PI = 3.14159265358979; \n" +
	"uniform float view_angle; \n" +
	"uniform samplerCube cube; \n" +
	"varying vec2 pos; \n" +

	"vec2 proj(float r, float a) { \n" +
	"  " + props.func + " \n" +
	"} \n" +

	"void main() { \n" +
	"  float r = length(pos.xy) * PI; \n" +
	"  float a = atan(pos.x, -pos.y); \n" +
	"  vec2 ra = proj(" + props.r + ", " + props.a + ") * vec2(view_angle, 1.0); \n" +
	"  float sin_r = sin(ra[0]); \n" +
	"  float cos_r = cos(ra[0]); \n" +
	"  float sin_a = sin(ra[1]); \n" +
	"  float cos_a = cos(ra[1]); \n" +
	"  vec3 point = vec3(sin_r * sin_a, -sin_r * cos_a, cos_r); \n" +
	"  vec4 color = textureCube(cube, point); \n" +
	"  gl_FragColor = color; \n" +
	"}";

    // console.log(vertexShader);
    // console.log(fragmentShader);

    uniforms = {
      cube: { value: texture },
      view_angle: { value: props.view_angle / 360.0 },
    }
    
    var material = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    } );

    return material;
  }
  
  function create_geometry(number_of_tracks, vec_func, tri_func) {
    var top0 = 0;   // first index of inner vertex of this track;
    var top1 = 1;   // first index of outer vertex of this track;
    var u0 = 0;     // first index of inner vertex of this unit;
    var u1 = 1;     // first index of outer vertex of this unit;
    var n = 1;      // number of inner points in one unit on this track;

    // center vertex
    vec_func(0, 0);

    // for each tracks ...
    for (var track = 0; track < number_of_tracks; track++) {
      // create 6 units of ...
      for (var unit = 0; unit < 6; unit++) {
	// outer vertex, ...
	for (var p = 0; p < n; p++)
	  vec_func((track+1) / number_of_tracks, (u1 + p - top1) / (n * 6));
	// and triangles.
	tri_func(u0, u1, (unit == 5 && track == 0) ? top1 : u1+1);
	for (var p = 1; p < n; p++) {
	  if (unit == 5 && p == n - 1) {
	    tri_func(u0+p-1, u1+p, top0);
	    tri_func(top0, u1+p, top1);
	  } else {
	    tri_func(u0+p-1, u1+p, u0+p);
	    tri_func(u0+p, u1+p, u1+p+1);
	  }
	}
	u0 += n - 1;
	u1 += n;
      }
      top0 += track == 0 ? 1 : (n - 1) * 6;
      top1 += n * 6;
      u0 = top0;
      u1 = top1;
      n++;
    }
  }
    
  function create_mesh(number_of_tracks, material) {
    
    var geom = new THREE.Geometry();

    var vidx = 0;
    var tidx = 0;
    create_geometry(number_of_tracks, function(r, a) {
      var x = r * Math.cos(a * Math.PI * 2);
      var y = r * Math.sin(a * Math.PI * 2);
      geom.vertices.push(new THREE.Vector3(x, y, 0));
    }, function(p1, p2, p3) {
      geom.faces.push(new THREE.Face3(p1, p2, p3));
    });

    geom.computeBoundingSphere();

    return new THREE.Mesh( geom, material );
  }
  
})();
