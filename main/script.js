// Initialize Quill rich text editor
const quill = new Quill('#editor', {
    theme: 'snow', // Quill theme
    placeholder: 'Start typing...',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['image', 'code-block']
        ]
    }
});

// Replace this with the actual user's name
const username = prompt("Enter your name:") || "Anonymous"; // Get the user's name

let timeout;

// Initialize Socket.io connection
const socket = io();

// Listen for changes in the editor and send updates to the server
quill.on('text-change', (delta, oldDelta, source) => {
    if (source === 'user') {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            // Send the change with the username
            socket.emit('text-change', { delta, username });
        }, 300); // Throttle updates (300ms)
    }
});

// Listen for updates from the server (changes from other users)
socket.on('text-update', (data) => {
    const { delta, username } = data;
    quill.updateContents(delta);
    // Log the change in the console or display it in the UI
    console.log(`${username} made a change.`);
});

// Sync full document occasionally (optional)
setInterval(() => {
    const fullContent = quill.getContents();
    socket.emit('sync-full-document', fullContent);
}, 10000); // Sync every 10 seconds (adjust as needed)

// Listen for the full document sync from other users (optional)
socket.on('full-document-sync', (content) => {
    quill.setContents(content);
});
