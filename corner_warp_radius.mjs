/******************************************************************************\
# corner_warp_radius                             #       Maximum Tension       #
################################################################################
#                                                #      -__            __-     #
# Teoman Deniz                                   #  :    :!1!-_    _-!1!:    : #
# maximum-tension.com                            #  ::                      :: #
#                                                #  :!:    : :: : :  :  ::::!: #
# +.....................++.....................+ #   :!:: :!:!1:!:!::1:::!!!:  #
# : C - Maximum Tension :: Create - 2026/09/18 : #   ::!::!!1001010!:!11!!::   #
# :---------------------::---------------------: #   :!1!!11000000000011!!:    #
# : License - MIT       :: Update - 2026/09/18 : #    ::::!!!1!!1!!!1!!!::     #
# +.....................++.....................+ #       ::::!::!:::!::::      #
\******************************************************************************/

/*
** ES module entry.
**
**   import corner_warp_radius from "./corner_warp_radius.mjs";
**   import {use, load, render} from "./corner_warp_radius.mjs";
**
** Keep `corner_warp_radius.js` next to this file.
*/

import "./corner_warp_radius.js";

const	corner_warp_radius = globalThis.corner_warp_radius;

export const	use = corner_warp_radius.use;
export const	load = corner_warp_radius.load;
export const	render = corner_warp_radius.render;
export const	detect_border_inset = corner_warp_radius.detect_border_inset;
export const	shader = corner_warp_radius.shader;
export const	uniform = corner_warp_radius.uniform;
export const	get = corner_warp_radius.get;
export default	corner_warp_radius;
