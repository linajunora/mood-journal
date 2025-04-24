import { Entry } from "./js/entry.js";

const userId = sessionStorage.getItem('userId');
const username = sessionStorage.getItem('username');

if (!userId) {
    alert("No user logged in");
    window.location.href = "./index.html"; 
} 

document.addEventListener('DOMContentLoaded', () => {
    console.log(`Logged in as ${username}, userId: ${userId}`);
});