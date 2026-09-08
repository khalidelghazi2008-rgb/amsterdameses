import type { CSSProperties } from "react";
import { brand } from "./theme";

/**
 * Stand-in for a real product photo.
 *
 * You said you'll add your own images later — when you do:
 *   1. Drop the file in `public/` (e.g. public/zapatillas-1.png).
 *   2. Replace <ProductPlaceholder /> with:
 *        <Img src={staticFile("zapatillas-1.png")} style={{ ...same layout style }} />
 *      (import { Img, staticFile } from "remotion";)
 *
 * Until then this renders a dashed brand-colored box so you can see
 * exactly where each image will go and at what size.
 */
export const ProductPlaceholder: React.FC<{
	label: string;
	style?: CSSProperties;
}> = ({ label, style }) => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 10,
				borderRadius: 24,
				border: `3px dashed ${brand.blue}66`,
				background: "linear-gradient(160deg, rgba(43,76,255,0.16), rgba(10,10,10,0.35))",
				...style,
			}}
		>
			<svg width={36} height={36} viewBox="0 0 24 24" fill="none">
				<rect
					x="3"
					y="3"
					width="18"
					height="18"
					rx="3"
					stroke={brand.blue}
					strokeWidth="1.6"
					opacity={0.85}
				/>
				<circle cx="9" cy="9.5" r="1.7" fill={brand.blue} opacity={0.85} />
				<path
					d="M4.5 17.5 9 12l3.2 3.6L15 12l4.5 6"
					stroke={brand.blue}
					strokeWidth="1.6"
					fill="none"
					opacity={0.85}
				/>
			</svg>
			<span
				style={{
					fontFamily: "inherit",
					fontSize: 15,
					fontWeight: 700,
					color: brand.white,
					opacity: 0.75,
					textAlign: "center",
					padding: "0 12px",
				}}
			>
				{label}
			</span>
		</div>
	);
};
