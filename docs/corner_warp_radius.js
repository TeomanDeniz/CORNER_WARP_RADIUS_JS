/******************************************************************************\
# JS - corner_warp_radius                        #       Maximum Tension       #
################################################################################
#                                                #      -__            __-     #
# Teoman Deniz                                   #  :    :!1!-_    _-!1!:    : #
# maximum-tension.com                            #  ::                      :: #
#                                                #  :!:    : :: : :  :  ::::!: #
# +.....................++.....................+ #   :!:: :!:!1:!:!::1:::!!!:  #
# : C - Maximum Tension :: Create - 2016/01/24 : #   ::!::!!1001010!:!11!!::   #
# :---------------------::---------------------: #   :!1!!11000000000011!!:    #
# : License - MIT       :: Update - 2026/09/18 : #    ::::!!!1!!1!!!1!!!::     #
# +.....................++.....................+ #       ::::!::!:::!::::      #
\******************************************************************************/

const	corner_warp_radius = {
	dom: null,
	gl: null,
	program: null,
	tex: null,
	aspect: 1,
	current_source: null,
	vs: "attribute vec2	A_POSITION;" +
		"varying vec2	V_UV;" +
		"void" +
		"	main()" +
		"{" +
		"	V_UV = A_POSITION * 0.5 + 0.5; gl_Position = vec4(A_POSITION, 0.0, 1.0);" +
		"}",
	fs: "precision highp		float;" +
		"varying vec2		V_UV;" +
		"uniform sampler2D	U_TEX;" +
		"uniform float		U_R;" +
		"uniform float		U_N;" +
		"uniform float		U_STRENGTH;" +
		"uniform float		U_INNER;" +
		"uniform float		U_OUTER;" +
		"uniform float		U_CURVE;" +
		"uniform float		U_PIX;" +
		"uniform float		U_ASPECT;" +
		"" +
		"float" +
		"	LEN_N(vec2 VECTOR, float VALUE)" +
		"{" +
		"	VECTOR = max(VECTOR, 0.0);" +
		"	return (pow(pow(VECTOR.x, VALUE) + pow(VECTOR.y, VALUE), 1.0 / VALUE));" +
		"}" +
		"	" +
		"float" +
		"	SD_BOX(vec2 POSITION, float RADIUS, float VALUE)" +
		"{" +
		"	vec2	Q = abs(POSITION) - (1.0 - RADIUS);" +
		"	" +
		"	return (LEN_N(Q, VALUE) + min(max(Q.x, Q.y), 0.0) - RADIUS);" +
		"}" +
		"	" +
		"float" +
		"	HIT(vec2 DIR, float RADIUS, float VALUE)" +
		"{" +
		"	float	LO = 0.0;" +
		"	float	HI = 2.0;" +
		"	" +
		"	for (int _ = 0; _ < 22; _++)" +
		"	{" +
		"		float	MID = 0.5 * (LO + HI);" +
		"	" +
		"		if (SD_BOX(DIR * MID, RADIUS, VALUE) < 0.0)" +
		"			LO = MID;" +
		"		else" +
		"			HI = MID;" +
		"	}" +
		"	" +
		"	return (0.5 * (LO + HI));" +
		"}" +
		"	" +
		"void" +
		"	main()" +
		"{" +
		"	vec2	P = V_UV * 2.0 - 1.0;" +
		"	float	D = SD_BOX(P, U_R, U_N);" +
		"	float	T = length(P);" +
		"	vec2	DIR = T > 1E-4 ? P / T : vec2(1.0, 0.0);" +
		"	float	T_SQUARE = 1.0 / max(max(abs(DIR.x), abs(DIR.y)), 1E-4);" +
		"	float	T_ROUND = HIT(DIR, U_R, U_N);" +
		"	float	F = T / T_ROUND;" +
		"	float	K = T_SQUARE / T_ROUND;" +
		"	float	BAND = clamp((F - U_INNER) / max(U_OUTER - U_INNER, 1E-4), 0.0, 1.0);" +
		"	float	G = pow(BAND, U_CURVE);" +
		"	float	SCALE = mix(1.0, 1.0 + (K - 1.0) * G, U_STRENGTH);" +
		"	vec2	SRC = DIR * T * SCALE;" +
		"	vec2	ST = clamp(SRC * 0.5 + 0.5, 0.0, 1.0);" +
		"	" +
		"	if (U_ASPECT > 1.0)" +
		"		ST.x = 0.5 + (ST.x - 0.5) / U_ASPECT;" +
		"	else" +
		"		ST.y = 0.5 + (ST.y - 0.5) * U_ASPECT;" +
		"	" +
		"	vec4	C = texture2D(U_TEX, ST);" +
		"	" +
		"	C.a *= 1.0 - smoothstep(-U_PIX, U_PIX, D);" +
		"	gl_FragColor = vec4(C.rgb * C.a, C.a);" +
		"}",
	use: function(element)
	{
		if (typeof(element) === "string")
			element = document.getElementById(element);

		if (!element)
			return (1);

		const	cwr = corner_warp_radius;

		cwr.dom = element;
		cwr.gl =
			cwr.dom.getContext("webgl2", {premultipliedAlpha: true, antialias: false}) ||
			cwr.dom.getContext("webgl", {premultipliedAlpha: true, antialias: false});

		if (!cwr.gl)
			return (2);

		cwr.program = cwr.gl.createProgram();

		if (!cwr.program)
			return (3);

		cwr.gl.attachShader(cwr.program, cwr.shader(cwr.gl.VERTEX_SHADER, cwr.vs));
		cwr.gl.attachShader(cwr.program, cwr.shader(cwr.gl.FRAGMENT_SHADER, cwr.fs));
		cwr.gl.linkProgram(cwr.program);

		if (!cwr.gl.getProgramParameter(cwr.program, cwr.gl.LINK_STATUS))
			return (4);

		cwr.gl.useProgram(cwr.program);
		cwr.gl.bindBuffer(cwr.gl.ARRAY_BUFFER, cwr.gl.createBuffer());
		cwr.gl.bufferData(cwr.gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), cwr.gl.STATIC_DRAW);

		const	location = cwr.gl.getAttribLocation(cwr.program, "A_POSITION");

		cwr.gl.enableVertexAttribArray(location);
		cwr.gl.vertexAttribPointer(location, 2, cwr.gl.FLOAT, false, 0, 0);
		cwr.tex = cwr.gl.createTexture();
		cwr.gl.bindTexture(cwr.gl.TEXTURE_2D, cwr.tex);
		cwr.gl.pixelStorei(cwr.gl.UNPACK_FLIP_Y_WEBGL, true);
		cwr.gl.texParameteri(cwr.gl.TEXTURE_2D, cwr.gl.TEXTURE_WRAP_S, cwr.gl.CLAMP_TO_EDGE);
		cwr.gl.texParameteri(cwr.gl.TEXTURE_2D, cwr.gl.TEXTURE_WRAP_T, cwr.gl.CLAMP_TO_EDGE);
		cwr.gl.texParameteri(cwr.gl.TEXTURE_2D, cwr.gl.TEXTURE_MIN_FILTER, cwr.gl.LINEAR);
		cwr.gl.texParameteri(cwr.gl.TEXTURE_2D, cwr.gl.TEXTURE_MAG_FILTER, cwr.gl.LINEAR);
		cwr.gl.enable(cwr.gl.BLEND);
		cwr.gl.blendFunc(cwr.gl.ONE, cwr.gl.ONE_MINUS_SRC_ALPHA);
		return (0);
	},
	shader: function(type, source)
	{
		const	cwr = corner_warp_radius;
		const	__shader__ = cwr.gl.createShader(type);

		cwr.gl.shaderSource(__shader__, source);
		cwr.gl.compileShader(__shader__);

		if (!cwr.gl.getShaderParameter(__shader__, cwr.gl.COMPILE_STATUS))
			throw new Error(cwr.gl.getShaderInfoLog(__shader__));

		return (__shader__);
	},
	uniform: function(key)
	{
		const	cwr = corner_warp_radius;

		return (cwr.gl.getUniformLocation(cwr.program, key));
	},
	load: function(image)
	{
		const	cwr = corner_warp_radius;

		cwr.current_source = image;
		cwr.aspect = (image.width || image.videoWidth) / (image.height || image.videoHeight);
		cwr.gl.bindTexture(cwr.gl.TEXTURE_2D, cwr.tex);
		cwr.gl.texImage2D(cwr.gl.TEXTURE_2D, 0, cwr.gl.RGBA, cwr.gl.RGBA, cwr.gl.UNSIGNED_BYTE, image);
	},
	get: function(id)
	{
		return (document.getElementById(id));
	},
	detect_border_inset: function(src)
	{
		const	cwr = corner_warp_radius;

		if (!src)
			src = cwr.current_source;

		if (!src)
			return ({w: 0, inner: 1, thin: true});

		function
			diff(a, b)
		{
			return (
				Math.abs(a[0] - b[0]) +
				Math.abs(a[1] - b[1]) +
				Math.abs(a[2] - b[2])
			);
		}

		function
			walk(reference, _, max, read)
		{
			let	result = 0;

			while (result < max && diff(read(result), reference) < thresh)
				++result;

			return (result);
		}

		function
			solid(reference, run, read)
		{
			return (
				run >= 3 && run < limit &&
				diff(read(run - 1), reference) < thresh * 1.4 &&
				diff(read(run), reference) > thresh * 1.6
			);
		}

		function
			px(x, y)
		{
			const	j = ((y * n + x) << 2);

			return ([d[j], d[j + 1], d[j + 2]]);
		}

		const	n = 256;
		const	oc = document.createElement("canvas");

		oc.width = n;
		oc.height = n;

		const	ox = oc.getContext("2d", {willReadFrequently: true});
		const	iw = src.width || src.videoWidth;
		const	ih = src.height || src.videoHeight;
		const	s = Math.max(n / iw, n / ih);

		ox.drawImage(src, (n - iw * s) / 2, (n - ih * s) / 2, iw * s, ih * s);

		const	d = ox.getImageData(0, 0, n, n).data;
		const	thresh = 55;
		const	limit = n * 0.45;
		const	offsets = [0.5, 0.3, 0.7, 0.18, 0.82];
		const	runs = [];

		for (const offset of offsets)
		{
			const	p = Math.round(offset * (n - 1));
			let		r;

			r = walk(px(0, p), 1, limit, function(k){return (px(k, p));});

			if (solid(px(0, p), r, function(k){return (px(k, p));}))
				runs.push(r);

			r = walk(px(n - 1, p), 1, limit, function(k){return (px(n - 1 - k, p));});

			if (solid(px(n - 1, p), r, function(k){return (px(n - 1 - k, p));}))
				runs.push(r);

			r = walk(px(p, 0), 1, limit, function(k){return (px(p, k));});

			if (solid(px(p, 0), r, function(k){return (px(p, k));}))
				runs.push(r);

			r = walk(px(p, n - 1), 1, limit, function(k){return (px(p, n - 1 - k));});

			if (solid(px(p, n - 1), r, function(k){return (px(p, n - 1 - k));}))
				runs.push(r);
		}

		if (runs.length < 4)
			return ({w: 0, inner: 1, thin: true});

		runs.sort(function(a, b){return (a - b);});

		const	median = runs[runs.length >> 1];
		const	w = (2 * median) / n;

		return ({w: w, inner: 1 - w, thin: median < 3});
	},
	render: function(parameters)
	{
		const	cwr = corner_warp_radius;

		cwr.gl.viewport(0, 0, cwr.dom.width, cwr.dom.height);
		cwr.gl.clearColor(0, 0, 0, 0);
		cwr.gl.clear(cwr.gl.COLOR_BUFFER_BIT);
		cwr.gl.uniform1f(cwr.uniform("U_R"), parameters.r);
		cwr.gl.uniform1f(cwr.uniform("U_N"), parameters.n);
		cwr.gl.uniform1f(cwr.uniform("U_STRENGTH"), parameters.strength);
		cwr.gl.uniform1f(cwr.uniform("U_INNER"), parameters.inner);
		cwr.gl.uniform1f(cwr.uniform("U_OUTER"), parameters.outer);
		cwr.gl.uniform1f(cwr.uniform("U_CURVE"), parameters.curve);
		cwr.gl.uniform1f(cwr.uniform("U_PIX"), 2.0 / cwr.dom.height);
		cwr.gl.uniform1f(cwr.uniform("U_ASPECT"), cwr.aspect);
		cwr.gl.uniform1i(cwr.uniform("U_TEX"), 0);
		cwr.gl.drawArrays(cwr.gl.TRIANGLES, 0, 3);
	}
};
