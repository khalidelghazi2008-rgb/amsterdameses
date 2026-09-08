import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "./Background";
import { Intro } from "./Intro";
import { Categories } from "./Categories";
import { TrustBadges } from "./TrustBadges";
import { BestSellers } from "./BestSellers";
import { Outro } from "./Outro";

// Scene timing (30fps). Consecutive scenes overlap by ~15-18 frames so the
// fade-out of one crossfades into the fade-in of the next — see useFade.ts.
export const SCENES = {
	intro: { from: 0, duration: 100 },
	categories: { from: 85, duration: 145 },
	trust: { from: 215, duration: 130 },
	bestSellers: { from: 330, duration: 90 },
	outro: { from: 405, duration: 75 },
};

export const AD_TOTAL_DURATION = 480; // 16s at 30fps

export const AmsterShopAd: React.FC = () => {
	return (
		<AbsoluteFill>
			<Background />

			<Sequence from={SCENES.intro.from} durationInFrames={SCENES.intro.duration}>
				<Intro duration={SCENES.intro.duration} />
			</Sequence>

			<Sequence from={SCENES.categories.from} durationInFrames={SCENES.categories.duration}>
				<Categories duration={SCENES.categories.duration} />
			</Sequence>

			<Sequence from={SCENES.trust.from} durationInFrames={SCENES.trust.duration}>
				<TrustBadges duration={SCENES.trust.duration} />
			</Sequence>

			<Sequence from={SCENES.bestSellers.from} durationInFrames={SCENES.bestSellers.duration}>
				<BestSellers duration={SCENES.bestSellers.duration} />
			</Sequence>

			<Sequence from={SCENES.outro.from} durationInFrames={SCENES.outro.duration}>
				<Outro duration={SCENES.outro.duration} />
			</Sequence>
		</AbsoluteFill>
	);
};
