const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize the express app and create an HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (your front-end)
app.use(express.static('public'));

// To store the document content (optional: you can replace this with a database)
let documentContent = null;

// Handle new connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Send the current document content to the newly connected user
    if (documentContent) {
        socket.emit('full-document-sync', documentContent);
    }

    // Listen for 'text-change' events from the client
    socket.on('text-change', (data) => {
        const { delta, username } = data;
        // Broadcast the text changes to other connected clients along with the username
        socket.broadcast.emit('text-update', { delta, username });
    });

    // Handle full document sync (when a user sends the entire document)
    socket.on('sync-full-document', (content) => {
        documentContent = content; // Save the document content on the server
        socket.broadcast.emit('full-document-sync', content); // Sync with other users
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
