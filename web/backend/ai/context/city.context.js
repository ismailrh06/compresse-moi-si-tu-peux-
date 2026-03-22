export const cityContext = (city) => {
	if (!city) return "";
	return [
		`Ville: ${city.name || ""}`.trim(),
		city.country ? `Pays: ${city.country}` : "",
		city.season ? `Saison: ${city.season}` : ""
	]
		.filter(Boolean)
		.join(" | ");
};
