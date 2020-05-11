const mongoose = require('mongoose');

// message schema
const QandASchema = mongoose.Schema({
    created: {
        type: Date,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: false
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

QandASchema.statics.addQuestionandA = (qandA, callback) => {
    qandA.save(callback);
};

QandASchema.statics.getQandAByConversation = (id, callback) => {
    QandA.find({conversationId: id}, callback);
};
QandASchema.statics.getLastQ = (conversationId, callback) => {
    QandA.findOne({conversationId:conversationId}, {}, { sort: { 'created' : -1 } },callback);
};


const QandA = mongoose.model('qana', QandASchema);
module.exports = QandA;
