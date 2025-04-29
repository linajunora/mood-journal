
import { getData } from "./services.js";

const createSafeISODate = (year, month, day) => {
    const date = new Date(year, month, day);
    // Add 12 hours to prevent timezone issues
    date.setHours(12, 0, 0, 0);
    return date.toISOString().split('T')[0];
  };

let currentDate = new Date();

const userId = sessionStorage.getItem('userId');
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayCalendar();
    document.getElementById('prevMonth').addEventListener('click', goToPreviousMonth);
    document.getElementById('nextMonth').addEventListener('click', goToNextMonth);
});

const fetchAndDisplayCalendar = async () => {
    try {
        const userEntries = await getData('http://localhost:5555/entries', { userId });
        const entriesByDate = {};

        userEntries.forEach(entry => {
            const date = new Date(entry.timestamp).toISOString().split('T')[0]; // format: YYYY-MM-DD
            //the key is a date, the value is mood
            //entry.mood pick for example 'happy' from entries
            entriesByDate[date] = entry.mood;

            //instead of looking through the list again, i can just say
            //entriesByDate['2025-04-20']; and it returns 'happy'
        });

        const calendarContainer = document.querySelector('.calendar');
        calendarContainer.innerHTML = '';

        const monthDisplay = document.getElementById('monthDisplay');

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        monthDisplay.textContent = `${monthNames[month]} ${year}`;

        //start at day1, go up to day30. for each day, make a date object
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(Date.UTC(year, month, day));
            const isoDate = dayDate.toISOString().split('T')[0];
        
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
        
            const circleDiv = document.createElement('div');
            circleDiv.classList.add('circle');
        
            const dayNumberDiv = document.createElement('div');
            dayNumberDiv.classList.add('dayNumber');
            dayNumberDiv.textContent = day;
        
            dayDiv.addEventListener('click', handleDayClick);
        
            if (entriesByDate[isoDate]) {
                const mood = entriesByDate[isoDate];
                circleDiv.textContent = getMoodEmoji(mood);
                dayDiv.classList.add('hasEntry');
            }
        
            dayDiv.dataset.hasEntry = entriesByDate[isoDate] ? 'true' : 'false';
            dayDiv.dataset.date = isoDate;
        
            dayDiv.appendChild(circleDiv);
            dayDiv.appendChild(dayNumberDiv);
            calendarContainer.appendChild(dayDiv);
        }
    } catch (error) {
        console.error('Failed to load calendar:', error)
    }
};

const getMoodEmoji = (mood) => {
    const moodMap = {
      happy: "😊",
      content: " 🙂",
      okey: "😐",
      slightlyOff: "😐",
      blue: "😢",
      // add more moods if you want!
    };
    return moodMap[mood] || "🚀 "; // default smile if mood not found
  };
 
const goToPreviousMonth = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    fetchAndDisplayCalendar();
};

const goToNextMonth = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    fetchAndDisplayCalendar();
};

const handleDayClick = (event) => {
    const clickedDay = event.currentTarget;
    const date = clickedDay.dataset.date;
    const hasEntry = clickedDay.dataset.hasEntry === "true";
  
    if (hasEntry) {
      // ✨ Open edit mode
      openEditEntryForm(date);
    } else {
      // ✨ Open create mode
      openCreateEntryForm(date);
    }
  };

  const openCreateEntryForm = (date) => {
    sessionStorage.setItem('selectedDate', date);
    sessionStorage.removeItem('editingEntryId'); //remove old 
    sessionStorage.removeItem('editingEntryData'); //remove old 
    window.location.href = 'addEntry.html';
  };
  
  const openEditEntryForm = (date) => {
    sessionStorage.setItem('selectedDate', date);

    const userEntries = JSON.parse(sessionStorage.getItem('userEntries')) || [];

    const entry = userEntries.find(entry => {
        const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
        return entryDate === date;
      });

      if (entry) {
        sessionStorage.setItem('editingEntryId', entry.id);
        sessionStorage.setItem('editingEntryData', JSON.stringify(entry));
      }
    
      window.location.href = 'addEntry.html';
  };