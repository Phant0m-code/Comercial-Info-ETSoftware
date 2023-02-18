// Get all the content divs and the container
const contents = document.querySelectorAll('.content');
const container = document.querySelector('.container');

// Set the current index to 0
let current = 0;

// Define the function to toggle between the content divs
function toggleContent() {
    // Hide the current content
    contents[current].classList.remove('active');

    // Increment the index or loop back to the beginning
    current = (current + 1) % contents.length;

    // Show the next content
    contents[current].classList.add('active');
}

// Call the toggleContent function every 10 seconds
setInterval(toggleContent, 10000);