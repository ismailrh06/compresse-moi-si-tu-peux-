import { buildAssistantReply } from "./ai.service.js";

export const chatWithAssistant = async (req, res, next) => {
	try {
		const { messages } = req.body;

		if (!Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({
				message: "messages array is required"
			});
		}

		const reply = await buildAssistantReply({ messages });
		return res.json({ reply });
	} catch (error) {
		return next(error);
	}
};
