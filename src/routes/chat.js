const express = require('express');
const router = express.Router();
const chatController = require('../controller/chat');
const authMiddleware = require('../middleware/authMiddleware'); 
router.get('/conversation/:userId1/:userId2', chatController.getOrCreateConversation);

router.get('/user-conversations/:userId', chatController.getUserConversations);

router.post('/message', chatController.addMessageToConversation);

router.patch('/mark-as-read', chatController.markMessagesAsRead);

router.put('/user/credits/:userId', chatController.updateUserCredits);

router.get('/user/:userId', chatController.getUserById);

module.exports = router;