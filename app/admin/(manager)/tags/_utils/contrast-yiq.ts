export const getContrastYIQ = (hexcolor: string) => {
	const hex = hexcolor.replace("#", "");
	const fullHex =
		hex.length === 3
			? hex
					.split("")
					.map((c) => c + c)
					.join("")
			: hex;
	const r = parseInt(fullHex.slice(0, 2), 16);
	const g = parseInt(fullHex.slice(2, 4), 16);
	const b = parseInt(fullHex.slice(4, 6), 16);
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;
	return yiq >= 128 ? "black" : "white";
};
