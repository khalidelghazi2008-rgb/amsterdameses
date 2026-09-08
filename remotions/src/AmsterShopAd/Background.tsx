import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "./theme";

/**
 * Full-video backdrop: dark navy → black base with two slowly drifting
 * blue glows, plus a faint diagonal stripe for texture. Sits behind every
 * scene so transitions read as one continuous shot rather than cuts
 * between separate backgrounds.
 */
export const Background: React.FC = () => {
	const frame = useCurrentFrame();

	const glow1X = 20 + Math.sin(frame / 90) * 18;
	const glow1Y = 15 + Math.cos(frame / 130) * 10;
	const glow2X = 80 + Math.cos(frame / 110) * 14;
	const glow2Y = 85 + Math.sin(frame / 100) * 10;

	return (
		<AbsoluteFill style={{ backgroundColor: brand.navy }}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(closest-side, ${brand.blue}55, transparent 70%)`,
					transform: `translate(${glow1X - 50}%, ${glow1Y - 50}%)`,
					opacity: 0.9,
				}}
			/>
			<AbsoluteFill
				style={{
					background: `radial-gradient(closest-side, ${brand.blue}40, transparent 70%)`,
					transform: `translate(${glow2X - 50}%, ${glow2Y - 50}%)`,
					opacity: 0.8,
				}}
			/>
			<AbsoluteFill
				style={{
					background: `linear-gradient(180deg, transparent 0%, ${brand.black}CC 100%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage: `repeating-linear-gradient(115deg, ${brand.white}05 0px, ${brand.white}05 2px, transparent 2px, transparent 64px)`,
				}}
			/>
		</AbsoluteFill>
	);
};
