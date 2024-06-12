class Event {
    constructor(location, date, time, eventArtist) {
        this.location = location;
        this.date = date;
        this.time = time;
        this.eventArtist = eventArtist;
    }
}

let events = [];
let filteredEvents = [];
const openModalButton = document.getElementById('openModal');
const modal = document.getElementById('modal');
const closeModalButton = document.getElementById('closeModal');
const selectedEventsList = document.getElementById('selectedEventsList');
const toggleNightModeButton = document.getElementById('toggleNightMode');
const body = document.body;

openModalButton.addEventListener('click', () => {
    updateSelectedEventsList();
    modal.style.display = 'block';
});

closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

toggleNightModeButton.addEventListener('click', () => {
    body.classList.toggle('night-mode');
    body.classList.toggle('day-mode');

    
});

function updateSelectedEventsList() {
    selectedEventsList.innerHTML = ''; // Clear existing list
    Array.from(selectedEvents).forEach(event => {
        const listItem = document.createElement('li');
        listItem.textContent = `${event.eventArtist} at ${event.location} on ${event.date} at ${event.time}`;
        selectedEventsList.appendChild(listItem);
    });
}

async function fetchCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

function parseCSV(data) {
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');
    events = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const event = new Event(cols[0], cols[1], cols[2], cols[3]);
        events.push(event);
    }
    
    populateLocations();
    filterAndDisplayEvents();
}

function populateLocations() {
    const locationSelect = document.getElementById('filterLocation');
    const locations = [...new Set(events.map(event => event.location))];
    locations.sort();

    locationSelect.innerHTML = '<option value="">-- Select Location --</option>';
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });
}

function filterAndDisplayEvents() {
    const searchName = document.getElementById('searchName').value.toLowerCase();
    const filterLocation = document.getElementById('filterLocation').value;
    const enableLocationFilter = document.getElementById('enableLocationFilter').checked;

    filteredEvents = events.filter(event => {
        const matchesName = event.eventArtist.toLowerCase().includes(searchName);
        const matchesLocation = enableLocationFilter ? event.location === filterLocation : true;
        return matchesName && matchesLocation;
    });

    generateTable(filteredEvents);
}

let selectedEvents = new Set();


function generateTable(events) {
    const tbody = document.querySelector('#eventTable tbody');
    tbody.innerHTML = ''; // Clear existing table data

    events.forEach(event => {
        const row = document.createElement('tr');

        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = selectedEvents.has(event);
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                selectedEvents.add(event);
            } else {
                selectedEvents.delete(event);
            }
        });
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        for (let key in event) {
            const cell = document.createElement('td');
            cell.textContent = event[key];
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    });
}

function filterAndDisplayEvents() {
    const searchName = document.getElementById('searchName').value.toLowerCase();
    const filterLocation = document.getElementById('filterLocation').value;
    const enableLocationFilter = document.getElementById('enableLocationFilter').checked;

    filteredEvents = events.filter(event => {
        const matchesName = event.eventArtist.toLowerCase().includes(searchName);
        const matchesLocation = enableLocationFilter ? event.location === filterLocation : true;
        return matchesName && matchesLocation;
    });

    generateTable(filteredEvents);
}

function exportICS() {
    const selectedArray = Array.from(selectedEvents);
    if (selectedArray.length === 0) return;

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//YourApp//EN\n";

    selectedArray.forEach(event => {
        const startDateTime = parseDateTime(event.date, event.time.split(' - ')[0]);
        const endDateTime = parseDateTime(event.date, event.time.split(' - ')[1]);

        icsContent += `BEGIN:VEVENT\n`;
        icsContent += `UID:${Math.random().toString(36).substring(2)}@yourapp.com\n`;
        icsContent += `DTSTAMP:${formatDate(new Date())}\n`;
        icsContent += `DTSTART:${formatDate(startDateTime)}\n`;
        icsContent += `DTEND:${formatDate(endDateTime)}\n`;
        icsContent += `SUMMARY:${escapeICalText(event.eventArtist)}\n`;
        icsContent += `LOCATION:${escapeICalText(event.location)}\n`;
        icsContent += `END:VEVENT\n`;
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'selected_events.ics');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function escapeICalText(text) {
    return text.replace(/\\/g, '\\\\')
               .replace(/;/g, '\\;')
               .replace(/,/g, '\\,')
               .replace(/\n/g, '\\n')
               .replace(/\r/g, '\\r')
               .replace(/\(/g, '\\(')
               .replace(/\)/g, '\\)');
}

function parseDateTime(dateStr, timeStr) {
    const dateTimeStr = `${dateStr} ${timeStr}`;
    return new Date(Date.parse(dateTimeStr));
}

function formatDate(date) {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
}

function exportCSV() {
    const selectedArray = Array.from(selectedEvents);
    if (selectedArray.length === 0) return;

    const csvContent = "Location,Date,Time,Event/Artist\n" + selectedArray.map(event => 
        `${event.location},${event.date},${event.time},${event.eventArtist}`).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'selected_events.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function checkNightMode() {
    const currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour < 9) {
        body.classList.add('night-mode');
        body.classList.remove('day-mode');
    } else {
        body.classList.add('day-mode');
        body.classList.remove('night-mode');
    }
}

async function main() {
    checkNightMode();

    const csvData = await fetchCSV(csvUrl);
    parseCSV(csvData);

    document.getElementById('searchName').addEventListener('input', filterAndDisplayEvents);
    document.getElementById('filterLocation').addEventListener('change', filterAndDisplayEvents);
    document.getElementById('enableLocationFilter').addEventListener('change', (event) => {
        document.getElementById('filterLocation').disabled = !event.target.checked;
        filterAndDisplayEvents();
    });
}

document.addEventListener('DOMContentLoaded', main);
document.getElementById('exportCSV').addEventListener('click', exportCSV);
document.getElementById('exportICS').addEventListener('click', exportICS);
