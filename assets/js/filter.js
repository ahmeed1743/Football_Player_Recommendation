const headerLinks = document.querySelectorAll(".headerlink");
const filterBtn = document.getElementById("filterBtn");
const filterPanel = document.getElementById("filterPanel");
const closeFilter = document.getElementById("closeFilter");
const searchInput = document.getElementById("player-search");
const autoCompleteResults = document.getElementById("auto-complete-results");


const playersPerPage = 100;
let currentPage = 1;
let allPlayers = [];
let currentFilteredPlayers = [];
let countryMapping = {}; // Mapping full country names

// Set active link styling
headerLinks.forEach((link) => {
    link.addEventListener("click", function () {
        headerLinks.forEach((item) => item.classList.remove("activelink"));
        link.classList.add("activelink");
    });
});


// Filter panel show/hide
filterBtn.addEventListener("click", () => {
    filterPanel.classList.add("active");
});
closeFilter.addEventListener("click", () => {
    filterPanel.classList.remove("active");
});


/*****************************************************************************
                    Load-Read -> CsvFile
******************************************************************************/

// Load country mapping JSON
async function loadCountryMapping() {
    try {
        const response = await fetch("assets/data/countries.json");
        if (!response.ok) throw new Error("Error loading country mapping");
        countryMapping = await response.json();
    } catch (error) {
        console.error("Error loading country mapping:", error);
    }
}

// Load player data from CSV
async function loadPlayerDataFromCSV() {
    try {
        await loadCountryMapping(); // Load country mapping first
        const response = await fetch("assets/data/final_filtered_data.csv");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.text();
        allPlayers = parseCSV(data);

        // Update the row count display
        document.getElementById("rowNumber").textContent = allPlayers.length;

        initializeApp(allPlayers);
    } catch (error) {
        console.error("Error loading player data:", error);
    }
}

// Parse CSV into player objects
function parseCSV(data) {
    const rows = data.split("\n").map((row) => row.split(","));
    const headers = rows[0].map((header) => header.trim());
    const players = rows.slice(1).map((row) => {
        const playerData = {};
        headers.forEach((header, index) => {
            playerData[header] = row[index] ? row[index].trim() : null;
        });
        return playerData;
    });
    return players;
}

/*****************************************************************************
                    Load-Read -> CsvFile
******************************************************************************/

/*****************************************************************************
                    Auto-CompleteBar
******************************************************************************/

    // Search bar auto-complete functionality
    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase().trim();
        autoCompleteResults.innerHTML = "";

        if (query.length > 0) {
            const filteredPlayers = players.filter((player) => player.player && player.player.toLowerCase().includes(query));

            filteredPlayers.forEach((player) => {
                const resultItem = document.createElement("div");
                resultItem.textContent = player.player; // Use the correct player name field
                resultItem.addEventListener("click", () => {
                    selectPlayer(player, players);
                });
                autoCompleteResults.appendChild(resultItem);
            });
        }
    });

/*****************************************************************************
                    Auto-CompleteBar
******************************************************************************/

/*****************************************************************************
                    Filter-Panel
******************************************************************************/


// Initialize app, populate options, display players
let players = [];
function initializeApp(parsedData) {
    players = parsedData;
    populateSelectOptions();
    displayPlayers(players);
    updatePaginationButtons(players);
}

// Populate select options
function populateSelectOptions() {
    const nationalitySet = new Set();
    const teamSet = new Set();
    const leagueSet = new Set();
    const positionSet = new Set();
    const seasonSet = new Set();

    players.forEach(player => {
        if (player.nation) nationalitySet.add(player.nation);
        if (player.team) teamSet.add(player.team);
        if (player.league) leagueSet.add(player.league);
        if (player.season) seasonSet.add(player.season);
        if (player.pos) positionSet.add(player.pos.trim());
    });

    const nationalitySelect = document.getElementById('nationality');
    const teamSelect = document.getElementById('team');
    const leagueSelect = document.getElementById('league');
    const seasonSelect = document.getElementById('season');
    const positionSelect = document.getElementById('position');

    nationalitySet.forEach(nation => {
        const option = document.createElement('option');
        option.value = nation;
        option.textContent = nation;
        nationalitySelect.appendChild(option);
    });

    teamSet.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamSelect.appendChild(option);
    });
    leagueSet.forEach(league => {
        const option = document.createElement('option');
        option.value = league;
        option.textContent = league;
        leagueSelect.appendChild(option);
    });
    seasonSet.forEach(season => {
        const formattedSeason = `${season.slice(0, 2)}/${season.slice(2)}`; 
        const option = document.createElement('option');
        option.value = season; 
        option.textContent = formattedSeason; 
        seasonSelect.appendChild(option);
    });
    

    positionSet.forEach(pos => {
        const option = document.createElement('option');
        option.value = pos;
        option.textContent = pos;
        positionSelect.appendChild(option);
    });
}

// Filter players based on selected criteria
function filterPlayers() {
    const nationality = document.getElementById('nationality').value;
    const position = document.getElementById('position').value;
    const team = document.getElementById('team').value;
    const league = document.getElementById('league').value;
    const season = document.getElementById('season').value;
    const ageInterval = document.getElementById('ageInterval').value;
    const sortBy = document.getElementById('sortBy').value;

    currentFilteredPlayers = players.filter(player => {
        const age = parseInt(player.age, 10);
        const goals = parseInt(player.Performance_Gls, 10) || 0;
        const assists = parseInt(player.Performance_Ast, 10) || 0;
        const xG = parseFloat(player.Expected_xG) || 0;
        const minutesPlayed = parseInt(player.PlayingTime_Min, 10) || 0;

        const ageMatch = !ageInterval || (
            (ageInterval === "18-25" && age >= 18 && age <= 25) ||
            (ageInterval === "26-30" && age >= 26 && age <= 30) ||
            (ageInterval === "31-35" && age >= 31 && age <= 35) ||
            (ageInterval === "36-40" && age >= 36 && age <= 40)
        );
        const nationalityMatch = !nationality || player.nation === nationality;
        const positionMatch = !position || player.pos === position;
        const teamMatch = !team || player.team === team;
        const leagueMatch = !league || player.league === league;
        const seasonMatch = !season || player.season === season;

        return nationalityMatch && positionMatch && teamMatch && ageMatch && leagueMatch && seasonMatch
    });

    // Sort filtered players
    if (sortBy) {
        currentFilteredPlayers.sort((a, b) => {
            const valueA = parseFloat(a[sortBy] || 0);
            const valueB = parseFloat(b[sortBy] || 0);
            return valueB - valueA;
        });
    }

    currentPage = 1;
    displayPlayers(currentFilteredPlayers);
    updatePaginationButtons(currentFilteredPlayers);

    document.getElementById("rowNumber").textContent = currentFilteredPlayers.length;

}

/*****************************************************************************
                    Filter-Panel
******************************************************************************/

/*****************************************************************************
                    Diplay_Data-Table
******************************************************************************/

// Display players in the table
function displayPlayers(filteredPlayers) {
    const playersBody = document.getElementById('players-body');
    playersBody.innerHTML = "";
    const startIndex = (currentPage - 1) * playersPerPage;
    const endIndex = startIndex + playersPerPage;
    filteredPlayers.slice(startIndex, endIndex).forEach((player, index) => {
        const row = document.createElement('tr');
        const playerImageUrl = `https://via.placeholder.com/50x50.png?text=${encodeURIComponent(player.player.charAt(0))}`;
        const leagueLogoUrl = `assets/imgs/leagues/${capitalizeFirstLetter(player.league)}.png`;

// Helper function to capitalize the first letter of each word
function capitalizeFirstLetter(str) {
    return str
        .toLowerCase() // Ensure the string is lowercase first
        .split(' ') // Split into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' '); // Join back into a single string
}
        const teamLogoUrl = `assets/imgs/logos/${encodeURIComponent(player.team.toLowerCase())}.png`;

        // Get full country name for the flag
        const fullCountryName = countryMapping[player.nation] || player.nation;
        const flagUrl = `assets/imgs/Countries/${fullCountryName}.png`;
        const formattedSeason = `${player.season.slice(0, 2)}/${player.season.slice(2)}`;
        const age = parseInt(player.age, 10) || 'N/A';
        const goals = parseInt(player.Performance_Gls, 10) || 0;
        const assists = parseInt(player.Performance_Ast, 10) || 0;

        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td data-label="Player: " id="Player_Name">
                <img src="${playerImageUrl}" alt="${player.player}" style="width: 50px; height: 50px; border-radius: 50%; object-fit:contain">
                ${player.player}
            </td>
            <td data-label="Team: " id="team-logo-cell">
                <img src="${teamLogoUrl}" alt="${player.team}">
            </td>
            <td data-label="League: " id="league-logo-cell">
                <img src="${leagueLogoUrl}" alt="${player.league}">
            </td>
            <td data-label="Nationality: " id="flag-cell">
                <img src="${flagUrl}" alt="${fullCountryName}">
            </td>
            <td data-label="Season: ">${formattedSeason}</td>
            <td data-label="Position: ">${player.pos}</td>
            <td data-label="Age: ">${age}</td>
            <td data-label="Goals: ">${goals}</td>
            <td data-label="Assists: ">${assists}</td>
            <td data-label="Pace(km/h): ">${player.pace}</td>
            <td data-label="Minutes Played: ">${player.PlayingTime_Min || 0}</td>
            <td data-label="XG: ">${player.Expected_xG || 0}</td>
        `;

        // Set the text content of the parent element for team and league logos
        const teamLogoCell = row.querySelector('#team-logo-cell');
        const leagueLogoCell = row.querySelector('#league-logo-cell');

        if (teamLogoCell) {
            teamLogoCell.textContent = player.team;
        }

        if (leagueLogoCell) {
            leagueLogoCell.textContent = player.league;
        }

        row.style.cursor = 'pointer';
        row.onclick = function () {
            showPlayerDetails(player);
        };

        playersBody.appendChild(row);
    });

    document.getElementById("currentPage").innerText = currentPage;
}
/*****************************************************************************
                    Diplay_Data-Table
******************************************************************************/

/*****************************************************************************
                    DisplayPlayer-SearchBar
******************************************************************************/

// Display selected player details
function showPlayerDetails(player) {
    // Assuming `season` is a field in your player object
    const season = player.season; 
    const playerName = encodeURIComponent(player.player); // Encode player name
    window.location.href = `player-details.html?player=${playerName}&season=${season}`; // Redirect to player details page with player and season in the URL
}


// Get references to the search button and input
const searchButton = document.getElementById("searchButton");

// Add event listener for the search button
searchButton.addEventListener("click", function () {
    const query = searchInput.value.trim().toLowerCase();

    if (query) {
        // Call the search function with the query
        searchPlayer(query);
    } else {
        alert("Please enter a player name to search.");
    }
});

// Sample search function that displays the result
function searchPlayer(query) {
    const filteredPlayers = players.filter((player) => {
        return player.player && typeof player.player === "string" &&
            player.player.toLowerCase() === query;
    });

    if (filteredPlayers.length > 0) {
        displayPlayers(filteredPlayers); // Call your function to display the results
    } else {
        alert("No matching player found.");
    }
}


// Search bar auto-complete functionality
searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    autoCompleteResults.innerHTML = "";

    if (query.length > 0) {
        // Filter players and remove duplicates by using a Set
        const seenPlayers = new Set();
        const filteredPlayers = players.filter((player) => {
            // Check if player.player is a valid string before calling toLowerCase()
            if (player.player && typeof player.player === "string") {
                const isDuplicate = seenPlayers.has(player.player.toLowerCase());
                if (!isDuplicate && player.player.toLowerCase().includes(query)) {
                    seenPlayers.add(player.player.toLowerCase());
                    return true;
                }
            }
            return false;
        });

        // Display unique filtered players in the auto-complete results
        filteredPlayers.forEach((player) => {
            const resultItem = document.createElement("div");
            resultItem.textContent = player.player; // Display player name
            resultItem.addEventListener("click", () => {
                searchInput.value = player.player; // Fill the input with the selected player name
                autoCompleteResults.innerHTML = ""; // Clear the suggestions
            });
            autoCompleteResults.appendChild(resultItem);
        });
    }
});


/*****************************************************************************
                    DisplayPlayer-SearchBar
******************************************************************************/


/*****************************************************************************
                    Pagination Control
******************************************************************************/

// Pagination control
function changePage(direction) {
    const playersToDisplay = currentFilteredPlayers.length ? currentFilteredPlayers : players;

    // Calculate new page number
    const totalPages = Math.ceil(playersToDisplay.length / playersPerPage);
    currentPage += direction;

    // Ensure currentPage stays within valid bounds
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    displayPlayers(playersToDisplay);
    updatePaginationButtons(playersToDisplay);
}

document.getElementById("prevPage").addEventListener("click", function () {
    changePage(-1);
});

document.getElementById("nextPage").addEventListener("click", function () {
    changePage(1);
});

// Update pagination buttons
function updatePaginationButtons(playersToDisplay) {
    const totalPlayers = playersToDisplay.length;
    const totalPages = Math.ceil(totalPlayers / playersPerPage);

    document.getElementById("prevPage").disabled = (currentPage <= 1);
    document.getElementById("nextPage").disabled = (currentPage >= totalPages);
}

/*****************************************************************************
                    Pagination Control
******************************************************************************/

/*****************************************************************************
                    Clear,Reset-TheData
******************************************************************************/

// Clear filters and reset display
function clearFilters() {
    document.getElementById('nationality').value = '';
    document.getElementById('position').value = '';
    document.getElementById('team').value = '';
    document.getElementById('league').value = '';
    document.getElementById('ageInterval').value = '';
    document.getElementById('season').value = '';
    searchInput.value = ''
    
    currentFilteredPlayers = [];
    displayPlayers(players); // Display all players
    updatePaginationButtons(players); // Update pagination based on all players

    // Set the row count to the total number of players
    document.getElementById("rowNumber").textContent = players.length; // Use players.length
}

// Initialize data on window load
window.onload = loadPlayerDataFromCSV;

/*****************************************************************************
                    Clear,Reset-TheData
******************************************************************************/


