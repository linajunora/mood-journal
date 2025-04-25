import { Entry } from "./js/entry.js";
import { logout } from "./js/logout.js";
import { getData } from "./js/services.js";
import { postData } from "./js/services.js";


const userId = sessionStorage.getItem('userId');
const username = sessionStorage.getItem('username');

if (!userId) {
    alert("No user logged in");
    window.location.href = "./index.html"; 
} 

document.addEventListener('DOMContentLoaded', () => {
    console.log(`Logged in as ${username}, userId: ${userId}`);
    fetchEntries();
});

//btnEventlistener:
document.querySelector('#logoutBtn')?.addEventListener('click', logout);

//fetch users entries

const fetchEntries = async () => {
    try {
        const userEntries = await getData('http://localhost:5555/entries', { userId });
        console.log(`entries for user: ${username}:`, userEntries);

        //sending userEntries into the displayEntries function
        displayEntries(userEntries);
    } catch (error) {
        console.error('Error loading entries:', error);
    }
};

const displayEntries = (entries) => {
    const entriesDiv = document.querySelector('.entriesDiv');
    if (!entriesDiv) return; //förhindrar error om diven inte finns på den sidan

    entries.forEach((entry) => {
        const entryCard = document.createElement('div');
        entryCard.classList.add('entryCard');

        const date = new Date(entry.timestamp);
        const formatted = date.toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

        entryCard.innerHTML = `
        <h3 class="entryTitle">${entry.title}</h3>
        <p class="entryP"><strong>Day:</strong>${formatted}</p>
        <p class="entryP"><strong>Mood:</strong>${entry.mood}</p>
        <p class="entryP"><strong>Feelings:</strong>${entry.feeling}</p>
        <p class="entryP"><strong>Note:</strong>${entry.note}</p>
        `;

        entriesDiv.appendChild(entryCard);
    });
};

const createEntry = async (e) => {
    e.preventDefault();
    const addEntryDiv = document.querySelector('.addEntryDiv');
    
    // if (!addEntryDiv) return;

    const title = document.querySelector('#title').value;
    const mood = [...document.querySelectorAll('input[name="mood"]')].find(m => m.checked)?.value;
    const feelings = [...document.querySelectorAll('input[name="feeling"]:checked')].map(f => f.value);
    const activities = [...document.querySelectorAll('input[name="activities"]:checked')].map(a => a.value);    
    const note = document.querySelector('#note').value;

    if (
        !title || title.trim() === "" ||
        !mood || mood.trim() === "" ||
        feelings.length === 0 ||
        activities.length === 0 ||
        !note || note.trim() === ""
      ) {
        alert("Tell us more about your day!");
        return;
      }
    const newEntry = new Entry(userId, title, mood, feelings, activities, note);

    try {
        await postData('http://localhost:5555/entries', newEntry);
        document.querySelector('#entryForm').reset();
        window.location.href = 'entries.html';
    } catch (error) {
        console.error('Error posting entry:', error);
    }
}
document.querySelector('#entryForm')?.addEventListener('submit', (e) => {
    e.preventDefault(); 
    createEntry(e);
  });


const moodSelectors = document.querySelectorAll('input[name="moodSelect"]');

moodSelectors.forEach((radio) => {
    // event is a parameter that represents the change event itself.
    //so for input it can be event.target.value = 'happy' ex
  radio.addEventListener('change', (event) => {
    const selectedMood = event.target.value;

    // Show the form
    document.querySelector('#entryForm').style.display = 'block';

    // Select the corresponding mood input inside the form
    const formMoodRadio = document.querySelector(`input[name="mood"][value="${selectedMood}"]`);

    //hide currentmood
    document.querySelector('.moodCheckSection').style.display = 'none';
    if (formMoodRadio) {
      formMoodRadio.checked = true;
    }
  });
});