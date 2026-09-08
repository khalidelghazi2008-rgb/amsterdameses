import { brand } from "./theme";
import { headingFont } from "./fonts";

export const Logotype: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "baseline",
				fontFamily: headingFont,
				fontSize: 86 * scale,
				lineHeight: 1,
				letterSpacing: -1,
			}}
		>
			<span style={{ color: brand.white }}>Amster</span>
			<span style={{ color: brand.blue }}>Shop</span>
		</div>
	);
};
