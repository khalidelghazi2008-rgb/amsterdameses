import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "./theme";
import { bodyFont, headingFont } from "./fonts";
import { fade } from "./useFade";
import { IconLightningBolt, IconDiscount } from "./icons";
import { ProductPlaceholder } from "./ProductPlaceholder";

export const BestSellers: React.FC<{ duration: number }> = ({ duration }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const opacity = fade(frame, duration);

	const boltSpring = spring({ frame, fps, config: { damping: 10, mass: 0.5 } });
	const flash = Math.max(0, Math.sin(frame / 5)) * 0.5;

	const headingEnter = spring({ frame: frame - 4, fps, config: { damping: 14 } });

	return (
		<AbsoluteFill
			style={{
				opacity,
				alignItems: "center",
				justifyContent: "center",
				padding: "0 56px",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 34, width: "100%" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 14,
						opacity: headingEnter,
						transform: `scale(${0.9 + headingEnter * 0.1})`,
					}}
				>
					<div
						style={{
							color: brand.blue,
							filter: `drop-shadow(0 0 ${8 + flash * 14}px ${brand.blue})`,
							transform: `scale(${0.9 + boltSpring * 0.1})`,
						}}
					>
						<IconLightningBolt size={38} />
					</div>
					<span
						style={{
							fontFamily: headingFont,
							fontSize: 40,
							color: brand.white,
							letterSpacing: -0.5,
							textAlign: "center",
						}}
					>
						Lo más vendido
					</span>
					<div
						style={{
							color: brand.blue,
							filter: `drop-shadow(0 0 ${8 + flash * 14}px ${brand.blue})`,
							transform: `scale(${0.9 + boltSpring * 0.1}) scaleX(-1)`,
						}}
					>
						<IconLightningBolt size={38} />
					</div>
				</div>

				<div style={{ display: "flex", gap: 20 }}>
					{["Sneaker top 1", "Sneaker top 2", "Perfume top"].map((label, i) => {
						const enter = spring({
							frame: frame - 14 - i * 10,
							fps,
							config: { damping: 16, mass: 0.7 },
						});
						return (
							<div
								key={label}
								style={{
									flex: 1,
									position: "relative",
									opacity: enter,
									transform: `translateY(${(1 - enter) * 30}px)`,
								}}
							>
								<ProductPlaceholder label={label} style={{ width: "100%", height: 260 }} />
								<div
									style={{
										position: "absolute",
										top: -10,
										right: -10,
										width: 40,
										height: 40,
										borderRadius: "50%",
										background: brand.blue,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: brand.white,
										boxShadow: `0 4px 14px ${brand.blue}88`,
									}}
								>
									<IconDiscount size={18} />
								</div>
							</div>
						);
					})}
				</div>

				<div
					style={{
						fontFamily: bodyFont,
						fontWeight: 700,
						fontSize: 20,
						color: brand.fog,
						textAlign: "center",
						opacity: spring({ frame: frame - 50, fps, config: { damping: 200 } }),
					}}
				>
					Precios de lanzamiento por tiempo limitado
				</div>
			</div>
		</AbsoluteFill>
	);
};
