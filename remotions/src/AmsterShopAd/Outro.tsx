import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "./theme";
import { bodyFont } from "./fonts";
import { fade } from "./useFade";
import { Logotype } from "./Logotype";

export const Outro: React.FC<{ duration: number }> = ({ duration }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const opacity = fade(frame, duration, 14);

	const logoEnter = spring({ frame, fps, config: { damping: 200 } });
	const buttonEnter = spring({ frame: frame - 10, fps, config: { damping: 12, mass: 0.7 } });
	const pulse = 1 + Math.sin(frame / 8) * 0.02;

	return (
		<AbsoluteFill
			style={{
				opacity,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 36,
				}}
			>
				<div style={{ transform: `scale(${0.9 + logoEnter * 0.1})`, opacity: logoEnter }}>
					<Logotype scale={0.75} />
				</div>

				<div
					style={{
						fontFamily: bodyFont,
						fontWeight: 700,
						fontSize: 26,
						color: brand.white,
						opacity: buttonEnter,
					}}
				>
					Únete al club
				</div>

				<div
					style={{
						fontFamily: bodyFont,
						fontWeight: 900,
						fontSize: 32,
						color: brand.white,
						background: brand.blue,
						borderRadius: 999,
						padding: "22px 56px",
						opacity: buttonEnter,
						transform: `translateY(${(1 - buttonEnter) * 20}px) scale(${pulse})`,
						boxShadow: `0 10px 40px ${brand.blue}66`,
					}}
				>
					Comprar ahora
				</div>
			</div>
		</AbsoluteFill>
	);
};
