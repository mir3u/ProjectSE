const socketIo = require('socket.io');
const Message = require('../models/message');
const QandA = require('../models/QandA');
const Question = require('../models/question');
const Answer = require('../models/answer');
const config = require('../config');
const Encryption = require('../middleware/Encryption');
const users = [];
const connections = [];

const initialize = server => {
  const io = socketIo(server, { path: config.chatPath });

  io.on('connection', socket => {
    connections.push(socket);
    socket.join('chat-room');

    socket.emit('welcome', {
      msg: 'Welcome to the chat server!',
    });

    socket.on('username', data => {
      if (data.username) {
        socket.username = data.username;
        let user = { username: socket.username, id: socket.id };
        let existing = searchUser(user.username);
        if (existing == false) {
          users.push(user);
        }

        io.emit('active', users);
        console.log('[%s] connected', socket.username);
        console.log('<users>:', users);
      }
    });

    socket.on('getactive', () => {
      socket.emit('active', users);
    });

    socket.on('message', data => {
      if (data.to == 'chat-room') {
        socket.broadcast.to('chat-room').emit('message', data.message);
      } else {
        let user = searchUser(data.to);
        if (user != false) {
          let instances = searchConnections(data.to);
          if (instances.length > 0) {
            for (let instance of instances) {
              socket.broadcast.to(instance.id).emit('message', data.message);
            }
            let myOtherInstances = searchConnections(socket.username);
            if (myOtherInstances.length > 1) {
              for (let conn of myOtherInstances) {
                // exclude me
                if (conn != socket) {
                  socket.broadcast.to(conn.id).emit('message', data.message);
                }
              }
            }
          }
        }
      }
      console.log(
        '[%s].to(%s)<< %s',
        data.message.from,
        data.to,
        data.message.text
      );

      // console.log(data.message.conversationId);
      let text = data.message.text
      if( text.includes('?')) {
        let qandA_text = {
          created: data.message.created,
          question: data.message.text,
          answer: null,
          conversationId: data.message.conversationId,
          inChatRoom: data.message.inChatRoom
        };
        let qandA = new QandA(qandA_text);
        QandA.addQuestionandA(qandA, (err, newMsg) => {
          // console.log(err);
          let question_text = {
            created: data.message.created,
            question: text,
            qandAId: qandA.id,
            conversationId: data.message.conversationId,
            inChatRoom: data.message.inChatRoom
          }
          let question = new Question(question_text);
          Question.addQuestion(question);
        });
      }
      QandA.getLastQ(data.message.conversationId, (err, lastQ)=>{
        if(lastQ != undefined) {
          if (lastQ.answer == null && !text.includes('?')) {
            lastQ.answer = text;
            let qandA = new QandA(lastQ);
            QandA.addQuestionandA(qandA, (err, newMsg) => {
              console.log(err);
              let answer_text = {
                created: data.message.created,
                answer: text,
                qandAId: qandA.id,
                conversationId: data.message.conversationId,
                inChatRoom: data.message.inChatRoom
              }
              let answer = new Answer(answer_text);
              Question.addQuestion(answer);
            });
          }
        }
      });

      let encryptedMessage = Encryption.encrypt(data.message.text);
      data.message.text = encryptedMessage;
      // console.log(encryptedMessage);
      let message = new Message(data.message);
      Message.addMessage(message, (err, newMsg) => {});
    });

    socket.on('disconnect', () => {
      let instances = searchConnections(socket.username);
      if (instances.length == 1) {
        let user = searchUser(socket.username);
        if (user != false) {
          users.splice(users.indexOf(user), 1);
        }
      }

      io.emit('active', users);
      console.log('[%s] disconnected', socket.username);
      console.log('<users>:', users);

      let connIndex = connections.indexOf(socket);
      if (connIndex > -1) {
        connections.splice(connIndex, 1);
      }
    });
  });
};

const searchUser = username => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].username == username) {
      return users[i];
    }
  }

  return false;
};

const searchConnections = username => {
  let found = [];
  for (let conn of connections) {
    if (conn.username == username) {
      found.push(conn);
    }
  }

  if (found.length > 0) {
    return found;
  } else {
    return false;
  }


};



module.exports = initialize;
