export const userContext = (user) => {
	if (!user) return "";
	return [
		`Utilisateur: ${user.name || ""}`.trim(),
		user.locale ? `Langue: ${user.locale}` : "",
		user.currency ? `Devise: ${user.currency}` : ""
	]
		.filter(Boolean)
		.join(" | ");
};
