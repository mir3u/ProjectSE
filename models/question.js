const mongoose = require('mongoose');

// message schema
const QuestionSchema = mongoose.Schema({
    created: {
        type: Date,
        required: true
    },
    question: {
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

QuestionSchema.statics.addQuestion = (qandA, callback) => {
    qandA.save(callback);
};

QuestionSchema.statics.getQandAByConversation = (id, callback) => {
    QandA.find({conversationId: id}, callback);
};
QuestionSchema.statics.getLastQ = (conversationId, callback) => {
    QandA.findOne({conversationId:conversationId}, {}, { sort: { 'created' : -1 } },callback);
};


const Question = mongoose.model('question', QuestionSchema);
module.exports = Question;
