/******************************************************************************\
# JS - script                                    #       Maximum Tension       #
################################################################################
#                                                #      -__            __-     #
# Teoman Deniz                                   #  :    :!1!-_    _-!1!:    : #
# maximum-tension.com                            #  ::                      :: #
#                                                #  :!:    : :: : :  :  ::::!: #
# +.....................++.....................+ #   :!:: :!:!1:!:!::1:::!!!:  #
# : C - Maximum Tension :: Create - 2026/07/12 : #   ::!::!!1001010!:!11!!::   #
# :---------------------::---------------------: #   :!1!!11000000000011!!:    #
# : License - MIT       :: Update - 2026/09/18 : #    ::::!!!1!!1!!!1!!!::     #
# +.....................++.....................+ #       ::::!::!:::!::::      #
\******************************************************************************/

const	graph = corner_warp_radius.get("graph");
const	gx = graph.getContext("2d");

corner_warp_radius.use("GL");

function
	profile(f, inner, outer, curve)
{
	const	band = Math.min(1, Math.max(0, (f - inner) / Math.max(outer - inner, 1E-4)));

	return (Math.pow(band, curve));
}

function
	draw_graph(inner, outer, curve)
{
	const	w = graph.width;
	const	h = graph.height;
	const	pad = 6;

	gx.clearRect(0, 0, w, h);
	gx.strokeStyle = "#3D3D3A";
	gx.lineWidth = 1;
	gx.strokeRect(pad, pad, w - 2 * pad, h - 2 * pad);
	gx.fillStyle = "rgba(57, 199, 224, 0.12)";

	const	xo = pad + outer * (w - 2 * pad);

	gx.fillRect(xo, pad, (w - pad) - xo, h - 2 * pad);
	gx.beginPath();

	for (let px = 0; px <= w - 2 * pad; px++)
	{
		const	f = px / (w - 2 * pad);
		const	g = profile(f, inner, outer, curve);
		const	x = pad + px;
		const	y = (h - pad) - g * (h - 2 * pad);

		if (px)
			gx.lineTo(x, y);
		else
			gx.moveTo(x, y);
	}

	gx.strokeStyle = "#39C7E0";
	gx.lineWidth = 2;
	gx.stroke();
	gx.fillStyle = "#8F8D87";
	gx.font = "9px ui-monospace, monospace";
	gx.fillText("centre", pad + 2, h - pad - 3);
	gx.textAlign = "right";
	gx.fillText("edge", w - pad - 2, h - pad - 3);
	gx.textAlign = "left";
}

function
	draw()
{
	const	cwr = corner_warp_radius;
	const	r = +cwr.get("r").value;
	const	n = +cwr.get("n").value;
	const	s = +cwr.get("s").value;
	let		inner = +cwr.get("i").value;
	let		outer = +cwr.get("o").value;
	let		curve = +cwr.get("c").value;

	if (outer <= inner)
		outer = inner + 0.001;

	cwr.render({r: r, n: n, strength: s, inner: inner, outer: outer, curve: curve});
	cwr.get("vr").textContent = Math.round(r * 100) + "%";
	cwr.get("vn").textContent = n.toFixed(1);
	cwr.get("vs").textContent = Math.round(s * 100) + "%";
	cwr.get("vi").textContent = Math.round(inner * 100) + "%";
	cwr.get("vo").textContent = Math.round(outer * 100) + "%";

	if (Math.abs(curve - 1) < 0.08)
		cwr.get("vc").textContent = "linear";
	else if (curve < 1)
		cwr.get("vc").textContent = "fast (concave)";
	else
		cwr.get("vc").textContent = "slow (convex)";

	cwr.get("clipped").style.borderRadius = (r * 50) + "%";
	draw_graph(inner, outer, curve);
}

function
	use_image(source)
{
	const	cwr = corner_warp_radius;

	cwr.load(source);

	if (source.toDataURL)
		cwr.get("clipped").src = source.toDataURL();
	else
		cwr.get("clipped").src = source.src;

	draw();
}

function
	sample(kind)
{
	const	canvas = document.createElement("canvas");

	canvas.width = 900;
	canvas.height = 900;

	const	x = canvas.getContext("2d");

	if (kind === 0)
	{
		x.fillStyle = "#1D1C1B";
		x.fillRect(0, 0, 900, 900);
		x.strokeStyle = "#C2543F";
		x.lineWidth = 26;
		x.strokeRect(13, 13, 874, 874);
		x.strokeStyle = "#5A4A7A";
		x.lineWidth = 8;
		x.strokeRect(60, 60, 780, 780);
		x.fillStyle = "#C2543F";
		x.font = "700 92px ui-monospace, monospace";
		x.textAlign = "center";
		x.fillText("CORNERS", 450, 430);
		x.font = "600 40px ui-monospace, monospace";
		x.fillStyle = "#8A7FB0";
		x.fillText("KEEP THE FRAME", 450, 500);
		['↖', '↗', '↙', '↘'].forEach(
			function(g, index)
			{
				x.font = "700 56px serif";
				x.fillStyle = "#E8E6E1";

				if (index % 2)
				{
					if (index < 2)
						x.fillText(g, 820, 100);
					else
						x.fillText(g, 820, 850);
				}
				else
				{
					if (index < 2)
						x.fillText(g, 80, 100);
					else
						x.fillText(g, 80, 850);
				}
			}
		);
	}
	else if (kind === 1)
	{
		x.fillStyle = "#101A1E";
		x.fillRect(0, 0, 900, 900);
		x.strokeStyle = "#39C7E0";
		x.lineWidth = 2;

		for (let index = 0; index <= 18; index++)
		{
			const	p = index * 50;

			x.beginPath();
			x.moveTo(p, 0);
			x.lineTo(p, 900);
			x.moveTo(0, p);
			x.lineTo(900, p);
			x.stroke();
		}

		x.strokeStyle = "#FFF";
		x.lineWidth = 10;
		x.strokeRect(5, 5, 890, 890);
	}
	else
	{
		const	g = x.createLinearGradient(0, 0, 900, 900);

		g.addColorStop(0.0, "#7FC6E8");
		g.addColorStop(0.5, "#E9DFD0");
		g.addColorStop(1.0, "#C98A6A");
		x.fillStyle = g;
		x.fillRect(0, 0, 900, 900);

		for (let _ = 0; _ < 300; _++)
		{
			x.fillStyle = "rgba(255, 255, 255, " + (Math.random() * 0.35) + ")";
			x.beginPath();
			x.arc(Math.random() * 900, Math.random() * 900, Math.random() * 6, 0, 7);
			x.fill();
		}

		x.fillStyle = "#FFF";
		x.fillRect(0, 0, 900, 52);
		x.fillRect(0, 848, 900, 52);
		x.fillRect(0, 0, 52, 900);
		x.fillRect(848, 0, 52, 900);
	}

	return (canvas);
}

function
	auto_fit()
{
	const	resource = corner_warp_radius.detect_border_inset();
	const	status = corner_warp_radius.get("status");

	if (!resource || resource.thin)
	{
		corner_warp_radius.get("i").value = 0.85;
		corner_warp_radius.get("o").value = 0.85;
		corner_warp_radius.get("c").value = 0.25;
		status.className = "status warn";
		status.textContent = "No clear frame found - using a default ~15% band. Nudge Band inner edge to taste.";
	}
	else
	{
		const	inner = Math.min(0.985, Math.max(0.02, resource.inner));

		corner_warp_radius.get("i").value = inner.toFixed(3);
		corner_warp_radius.get("o").value = inner.toFixed(3);
		corner_warp_radius.get("c").value = 0.25;
		status.className = "status";
		status.textContent =
			"Frame ≈ " + Math.round(resource.w * 100) + "% thick → band set to " +
			Math.round(inner * 100) + "%. Warp is confined to that ring.";
	}

	draw();
}

['r', 'n', 's', 'i', 'o', 'c'].forEach(
	function(id)
	{
		return (corner_warp_radius.get(id).addEventListener("input", draw));
	}
);

document.querySelectorAll("[data-img]").forEach(
	function(b)
	{
		return (
			b.addEventListener(
				"click",
				function()
				{
					return (use_image(sample(+b.dataset.img)));
				}
			)
		);
	}
);

corner_warp_radius.get("file").addEventListener(
	"change",
	function(event)
	{
		const	file = event.target.files[0];

		if (!file)
			return ;

		const	the_image = new Image();

		the_image.onload = (
			function ()
			{
				use_image(the_image);
			}
		);
		the_image.src = URL.createObjectURL(file);
	}
);

corner_warp_radius.get("auto_fit").addEventListener("click", auto_fit);

use_image(sample(0));
