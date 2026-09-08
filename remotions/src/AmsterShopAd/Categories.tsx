import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "./theme";
import { bodyFont, headingFont } from "./fonts";
import { fade } from "./useFade";
import { IconShoe, IconPerfume } from "./icons";
import { ProductPlaceholder } from "./ProductPlaceholder";

const Card: React.FC<{
	icon: React.ReactNode;
	title: string;
	subtitle: string;
	delay: number;
	fromLeft: boolean;
}> = ({ icon, title, subtitle, delay, fromLeft }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const enter = spring({
		frame: frame - delay,
		fps,
		config: { damping: 16, mass: 0.8 },
	});
	const x = (1 - enter) * (fromLeft ? -80 : 80);

	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				gap: 14,
				padding: 24,
				borderRadius: 28,
				background: "linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
				border: "1px solid rgba(255,255,255,0.12)",
				opacity: enter,
				transform: `translateX(${x}px)`,
			}}
		>
			<ProductPlaceholder
				label={`Foto de ${title.toLowerCase()}`}
				style={{ width: "100%", height: 220 }}
			/>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 10,
					color: brand.blue,
				}}
			>
				{icon}
				<span
					style={{
						fontFamily: headingFont,
						fontSize: 30,
						color: brand.white,
						letterSpacing: -0.5,
					}}
				>
					{title}
				</span>
			</div>
			<span
				style={{
					fontFamily: bodyFont,
					fontWeight: 500,
					fontSize: 18,
					color: brand.fog,
					opacity: 0.75,
				}}
			>
				{subtitle}
			</span>
		</div>
	);
};

const Chip: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const enter = spring({ frame: frame - delay, fps, config: { damping: 200 } });
	return (
		<span
			style={{
				fontFamily: bodyFont,
				fontWeight: 700,
				fontSize: 20,
				color: brand.white,
				background: `${brand.blue}33`,
				border: `1px solid ${brand.blue}88`,
				borderRadius: 999,
				padding: "10px 22px",
				opacity: enter,
				transform: `translateY(${(1 - enter) * 12}px)`,
			}}
		>
			{label}
		</span>
	);
};

export const Categories: React.FC<{ duration: number }> = ({ duration }) => {
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
				padding: "0 64px",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 40, width: "100%" }}>
				<div
					style={{
						fontFamily: headingFont,
						fontSize: 46,
						color: brand.white,
						textAlign: "center",
						opacity: headingEnter,
						transform: `translateY(${(1 - headingEnter) * -16}px)`,
					}}
				>
					Compra por categoría
				</div>

				<div style={{ display: "flex", gap: 24 }}>
					<Card
						icon={<IconShoe size={28} />}
						title="Zapatillas"
						subtitle="Los últimos lanzamientos"
						delay={8}
						fromLeft
					/>
					<Card
						icon={<IconPerfume size={28} />}
						title="Perfumes"
						subtitle="Fragancias de firma"
						delay={16}
						fromLeft={false}
					/>
				</div>

				<div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
					<Chip label="✨ Novedades" delay={40} />
					<Chip label="🔥 Ofertas" delay={50} />
				</div>
			</div>
		</AbsoluteFill>
	);
};
