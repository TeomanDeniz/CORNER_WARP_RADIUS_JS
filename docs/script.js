const	GRAPH = CORNER_WARP_RADIUS.GET("GRAPH");
const	GX = GRAPH.getContext("2d");

CORNER_WARP_RADIUS.USE("GL");

function
	PROFILE(F, INNER, OUTER, CURVE)
{
	const	BAND = Math.min(1, Math.max(0, (F - INNER) / Math.max(OUTER - INNER, 1E-4)));

	return (Math.pow(BAND, CURVE));
}

function
	DRAW_GRAPH(INNER, OUTER, CURVE)
{
	const	W = GRAPH.width;
	const	H = GRAPH.height;
	const	PAD = 6;

	GX.clearRect(0, 0, W, H);
	GX.strokeStyle = "#3D3D3A";
	GX.lineWidth = 1;
	GX.strokeRect(PAD, PAD, W - 2 * PAD, H - 2 * PAD);
	GX.fillStyle = "rgba(57, 199, 224, 0.12)";

	const	XO = PAD + OUTER * (W - 2 * PAD);

	GX.fillRect(XO, PAD, (W - PAD) - XO, H - 2 * PAD);
	GX.beginPath();

	for (let PX = 0; PX <= W - 2 * PAD; PX++)
	{
		const	F = PX / (W - 2 * PAD);
		const	G = PROFILE(F, INNER, OUTER, CURVE);
		const	X = PAD + PX;
		const	Y = (H - PAD) - G * (H - 2 * PAD);

		if (PX)
			GX.lineTo(X, Y);
		else
			GX.moveTo(X, Y);
	}

	GX.strokeStyle = "#39C7E0";
	GX.lineWidth = 2;
	GX.stroke();
	GX.fillStyle = "#8F8D87";
	GX.font = "9px ui-monospace, monospace";
	GX.fillText("centre", PAD + 2, H - PAD - 3);
	GX.textAlign = "right";
	GX.fillText("edge", W - PAD - 2, H - PAD - 3);
	GX.textAlign = "left";
}

function
	DRAW()
{
	const	CWR = CORNER_WARP_RADIUS;
	const	R = +CWR.GET("R").value;
	const	N = +CWR.GET("N").value;
	const	S = +CWR.GET("S").value;
	let		INNER = +CWR.GET("I").value;
	let		OUTER = +CWR.GET("O").value;
	let		CURVE = +CWR.GET("C").value;

	if (OUTER <= INNER)
		OUTER = INNER + 0.001;

	CWR.RENDER({R: R, N: N, STRENGTH: S, INNER: INNER, OUTER: OUTER, CURVE: CURVE});
	CWR.GET("VR").textContent = Math.round(R * 100) + "%";
	CWR.GET("VN").textContent = N.toFixed(1);
	CWR.GET("VS").textContent = Math.round(S * 100) + "%";
	CWR.GET("VI").textContent = Math.round(INNER * 100) + "%";
	CWR.GET("VO").textContent = Math.round(OUTER * 100) + "%";

	if (Math.abs(CURVE - 1) < 0.08)
		CWR.GET("VC").textContent = "linear";
	else if (CURVE < 1)
		CWR.GET("VC").textContent = "fast (concave)";
	else
		CWR.GET("VC").textContent = "slow (convex)";

	CWR.GET("CLIPPED").style.borderRadius = (R * 50) + "%";
	DRAW_GRAPH(INNER, OUTER, CURVE);
}

function
	USE_IMAGE(SOURCE)
{
	const	CWR = CORNER_WARP_RADIUS;

	CWR.LOAD(SOURCE);

	if (SOURCE.toDataURL)
		CWR.GET("CLIPPED").src = SOURCE.toDataURL();
	else
		CWR.GET("CLIPPED").src = SOURCE.src;

	DRAW();
}

function
	SAMPLE(KIND)
{
	const	CANVAS = document.createElement("canvas");

	CANVAS.width = 900;
	CANVAS.height = 900;

	const	X = CANVAS.getContext("2d");

	if (KIND === 0)
	{
		X.fillStyle = "#1D1C1B";
		X.fillRect(0, 0, 900, 900);
		X.strokeStyle = "#C2543F";
		X.lineWidth = 26;
		X.strokeRect(13, 13, 874, 874);
		X.strokeStyle = "#5A4A7A";
		X.lineWidth = 8;
		X.strokeRect(60, 60, 780, 780);
		X.fillStyle = "#C2543F";
		X.font = "700 92px ui-monospace, monospace";
		X.textAlign = "center";
		X.fillText("CORNERS", 450, 430);
		X.font = "600 40px ui-monospace, monospace";
		X.fillStyle = "#8A7FB0";
		X.fillText("KEEP THE FRAME", 450, 500);
		['↖', '↗', '↙', '↘'].forEach(
			function (G, INDEX)
			{
				X.font = "700 56px serif";
				X.fillStyle = "#E8E6E1";

				if (INDEX % 2)
				{
					if (INDEX < 2)
						X.fillText(G, 820, 100);
					else
						X.fillText(G, 820, 850);
				}
				else
				{
					if (INDEX < 2)
						X.fillText(G, 80, 100);
					else
						X.fillText(G, 80, 850);
				}
			}
		);
	}
	else if (KIND === 1)
	{
		X.fillStyle = "#101A1E";
		X.fillRect(0, 0, 900, 900);
		X.strokeStyle = "#39C7E0";
		X.lineWidth = 2;

		for (let INDEX = 0; INDEX <= 18; INDEX++)
		{
			const	P = INDEX * 50;

			X.beginPath();
			X.moveTo(P, 0);
			X.lineTo(P, 900);
			X.moveTo(0, P);
			X.lineTo(900, P);
			X.stroke();
		}

		X.strokeStyle = "#FFF";
		X.lineWidth = 10;
		X.strokeRect(5, 5, 890, 890);
	}
	else
	{
		const	G = X.createLinearGradient(0, 0, 900, 900);

		G.addColorStop(0.0, "#7FC6E8");
		G.addColorStop(0.5, "#E9DFD0");
		G.addColorStop(1.0, "#C98A6A");
		X.fillStyle = G;
		X.fillRect(0, 0, 900, 900);

		for (let _ = 0; _ < 300; _++)
		{
			X.fillStyle = "rgba(255, 255, 255, " + (Math.random() * 0.35) + ")";
			X.beginPath();
			X.arc(Math.random() * 900, Math.random() * 900, Math.random() * 6, 0, 7);
			X.fill();
		}

		X.fillStyle = "#FFF";
		X.fillRect(0, 0, 900, 52);
		X.fillRect(0, 848, 900, 52);
		X.fillRect(0, 0, 52, 900);
		X.fillRect(848, 0, 52, 900);
	}

	return (CANVAS);
}

function
	AUTO_FIT()
{
	const	RESOURCE = CORNER_WARP_RADIUS.DETECT_BORDER_INSET();
	const	STATUS = CORNER_WARP_RADIUS.GET("status");

	if (!RESOURCE || RESOURCE.THIN)
	{
		CORNER_WARP_RADIUS.GET("I").value = 0.85;
		CORNER_WARP_RADIUS.GET("O").value = 0.85;
		CORNER_WARP_RADIUS.GET("C").value = 0.25;
		STATUS.className = "status warn";
		STATUS.textContent = "No clear frame found - using a default ~15% band. Nudge Band inner edge to taste.";
	}
	else
	{
		const	INNER = Math.min(0.985, Math.max(0.02, RESOURCE.INNER));

		CORNER_WARP_RADIUS.GET("I").value = INNER.toFixed(3);
		CORNER_WARP_RADIUS.GET("O").value = INNER.toFixed(3);
		CORNER_WARP_RADIUS.GET("C").value = 0.25;
		STATUS.className = "status";
		STATUS.textContent =
			"Frame ≈ " + Math.round(RESOURCE.W * 100) + "% thick → band set to " +
			Math.round(INNER * 100) + "%. Warp is confined to that ring.";
	}

	DRAW();
}

['R', 'N', 'S', 'I', 'O', 'C'].forEach(
	function (ID)
	{
		return (CORNER_WARP_RADIUS.GET(ID).addEventListener("input", DRAW));
	}
);

document.querySelectorAll("[data-img]").forEach(
	function (B)
	{
		return (B.addEventListener("click", () => USE_IMAGE(SAMPLE(+B.dataset.img))));
	}
);

CORNER_WARP_RADIUS.GET("FILE").addEventListener("change", EVENT => {
	const	FILE = EVENT.target.files[0];

	if (!FILE)
		return ;

	const	THE_IMAGE = new Image();

	THE_IMAGE.onload = (
		function ()
		{
			USE_IMAGE(THE_IMAGE);
		}
	);
	THE_IMAGE.src = URL.createObjectURL(FILE);
});

CORNER_WARP_RADIUS.GET("AUTO_FIT").addEventListener("click", AUTO_FIT);

USE_IMAGE(SAMPLE(0));
