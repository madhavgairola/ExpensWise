const chatService = require('../services/chat.service');

const handleChatInput = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const userId = req.user.id;
        const result = await chatService.processInteraction(message, userId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error handling chat input:', error);
        res.status(500).json({ error: 'Failed to process chat input', details: error.message });
    }
};

module.exports = {
    handleChatInput
};
