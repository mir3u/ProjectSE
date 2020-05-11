const mongoose = require('mongoose');

// message schema
const AnswerSchema = mongoose.Schema({
    created: {
        type: Date,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    qandAId:{
        type: String,
        required: true
    },
    conversationId: {
        type: String,
        required: true
    },
    inChatRoom: {
        type: Boolean,
        required: false
    },
    created_at: Date
});

AnswerSchema.statics.addAnswer = (qandA, callback) => {
    qandA.save(callback);
};

AnswerSchema.statics.getQandAByConversation = (id, callback) => {
    QandA.find({conversationId: id}, callback);
};
AnswerSchema.statics.getLastQ = (conversationId, callback) => {
    QandA.findOne({conversationId:conversationId}, {}, { sort: { 'created' : -1 } },callback);
};


const Answer = mongoose.model('answer', AnswerSchema);
module.exports = Answer;
