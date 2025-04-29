import { Entry } from "./js/entry.js";
import { logout } from "./js/logout.js";
import { getData } from "./js/services.js";
import { postData } from "./js/services.js";
import { changeData } from "./js/services.js";
import { deleteData } from "./js/services.js";


const userId = sessionStorage.getItem('userId');
const username = sessionStorage.getItem('username');

if (!userId) {
    alert("No user logged in");
    window.location.href = "./index.html"; 
} 

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
  console.log('Current page:', window.location.pathname);
  console.log(`Logged in as ${username}, userId: ${userId}`);

  const currentPage = window.location.pathname;

  if (currentPage.includes('entries.html')) {
    fetchEntries();
    sessionStorage.removeItem('selectedDate');
sessionStorage.removeItem('editingEntryId');
sessionStorage.removeItem('editingEntryData');
  }

  if (currentPage.includes('addEntry.html')) {
    // Only run this if we're on addEntry page

    const selectedDate = sessionStorage.getItem('selectedDate');
    const editingEntryId = sessionStorage.getItem('editingEntryId');
    const editingEntryDataRaw = sessionStorage.getItem('editingEntryData');
    let editingEntryData = null;

    if (editingEntryDataRaw) {
      try {
        editingEntryData = JSON.parse(editingEntryDataRaw);
      } catch (error) {
        console.error('Error parsing editingEntryData:', error);
      }
    }

    const entryForm = document.querySelector('#entryForm');
    const moodSection = document.querySelector('.moodCheckSection');

    if (editingEntryId && editingEntryData) {
      console.log('Prefilling form for edit mode...');
      prefillEditForm(editingEntryData);
      changeButtonToSave();
      if (entryForm && moodSection) {
        entryForm.style.display = 'block';
        moodSection.style.display = 'none';
      }
    } else if (selectedDate) {
      console.log('Showing full form for selected date...');
      if (entryForm && moodSection) {
        entryForm.style.display = 'block';
        moodSection.style.display = 'none';
      }
    } else {
      console.log('Normal flow: Show mood picker first.');
      if (entryForm && moodSection) {
        entryForm.style.display = 'none';
        moodSection.style.display = 'block';
      }
    }
  }
});

//btnEventlistener:
document.querySelector('#logoutBtn')?.addEventListener('click', logout);

//fetch users entries

const fetchEntries = async () => {
    try {
        const userEntries = await getData('http://localhost:5555/entries', { userId });
        console.log(`entries for user: ${username}:`, userEntries);

        sessionStorage.setItem('userEntries', JSON.stringify(userEntries));

        //sending userEntries into the displayEntries function
        displayEntries(userEntries);
    } catch (error) {
        console.error('Error loading entries:', error);
    }
};

const displayEntries = (entries) => {
    const entriesDiv = document.querySelector('.entriesDiv');
    if (!entriesDiv) return; //förhindrar error om diven inte finns på den sidan

    entriesDiv.innerHTML = '';

    if (entries.length === 0) {
      const message = document.createElement('div');
      message.classList.add('noEntriesMessage');
      message.innerHTML = `
        <h2>No entries yet 📖</h2>
        <p>Start journaling your mood today!</p>
        <button id="startJournalingBtn">➕ Add First Entry</button>
      `;
      entriesDiv.appendChild(message);

      document.getElementById('startJournalingBtn').addEventListener('click', () => {
        sessionStorage.removeItem('selectedDate');
        sessionStorage.removeItem('editingEntryId');
        sessionStorage.removeItem('editingEntryData');
        window.location.href = 'addEntry.html';
      });
      return;
    }

    const sortedEntries = entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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
        <div class="titleDiv">
        <h3 class="entryTitle">${entry.title}</h3>
        </div>
        <div class="entryInfoDiv">
        <p class="entryP"><strong>Day:</strong> ${formatted}</p>
        <p class="entryP"><strong>Mood:</strong> ${entry.mood}</p>
        <p class="entryP"><strong>Feelings:</strong> ${entry.feeling.join(', ')}</p>
        <p class="entryP"><strong>Activities:</strong> ${entry.activities.join(', ')}</p>
        <p class="entryP"><strong>Note:</strong> ${entry.note}</p>
        </div>
         <div class="entryButtons">
        <button class="editEntryBtn" data-id="${entry.id}">✏️</button>
        <button class="deleteEntryBtn" data-id="${entry.id}">🗑️</button>
        </div>
        `;
        entriesDiv.appendChild(entryCard);

        entryCard.querySelector('.editEntryBtn').addEventListener('click', () => {
          editEntry(entry);
        });
        entryCard.querySelector('.deleteEntryBtn').addEventListener('click', () => {
          deleteEntry(entry.id);
        });
    });
};

const editEntry = (entry) => {
  sessionStorage.setItem('editingEntryId', entry.id);
  sessionStorage.setItem('editingEntryData', JSON.stringify(entry));
  sessionStorage.setItem('selectedDate', new Date(entry.timestamp).toISOString().split('T')[0]);
  window.location.href = 'addEntry.html';
};

const deleteEntry = async (id) => {
  const confirmDelete = confirm('Are you sure you want to delete this entry?');

  if (!confirmDelete) return;

  try {
    await deleteData(`http://localhost:5555/entries/${id}`);
    alert('Entry deleted!');
    window.location.reload(); 
  } catch (error) {
    console.error('Error deleting entry:', error);
  }
};

const createEntry = async (e) => {
    e.preventDefault();
    const addEntryDiv = document.querySelector('.addEntryDiv');

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
      const selectedDate = sessionStorage.getItem('selectedDate');
      const timestamp = selectedDate ? new Date(selectedDate).toISOString() : new Date().toISOString();
      
      const newEntry = new Entry(userId, title, mood, feelings, activities, note, timestamp);

      try {
        const editingEntryId = sessionStorage.getItem('editingEntryId');
      
        if (editingEntryId) {
          await changeData(`http://localhost:5555/entries/${editingEntryId}`, newEntry);
        } else {
          await postData('http://localhost:5555/entries', newEntry);
        }
      
        document.querySelector('#entryForm')?.reset();
      
        // Show a "Saved!" message
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('entrySaved');
        messageDiv.textContent = 'Entry Saved!';
        document.body.appendChild(messageDiv);
      
        // ✅ Wait 1.5 seconds, then clear sessionStorage AND redirect
        setTimeout(() => {
          console.log('Redirecting now to entries.html');
      
          messageDiv.remove();
          console.log('Redirecting to entries.html');
          window.location.href = 'entries.html';
        }, 1500);
      
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

const prefillEditForm = (entry) => {
  if (!entry) return;

  const titleInput = document.querySelector('#title');
  if (titleInput) {
    titleInput.value = entry.title || '';
  }
  
  const moodInput = document.querySelector(`input[name="mood"][value="${entry.mood}"]`);
  if (moodInput) {
    moodInput.checked = true;
  }

  if (Array.isArray(entry.feeling)) {
    entry.feeling.forEach(feel => {
      const feelingInput = document.querySelector(`input[name="feeling"][value="${feel}"]`);
      if (feelingInput) {
        feelingInput.checked = true;
      }
    });
  }

  if (Array.isArray(entry.activities)) {
    entry.activities.forEach(activity => {
      const activityInput = document.querySelector(`input[name="activities"][value="${activity}"]`);
      if (activityInput) {
        activityInput.checked = true;
      }
    });
  }

  const noteInput = document.querySelector('#note');
  if (noteInput) {
    noteInput.value = entry.note || '';
  }
};

const changeButtonToSave = () => {
  const button = document.querySelector('#addEntryBtn');
  if (button) {
    button.textContent = 'Save Entry';
  }
};