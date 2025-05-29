
const Conversation = require('../model/chat');
const User = require('../model/user'); 


exports.getOrCreateConversation = async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] }
    })
    .populate({
      path: 'participants',
      select: 'name firstName lastName profileImage' 
    })
    .populate({
      path: 'messages.sender',
      select: 'name firstName lastName profileImage' 
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId1, userId2],
        messages: []
      });

      // Repopulate after creation
      conversation = await Conversation.findById(conversation._id)
        .populate({
          path: 'participants',
          select: 'name firstName lastName email profileImage location'
        })
        .populate({
          path: 'messages.sender',
          select: 'name firstName lastName profileImage'
        });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

exports.getUserConversations = async (req, res) => {
  const { userId } = req.params;

  try {
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'firstName lastName email profileImage') 
      .populate('messages.sender', 'firstName lastName email profileImage')
      .sort({ lastMessageAt: -1 }); 

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.addMessageToConversation = async (req, res) => {
  const { conversationId, senderId, text } = req.body;

  try {
    const newMessage = {
      sender: senderId,
      text: text,
      timestamp: new Date(),
    };

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $push: { messages: newMessage },
        $set: { lastMessageAt: new Date() } 
      },
      { new: true } 
    );

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const populatedMessage = {
      ...newMessage,
      sender: await User.findById(senderId, 'name profileImage') 
    };

    res.status(201).json({ success: true, data: populatedMessage, message: 'Message added successfully' });

  } catch (error) {
    console.error('Error in addMessageToConversation:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


exports.markMessagesAsRead = async (req, res) => {
  const { conversationId, userId } = req.body;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    
    conversation.messages.forEach(msg => {
      if (msg.sender.toString() !== userId && !msg.read) {
        msg.read = true;
      }
    });

    await conversation.save();

    res.status(200).json({ success: true, message: 'Messages marked as read' });

  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


exports.updateUserCredits = async (req, res) => {
  const { userId } = req.params;
  const { credits } = req.body; 

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.credits = credits;
    await user.save();

    res.status(200).json({ success: true, message: 'User credits updated', credits: user.credits });
  } catch (error) {
    console.error('Error updating user credits:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password'); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};