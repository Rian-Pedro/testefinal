const MessageModel = require('./models/MessageModel')

const server = require('http').createServer()
const mongoose = require('mongoose')

const moment = require('moment')

moment.locale('pt-br')

mongoose.connect(`mongodb+srv://admin:${"xLR1bW5fL1Z8vogq"}@talkhub.b0k5fuv.mongodb.net/?retryWrites=true&w=majority`)
  .then(() => {
    const { Server } = require('socket.io')
    const io = new Server(server)
    
    io.on('connect', (socket) => {

      socket.on('join_room', (data) => {
        const { room } = data

        socket.join(room)
        print(room + '\n\n\n\n')

        socket.to(room).emit("joined_room", {room, message: 'entrou na sala.'})
      })


      socket.on('leave_room', (data) => {
        const {room} = data

        socket.leave(room)

        socket.to(room).emit('left_room', {room, message: 'saiu da sala.'})
      })


      socket.on('start_chat', (data) => {
        const { user_id, friend_id } = data

        room = `${user_id}_${friend_id}`

        socket.join(room)

        socket.to(user_id).emit('chat_started', {room})
        socket.to(friend_id).emit('chat_started', {room})
      })


      socket.on('message', (data) => {
        const { sender, recipient, content, room } = data

        const date = moment().format('L')
        const hour = moment().format('LTS')

        msg = {
          sender, 
          recipient, 
          content, 
          room,
          date,
          hour
        }

        socket.to(sender).emit('message_sended', msg)
        socket.to(recipient).emit('message_sended', msg)
        socket.to(recipient).emit('notification', {sender})

        const message = new MessageModel(msg)

        message.create_message()

      })

      socket.on('typing', (data) => {
        const { sender, recipient } = data

        socket.to(recipient).emit('user_typing', {sender, recipient})
      })

    })

    server.listen(3000, () => {console.log('http://localhost:3000')})
  })