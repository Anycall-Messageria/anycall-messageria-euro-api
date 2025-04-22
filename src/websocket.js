import { io } from './../server.js'

io.on("connection", socket => {
    console.log('Socket=>', socket.id)
})
