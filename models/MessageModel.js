const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  sender: String, 
  recipient: String, 
  content: String, 
  room: String,
  date: String,
  hour: String
})

const message = mongoose.model('message', messageSchema)

class MessageModel {
  constructor(body) {
    this.body = body
  }

  async create_message() {
    const newMessage = await message.create(this.body)
    const msg = newMessage.save()

    // for(data in msg) {
    //   msg[data] 
    // }

    msg.id = str(msg._id)
    delete msg._id

    return msg
  }
}

module.exports = MessageModel