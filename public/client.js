const socket = io()

const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const sendButton = document.getElementById('send-button')


let partnerId;

socket.on('connect', () => {
    console.log("connected to server");
});

socket.on('disconnect', () => {
    console.log('Disconnected from server')
})


socket.emit('findRandomConnection');
console.log("Attempting to find random connection")

// after establishing a random connection
socket.on('randomConnection', (data) => {
    console.log(`connected with ${data.partnerId}`)
    appendMessage("Your are now connected. Start chatting")

    // Store the partner's ID
    partnerId = data.partnerId;
});

//handle receieving chat message

socket.on('chatMessage', (data) => {
    console.log(`message received from ${data.senderId}: ${data.message}`);
    appendMessage(`${data.senderId}: ${data.message}`)
})





socket.on('noRandomConnection', () => {
    console.log('No available random connection');
    appendMessage("no random availabel connection please try again");
})

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim() !== '') {
        appendMessage(`you: ${message}`)
    }

    messageInput.value = '';
});

function appendMessage(message) {
    const messageContainer = document.getElementById('message-container');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

