let messages=[]
const maxMessages=5
function addMessage(sender, message) {
    messages.push({ sender, message });
    if (messages.length > maxMessages) {
        messages.shift();
    }

    displayChat();
}
function displayChat() {
    console.clear();
    console.log("=== Chat History ===");
    messages.forEach((msg, index) => {
        console.log(`${index + 1}. ${msg.sender}: ${msg.message}`);
    });
    console.log("===================\n");
}
addMessage("Alice", "Hi there!");
addMessage("Bob", "Hello, Alice!");
addMessage("Alice", "How are you today?");
addMessage("Bob", "I'm good, thanks! And you?");
addMessage("Alice", "Doing great, working on a project.");
addMessage("Bob", "Oh, what kind of project?");
addMessage("Alice", "Just a small chat simulation in JS.");