import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "./theme";
import { bodyFont, headingFont } from "./fonts";
import { fade } from "./useFade";
import { IconTruck, IconLock, IconCheckmark } from "./icons";

const items = [
	{ Icon: IconTruck, title: "Envío rápido", text: "Gratis, en 24/48h" },
	{ Icon: IconLock, title: "Pago 100% seguro", text: "Protegido de principio a fin" },
	{ Icon: IconCheckmark, title: "Devoluciones fáciles", text: "30 días sin complicaciones" },
];

const Row: React.FC<{
	Icon: typeof IconTruck;
	title: string;
	text: string;
	delay: number;
}> = ({ Icon, title, text, delay }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const enter = spring({ frame: frame - delay, fps, config: { damping: 15, mass: 0.7 } });

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 22,
				opacity: enter,
				transform: `translateX(${(1 - enter) * -40}px)`,
			}}
		>
			<div
				style={{
					width: 76,
					height: 76,
					borderRadius: 22,
					background: `${brand.blue}22`,
					border: `1.5px solid ${brand.blue}88`,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
					color: brand.blue,
				}}
			>
				<Icon size={34} />
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
				<span
					style={{
						fontFamily: headingFont,
						fontSize: 30,
						color: brand.white,
						letterSpacing: -0.3,
					}}
				>
					{title}
				</span>
				<span
					style={{
						fontFamily: bodyFont,
						fontWeight: 500,
						fontSize: 19,
						color: brand.fog,
						opacity: 0.75,
					}}
				>
					{text}
				</span>
			</div>
		</div>
	);
};

export const TrustBadges: React.FC<{ duration: number }> = ({ duration }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const opacity = fade(frame, duration);
	const headingEnter = spring({ frame, fps, config: { damping: 200 } });

	return (
		<AbsoluteFill
			style={{
				opacity,
				alignItems: "center",
				justifyContent: "center",
				padding: "0 72px",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 46, width: "100%" }}>
				<div
					style={{
						fontFamily: headingFont,
						fontSize: 40,
						color: brand.white,
						textAlign: "center",
						opacity: headingEnter,
					}}
				>
					Comprar en AmsterShop es fácil
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
					{items.map((item, i) => (
						<Row key={item.title} {...item} delay={14 + i * 16} />
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};
