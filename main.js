require("dotenv").config()
require("moment-timezone")

const MessageModel = require('./models/MessageModel')

const http = require('http')
const mongoose = require('mongoose')

const express = require("express")
const app = express()

const server = http.createServer(app)

const moment = require('moment')

const cors = require("cors")

moment.locale('pt-br')

app.use(cors())

app.get('/', (req, res) => {
  res.send("hello")
})

mongoose.connect(`mongodb+srv://admin:${"xLR1bW5fL1Z8vogq"}@talkhub.b0k5fuv.mongodb.net/?retryWrites=true&w=majority`)
  .then(() => {
    const socketIO = require('socket.io')
    const io = socketIO(server, {
      cors: {
        origin: process.env.ORIGINURL,
        methods: ["GET", "POST"]
      }
    })
    
    io.on('connect', (socket) => {

      socket.on('join_room', (data) => {
        const { room } = data

        socket.join(room)
        console.log(room + '\n\n\n\n')

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

        const now = moment().tz("America/Recife")

        const date = now.format('YYYY-MM-DD')
        const hour = now.format('h:mm:ss')

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

      socket.on('disconnect', () => {
        console.log("desconectou")
      })

    })

    server.listen(process.env.PORT, () => {console.log('http://localhost:3000')})
  })