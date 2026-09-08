import { interpolate } from "remotion";

/**
 * Crossfade helper: fades a scene in for `edge` frames, holds, then fades
 * out for the last `edge` frames of `sceneDuration`. Used together with
 * slightly overlapping <Sequence> ranges in index.tsx to get soft
 * transitions between scenes instead of hard cuts.
 */
export const fade = (
	frame: number,
	sceneDuration: number,
	edge: number = 18,
) => {
	const fadeIn = interpolate(frame, [0, edge], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const fadeOut = interpolate(
		frame,
		[sceneDuration - edge, sceneDuration],
		[1, 0],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);
	return Math.min(fadeIn, fadeOut);
};
