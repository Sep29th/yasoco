export const getRandomPastelColor = (): string => {
	const h = Math.floor(Math.random() * 360);
	const s = 70;
	const l = 80;
	const hkl = (n: number) => {
		const k = (n + h / 30) % 12;
		const a = (s * Math.min(l, 100 - l)) / 100;
		const f = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
		return Math.round((255 * f) / 100)
			.toString(16)
			.padStart(2, "0");
	};
	return `#${hkl(0)}${hkl(8)}${hkl(4)}`;
};
