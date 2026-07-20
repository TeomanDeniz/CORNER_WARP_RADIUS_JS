const	CORNER_WARP_RADIUS = {
	DOM: null,
	GL: null,
	PROGRAM: null,
	TEX: null,
	ASPECT: 1,
	CURRENT_SOURCE: null,
	VS:
	`
		attribute vec2	A_POSITION;
		varying vec2	V_UV;
		void
			main()
		{
			V_UV = A_POSITION * 0.5 + 0.5; gl_Position = vec4(A_POSITION, 0.0, 1.0);
		}
	`,
	FS:
	`
		precision highp		float;
		varying vec2		V_UV;
		uniform sampler2D	U_TEX;
		uniform float		U_R;
		uniform float		U_N;
		uniform float		U_STRENGTH;
		uniform float		U_INNER;
		uniform float		U_OUTER;
		uniform float		U_CURVE;
		uniform float		U_PIX;
		uniform float		U_ASPECT;

		float
			LEN_N(vec2 VECTOR, float VALUE)
		{
			VECTOR = max(VECTOR, 0.0);
			return (pow(pow(VECTOR.x, VALUE) + pow(VECTOR.y, VALUE), 1.0 / VALUE));
		}

		float
			SD_BOX(vec2 POSITION, float RADIUS, float VALUE)
		{
			vec2	Q = abs(POSITION) - (1.0 - RADIUS);

			return (LEN_N(Q, VALUE) + min(max(Q.x, Q.y), 0.0) - RADIUS);
		}

		float
			HIT(vec2 DIR, float RADIUS, float VALUE)
		{
			float	LO = 0.0;
			float	HI = 2.0;

			for (int _ = 0; _ < 22; _++)
			{
				float	MID = 0.5 * (LO + HI);

				if (SD_BOX(DIR * MID, RADIUS, VALUE) < 0.0)
					LO = MID;
				else
					HI = MID;
			}

			return (0.5 * (LO + HI));
		}

		void
			main()
		{
			vec2	P = V_UV * 2.0 - 1.0;
			float	D = SD_BOX(P, U_R, U_N);
			float	T = length(P);
			vec2	DIR = T > 1E-4 ? P / T : vec2(1.0, 0.0);
			float	T_SQUARE = 1.0 / max(max(abs(DIR.x), abs(DIR.y)), 1E-4);
			float	T_ROUND = HIT(DIR, U_R, U_N);
			float	F = T / T_ROUND;
			float	K = T_SQUARE / T_ROUND;
			float	BAND = clamp((F - U_INNER) / max(U_OUTER - U_INNER, 1E-4), 0.0, 1.0);
			float	G = pow(BAND, U_CURVE);
			float	SCALE = mix(1.0, 1.0 + (K - 1.0) * G, U_STRENGTH);
			vec2	SRC = DIR * T * SCALE;
			vec2	ST = clamp(SRC * 0.5 + 0.5, 0.0, 1.0);

			if (U_ASPECT > 1.0)
				ST.x = 0.5 + (ST.x - 0.5) / U_ASPECT;
			else
				ST.y = 0.5 + (ST.y - 0.5) * U_ASPECT;

			vec4	C = texture2D(U_TEX, ST);

			C.a *= 1.0 - smoothstep(-U_PIX, U_PIX, D);
			gl_FragColor = vec4(C.rgb * C.a, C.a);
		}
	`,
	USE: function (ELEMENT)
	{
		if (typeof(ELEMENT) === "string")
			ELEMENT = document.getElementById(ELEMENT);

		if (!ELEMENT)
			return (1);

		const	CWR = CORNER_WARP_RADIUS;

		CWR.DOM = ELEMENT;
		CWR.GL =
			CWR.DOM.getContext("webgl2", {premultipliedAlpha: true, antialias: false}) ||
			CWR.DOM.getContext("webgl", {premultipliedAlpha: true, antialias: false});

		if (!CWR.GL)
			return (2);

		CWR.PROGRAM = CWR.GL.createProgram();

		if (!CWR.PROGRAM)
			return (3);

		CWR.GL.attachShader(CWR.PROGRAM, CWR.SHADER(CWR.GL.VERTEX_SHADER, CWR.VS));
		CWR.GL.attachShader(CWR.PROGRAM, CWR.SHADER(CWR.GL.FRAGMENT_SHADER, CWR.FS));
		CWR.GL.linkProgram(CWR.PROGRAM);

		if (!CWR.GL.getProgramParameter(CWR.PROGRAM, CWR.GL.LINK_STATUS))
			return (4);

		CWR.GL.useProgram(CWR.PROGRAM);
		CWR.GL.bindBuffer(CWR.GL.ARRAY_BUFFER, CWR.GL.createBuffer());
		CWR.GL.bufferData(CWR.GL.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), CWR.GL.STATIC_DRAW);

		const	LOCATION = CWR.GL.getAttribLocation(CWR.PROGRAM, "A_POSITION");

		CWR.GL.enableVertexAttribArray(LOCATION);
		CWR.GL.vertexAttribPointer(LOCATION, 2, CWR.GL.FLOAT, false, 0, 0);
		CWR.TEX = CWR.GL.createTexture();
		CWR.GL.bindTexture(CWR.GL.TEXTURE_2D, CWR.TEX);
		CWR.GL.pixelStorei(CWR.GL.UNPACK_FLIP_Y_WEBGL, true);
		CWR.GL.texParameteri(CWR.GL.TEXTURE_2D, CWR.GL.TEXTURE_WRAP_S, CWR.GL.CLAMP_TO_EDGE);
		CWR.GL.texParameteri(CWR.GL.TEXTURE_2D, CWR.GL.TEXTURE_WRAP_T, CWR.GL.CLAMP_TO_EDGE);
		CWR.GL.texParameteri(CWR.GL.TEXTURE_2D, CWR.GL.TEXTURE_MIN_FILTER, CWR.GL.LINEAR);
		CWR.GL.texParameteri(CWR.GL.TEXTURE_2D, CWR.GL.TEXTURE_MAG_FILTER, CWR.GL.LINEAR);
		CWR.GL.enable(CWR.GL.BLEND);
		CWR.GL.blendFunc(CWR.GL.ONE, CWR.GL.ONE_MINUS_SRC_ALPHA);
		return (0);
	},
	SHADER: function (TYPE, SOURCE)
	{
		const	CWR = CORNER_WARP_RADIUS;
		const	__SHADER__ = CWR.GL.createShader(TYPE);

		CWR.GL.shaderSource(__SHADER__, SOURCE);
		CWR.GL.compileShader(__SHADER__);

		if (!CWR.GL.getShaderParameter(__SHADER__, CWR.GL.COMPILE_STATUS))
			throw new Error(CWR.GL.getShaderInfoLog(__SHADER__));

		return (__SHADER__);
	},
	UNIFORM: function (KEY)
	{
		const	CWR = CORNER_WARP_RADIUS;

		return (CWR.GL.getUniformLocation(CWR.PROGRAM, KEY));
	},
	LOAD: function (IMAGE)
	{
		const	CWR = CORNER_WARP_RADIUS;

		CWR.CURRENT_SOURCE = IMAGE;
		CWR.ASPECT = (IMAGE.width || IMAGE.videoWidth) / (IMAGE.height || IMAGE.videoHeight);
		CWR.GL.bindTexture(CWR.GL.TEXTURE_2D, CWR.TEX);
		CWR.GL.texImage2D(CWR.GL.TEXTURE_2D, 0, CWR.GL.RGBA, CWR.GL.RGBA, CWR.GL.UNSIGNED_BYTE, IMAGE);
	},
	GET: function (ID)
	{
		return (document.getElementById(ID));
	},
	DETECT_BORDER_INSET: function (SRC)
	{
		const	CWR = CORNER_WARP_RADIUS;

		if (!SRC)
			SRC = CWR.CURRENT_SOURCE;

		if (!SRC)
			return ({W: 0, INNER: 1, THIN: true});

		function
			DIFF(A, B)
		{
			return (
				Math.abs(A[0] - B[0]) +
				Math.abs(A[1] - B[1]) +
				Math.abs(A[2] - B[2])
			);
		}

		function
			WALK(REFERENCE, _, MAX, READ)
		{
			let	RESULT = 0;

			while (RESULT < MAX && DIFF(READ(RESULT), REFERENCE) < THRESH)
				++RESULT;

			return (RESULT);
		}

		function
			SOLID(REFERENCE, RUN, READ)
		{
			return (
				RUN >= 3 && RUN < LIMIT &&
				DIFF(READ(RUN - 1), REFERENCE) < THRESH * 1.4 &&
				DIFF(READ(RUN), REFERENCE) > THRESH * 1.6
			);
		}

		function
			PX(X, Y)
		{
			const	J = ((Y * N + X) << 2);

			return ([D[J], D[J + 1], D[J + 2]]);
		}

		const	N = 256;
		const	OC = document.createElement("canvas");

		OC.width = N;
		OC.height = N;

		const	OX = OC.getContext("2d", {willReadFrequently: true});
		const	IW = SRC.width || SRC.videoWidth;
		const	IH = SRC.height || SRC.videoHeight;
		const	S = Math.max(N / IW, N / IH);

		OX.drawImage(SRC, (N - IW * S) / 2, (N - IH * S) / 2, IW * S, IH * S);

		const	D = OX.getImageData(0, 0, N, N).data;
		const	THRESH = 55;
		const	LIMIT = N * 0.45;
		const	OFFSETS = [0.5, 0.3, 0.7, 0.18, 0.82];
		const	RUNS = [];

		for (const OFFSET of OFFSETS)
		{
			const	P = Math.round(OFFSET * (N - 1));
			let		R;

			R = WALK(PX(0, P), 1, LIMIT, function (K) {return (PX(K, P));});
			if (SOLID(PX(0, P), R, function (K) {return (PX(K, P));}))
				RUNS.push(R);

			R = WALK(PX(N - 1, P), 1, LIMIT, function (K) {return (PX(N - 1 - K, P));});
			if (SOLID(PX(N - 1, P), R, function (K) {return (PX(N - 1 - K, P));}))
				RUNS.push(R);

			R = WALK(PX(P, 0), 1, LIMIT, function (K) {return (PX(P, K));});
			if (SOLID(PX(P, 0), R, function (K) {return (PX(P, K));}))
				RUNS.push(R);

			R = WALK(PX(P, N - 1), 1, LIMIT, function (K) {return (PX(P, N - 1 - K));});
			if (SOLID(PX(P, N - 1), R, function (K) {return (PX(P, N - 1 - K));}))
				RUNS.push(R);
		}

		if (RUNS.length < 4)
			return ({W: 0, INNER: 1, THIN: true});

		RUNS.sort(function (A, B) {return (A - B);});

		const	MEDIAN = RUNS[RUNS.length >> 1];
		const	W = (2 * MEDIAN) / N;

		return ({W: W, INNER: 1 - W, THIN: MEDIAN < 3});
	},
	RENDER: function (PARAMETERS)
	{
		const	CWR = CORNER_WARP_RADIUS;

		CWR.GL.viewport(0, 0, CWR.DOM.width, CWR.DOM.height);
		CWR.GL.clearColor(0, 0, 0, 0);
		CWR.GL.clear(CWR.GL.COLOR_BUFFER_BIT);
		CWR.GL.uniform1f(CWR.UNIFORM("U_R"), PARAMETERS.R);
		CWR.GL.uniform1f(CWR.UNIFORM("U_N"), PARAMETERS.N);
		CWR.GL.uniform1f(CWR.UNIFORM("U_STRENGTH"), PARAMETERS.STRENGTH);
		CWR.GL.uniform1f(CWR.UNIFORM("U_INNER"), PARAMETERS.INNER);
		CWR.GL.uniform1f(CWR.UNIFORM("U_OUTER"), PARAMETERS.OUTER);
		CWR.GL.uniform1f(CWR.UNIFORM("U_CURVE"), PARAMETERS.CURVE);
		CWR.GL.uniform1f(CWR.UNIFORM("U_PIX"), 2.0 / CWR.DOM.height);
		CWR.GL.uniform1f(CWR.UNIFORM("U_ASPECT"), CWR.ASPECT);
		CWR.GL.uniform1i(CWR.UNIFORM("U_TEX"), 0);
		CWR.GL.drawArrays(CWR.GL.TRIANGLES, 0, 3);
	}
};
