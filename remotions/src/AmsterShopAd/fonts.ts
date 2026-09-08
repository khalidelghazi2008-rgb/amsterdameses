import { continueRender, delayRender, staticFile } from "remotion";

// Self-hosted fonts (public/fonts) loaded via the FontFace API, the same
// mechanism @remotion/google-fonts uses internally — this keeps rendering
// fully offline-safe instead of depending on a live fetch to Google Fonts.
export const headingFont = "AmsterShop Heading";
export const bodyFont = "AmsterShop Body";

const handle = delayRender("Loading AmsterShop ad fonts");

const headingFace = new FontFace(
	headingFont,
	`url(${staticFile("fonts/ArchivoBlack-Regular.woff2")})`,
	{ weight: "400" },
);
const bodyFace = new FontFace(
	bodyFont,
	`url(${staticFile("fonts/Inter-Variable.woff2")})`,
	{ weight: "500 900" },
);

Promise.all([headingFace.load(), bodyFace.load()])
	.then(([heading, body]) => {
		document.fonts.add(heading);
		document.fonts.add(body);
	})
	.catch((err) => {
		console.warn("Font loading failed, continuing with fallback font", err);
	})
	.finally(() => continueRender(handle));
