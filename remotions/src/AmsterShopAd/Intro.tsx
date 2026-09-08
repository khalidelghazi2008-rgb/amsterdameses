import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand, TAGLINE } from "./theme";
import { bodyFont } from "./fonts";
import { fade } from "./useFade";
import { Logotype } from "./Logotype";
import { IconShoe, IconPerfume } from "./icons";

export const Intro: React.FC<{ duration: number }> = ({ duration }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const logoSpring = spring({ frame, fps, config: { damping: 14, mass: 0.7 } });
	const logoScale = 0.85 + logoSpring * 0.15;
	const opacity = fade(frame, duration);

	const taglineOpacity = spring({
		frame: frame - 14,
		fps,
		config: { damping: 200 },
	});

	// The two icons orbit gently around the wordmark.
	const orbit = frame / fps;

	return (
		<AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center" }}>
			<div
				style={{
					position: "relative",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 28,
				}}
			>
				<div
					style={{
						position: "absolute",
						top: -70,
						left: -120,
						transform: `translateY(${Math.sin(orbit * 1.4) * 10}px) rotate(${Math.sin(orbit) * 8}deg)`,
						color: brand.blue,
						opacity: 0.85,
					}}
				>
					<IconShoe size={46} />
				</div>
				<div
					style={{
						position: "absolute",
						top: -40,
						right: -130,
						transform: `translateY(${Math.cos(orbit * 1.2) * 10}px) rotate(${Math.cos(orbit) * -8}deg)`,
						color: brand.white,
						opacity: 0.7,
					}}
				>
					<IconPerfume size={40} />
				</div>

				<div style={{ transform: `scale(${logoScale})` }}>
					<Logotype />
				</div>

				<div
					style={{
						fontFamily: bodyFont,
						fontWeight: 700,
						fontSize: 30,
						color: brand.fog,
						opacity: taglineOpacity,
						letterSpacing: 0.5,
						textAlign: "center",
					}}
				>
					{TAGLINE}
				</div>
			</div>
		</AbsoluteFill>
	);
};
