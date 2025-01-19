let countryMapping = {};

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

// Extract player details from the URL query parameters
function getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        playerName: urlParams.get('player'), // Get the player name from the URL
        season: urlParams.get('season')      // Get the season if provided
    };
}

// Load the CSV data and filter by season (adjust path to your CSV file)
async function loadCSVData(season) {
    try {
        const response = await fetch('assets/data/final_filtered_data.csv');
        const csvData = await response.text();
        const parsedData = Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        }).data;

        // Filter data by season if a season is provided
        if (season) {
            return parsedData.filter(row => row.season == season); // Use == for loose comparison
        }
        return parsedData; // Return all data if no season is provided
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return [];
    }
}

// Create a spider chart for player performance stats
function createSpiderChart(player) {
    console.log("Player Data for Spider Chart:", player);

    // Check if the required fields exist in the player object
    const requiredFields = ['Total_Cmp%', 'Standard_SoT%', 'Short_Cmp%', 'Medium_Cmp%', 'Long_Cmp%', 'Challenges_Tkl%', 'Playing Time_Min%'];
    requiredFields.forEach(field => {
        if (!(field in player)) {
            console.error(`Missing field in player data: ${field}`);
        }
    });

    const ctx = document.getElementById('player-spider-chart').getContext('2d');

    const stats = {
        Passing: parseFloat(player['Total_Cmp%']) || 0,
        Shooting: parseFloat(player['Standard_SoT%']) || 0,
        Short_Passes: parseFloat(player['Short_Cmp%']) || 0,
        Medium_Passes: parseFloat(player['Medium_Cmp%']) || 0,
        Long_Passes: parseFloat(player['Long_Cmp%']) || 0,
        Challenges: parseFloat(player['Challenges_Tkl%']) || 0,
        Playing_Time: parseFloat(player['Playing Time_Min%']) || 0,
    };

    console.log("Chart Stats:", stats);

    const data = {
        labels: ['Passing', 'Short_Passes', 'Medium_Passes', 'Long_Passes', 'Shooting', 'Challenges', 'Playing_Time'],
        datasets: [{
            label: `${player.player} - Performance Stats`,
            data: Object.values(stats),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: '#e0e0e0'
                }
            }
        },
        scales: {
            r: {
                angleLines: {
                    color: '#555'
                },
                grid: {
                    color: '#555'
                },
                pointLabels: {
                    color: '#e0e0e0'
                },
                ticks: {
                    color: '#e0e0e0',
                    backdropColor: 'transparent'
                }
            }
        }
    };

    if (window.playerSpiderChart) window.playerSpiderChart.destroy();

    window.playerSpiderChart = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: options
    });
}

function displayHistoricalPerformance(player, allPlayers) {
    console.log("Player Data for Historical Performance:", player);
    console.log("All Players Data:", allPlayers);

    const historicalStatsContainer = document.createElement("div");
    historicalStatsContainer.classList.add("historical-stats-container");

    const table = document.createElement("table");
    table.classList.add("historical-stats-table");

    const tableHeader = `
        <thead>
            <tr>
                <th>Season</th>
                <th>Team</th>
                <th>Appearances</th>
                <th>Goals</th>
                <th>Assists</th>
                <th>Passes</th>
                <th>Key_Passes</th>
                <th>Minutes Played</th>
                <th>xG</th>
            </tr>
        </thead>
    `;
    table.innerHTML = tableHeader;

    const tableBody = document.createElement("tbody");

    // Get all the unique seasons for the player from the data and sort them in ascending order
    const playerSeasons = [...new Set(allPlayers.filter(p => p.player === player.player).map(p => p.season))];
    playerSeasons.sort((a, b) => String(a).localeCompare(String(b)));  // Sort seasons in ascending order

    console.log("Player Seasons:", playerSeasons);

    // Prepare the chart data
    const chartData = {
        labels: playerSeasons,
        appearances: [],
        goals: [],
        assists: [],
        passes: [],
        key_passes: [],
        minutesPlayed: [],
        xG: [],
    };

    playerSeasons.forEach((season) => {
        const playerStats = allPlayers.find(
            (p) => p.player === player.player && p.season === season
        );
        if (playerStats) {
            console.log(`Player Stats for Season ${season}:`, playerStats);

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${season}</td>
                <td>${playerStats.team || "N/A"}</td>
                <td>${playerStats['Playing Time_MP'] || "N/A"}</td>
                <td>${playerStats.Performance_Gls || "N/A"}</td>
                <td>${playerStats.Performance_Ast || "N/A"}</td>
                <td>${playerStats.Total_Att || "N/A"}</td>
                <td>${playerStats.KP || "N/A"}</td>
                <td>${playerStats.PlayingTime_Min || "N/A"}</td>
                <td>${playerStats.Expected_xG || "N/A"}</td>
            `;
            tableBody.appendChild(row);

            // Collect data for chart, including appearances
            chartData.appearances.push(playerStats['Playing Time_MP'] || 0);
            chartData.goals.push(playerStats.Performance_Gls || 0);
            chartData.assists.push(playerStats.Performance_Ast || 0);
            chartData.passes.push(playerStats.Total_Att || 0);
            chartData.key_passes.push(playerStats.KP || 0);
            chartData.minutesPlayed.push(playerStats.PlayingTime_Min || 0);
            chartData.xG.push(playerStats.Expected_xG || 0);
        }
    });

    table.appendChild(tableBody);
    historicalStatsContainer.appendChild(table);
    document.getElementById("historical-performance-container").appendChild(historicalStatsContainer);

    // Generate radio buttons based on table headers
    generateRadioButtonsFromTable();

    // Initialize the chart with "Goals" as the default feature
    renderLineChart(chartData, "Goals");

    // Add event listener for radio button selection
    document.querySelectorAll("input[name='feature']").forEach((radio) => {
        radio.addEventListener("change", (e) => {
            const selectedFeature = e.target.value;
            renderLineChart(chartData, selectedFeature);
        });
    });
}

// Generate radio buttons for selecting features in the line chart
function generateRadioButtonsFromTable() {
    const table = document.querySelector('#historical-performance-container table');
    if (!table) {
        console.error("Table not found!");
        return;
    }

    const headerCells = table.querySelectorAll('thead th');
    const container = document.getElementById('radio-buttons-container');
    container.innerHTML = '';

    headerCells.forEach((header) => {
        const feature = header.textContent.trim();
        if (feature === "Season" || feature === "Team") return;

        const input = document.createElement('input');
        input.type = 'radio';
        input.id = feature.toLowerCase().replace(/\s+/g, '-');
        input.name = 'feature';
        input.value = feature;

        const label = document.createElement('label');
        label.setAttribute('for', input.id);
        label.textContent = feature;

        const radioContainer = document.createElement('div');
        radioContainer.classList.add('radio-container');
        radioContainer.appendChild(input);
        radioContainer.appendChild(label);
        container.appendChild(radioContainer);
    });
}

// Render the line chart for historical performance
function renderLineChart(chartData, feature) {
    console.log("Chart Data for Line Chart:", chartData);
    console.log("Selected Feature:", feature);

    const featureDataMap = {
        Appearances: chartData.appearances,
        Goals: chartData.goals,
        Assists: chartData.assists,
        "Minutes Played": chartData.minutesPlayed,
        xG: chartData.xG,
        Passes: chartData.passes,
        Key_Passes: chartData.key_passes,
    };

    const ctx = document.getElementById('line-chart').getContext('2d');
    if (window.lineChart) {
        window.lineChart.destroy();
    }

    window.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: feature,
                data: featureDataMap[feature],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: true,
            }]
        },
        plugins: {
            filler: {
                propagate: true
            },
            legend: {
                labels: {
                    color: '#e0e0e0'
                }
            }
        },
        elements: {
            line: {
                tension: 0.5
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#555'
                }
            },
            x: {
                grid: {
                    color: '#555'
                }
            },
        },
        options: {
            elements: {
                line: {
                    tension: 0.5
                }
            }
        }
    });
}

function createTouchesBarChart(player) {
    const ctx = document.getElementById('touches-bar-chart').getContext('2d');

    const data = {
        labels: ['Def Pen', 'Def 3rd', 'Mid 3rd', 'Att 3rd', 'Att Pen'],
        datasets: [{
            label: 'Touches by Area',
            data: [
                player['Touches_Def Pen'] || 0,
                player['Touches_Def 3rd'] || 0,
                player['Touches_Mid 3rd'] || 0,
                player['Touches_Att 3rd'] || 0,
                player['Touches_Att Pen'] || 0,
            ],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: '#e0e0e0'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#555'
                }
            },
            x: {
                grid: {
                    color: '#555'
                }
            },
        },
    };

    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    });
}

// Display player details on the page
async function displayPlayerDetails(player, season, allPlayers) {
    // Ensure country mapping is loaded
    if (Object.keys(countryMapping).length === 0) {
        await loadCountryMapping();
    }

    // Get full country name for the flag
    const fullCountryName = countryMapping[player.nation] || player.nation;
    const flagUrl = `assets/imgs/Countries/${fullCountryName}.png`;

    // Display nationality with flag and full name
    const nationalityElement = document.getElementById('playerNationality');
    if (nationalityElement) {
        nationalityElement.innerHTML = `
            <img src="${flagUrl}" alt="${fullCountryName} Flag">
            ${fullCountryName}
        `;
    } else {
        console.error("Element with ID 'playerNationality' not found.");
    }

    // Display season
    const seasonElement = document.getElementById('playerSeason');
    if (seasonElement) {
        const formattedSeason = `${season.slice(0, 2)}/${season.slice(2)}`;
        seasonElement.textContent = `${formattedSeason}`;
    } else {
        console.error("Element with ID 'playerSeason' not found.");
    }

    // Display basic player information
    document.getElementById('playerName').textContent = player.player;

    // Set league and team logos
    const leagueLogoPath = `assets/imgs/leagues/${encodeURIComponent(player.league.toLowerCase())}.png`;
    const teamLogoPath = `assets/imgs/logos/${encodeURIComponent(player.team.toLowerCase())}.png`;

    // Display league logo
    const leagueElement = document.getElementById('playerLeague');
    if (leagueElement) {
        leagueElement.innerHTML = `
            <img src="${leagueLogoPath}" alt="${player.league} Logo">
        `;
    } else {
        console.error("Element with ID 'playerLeague' not found.");
    }

    // Display team logo
    const teamElement = document.getElementById('playerTeam');
    if (teamElement) {
        teamElement.innerHTML = `
            <img src="${teamLogoPath}" alt="${player.team} Logo">
        `;
    } else {
        console.error("Element with ID 'playerTeam' not found.");
    }

    // Set player image
    const playerImage = document.getElementById('playerImage');
    if (playerImage) {
        playerImage.src = 'assets/imgs/p223340.png'; 
        playerImage.alt = `${player.player} Image`;
    } else {
        console.error("Element with ID 'playerImage' not found.");
    }

    // Display main statistics
    const mainStats = [
        { name: "Pace", value: `${player.pace} <span style='color: gray; font-size:15px; margin-left:5px'>Km/h</span>` },
        { name: "Shooting", value: `${player['Standard_SoT%']} <span style='color: gray; font-size:15px; margin-left:5px'>%</span>` },
        { name: "Passing", value: `${player['Total_Cmp%']} <span style='color: gray; font-size:15px; margin-left:5px'>%</span>` },
    ];

    const mainStatsContainer = document.querySelector(".main-stats");
    if (mainStatsContainer) {
        mainStatsContainer.innerHTML = mainStats.map(stat => `
            <div class="stat-item">
                <div class="stat-name">${stat.name}</div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-bar">
                    <div class="stat-bar-fill" style="width: ${parseFloat(stat.value) || 0}%"></div>
                </div>
            </div>
        `).join('');
    } else {
        console.error("Element with class 'main-stats' not found.");
    }

    // Display detailed statistics
    const detailedStats = [
        { type: "header", name: "Personal Information" },
        { name: "Nationality", value: `<div id="playerNationality"><img style="width: 40px; height: 40px; object-fit:contain" src="${flagUrl}" alt="${fullCountryName}"> ${fullCountryName}</div>` },
        { name: "Height <span id='AddedValue'>(cm)</span>", value: player.height_cm },
        { name: "Preferred Foot", value: player.preferred_foot },
        { name: "Date Of Birth", value: `${player.born} (${player.age})` },
        { name: "Weekly Salary", value: `${player.wage_eur} €` },
        { name: "Position", value: player.pos },
        { name: "All Positions", value: player.pos === player.alter_position ? player.pos : `${player.pos}, ${player.alter_position}` || "N/A" },

        { type: "header", name: "Attack" },
        { name: "Goals", value: player.Performance_Gls },
        { name: "Goals per Match", value: player['Playing Time_MP'] ? (player.Performance_Gls / player['Playing Time_MP']).toFixed(2) : "N/A" },
        { name: "Penalties <span id='AddedValue'>(Scored)</span>", value: `${player.Standard_PKatt} <span id='AddedValue'>(${player.Standard_PK})</span>` },
        { name: "Free Kicks", value: player.Standard_FK },
        { name: "Shots <span id='AddedValue'>(on Target)</span>", value: `${player.Standard_Sh} <span id='AddedValue'>(${player.Standard_SoT})</span>` },

        { type: "header", name: "Team Play" },
        { name: "Appearances <span id='AddedValue'>(Subs)</span>", value: `${player['Playing Time_MP']} <span id='AddedValue'>(${player['Playing Time_MP'] - player['Playing Time_Starts']})</span>` },
        { name: "Assists", value: player.Performance_Ast },
        { name: "Assists per Match", value: player['Playing Time_MP'] ? (player.Performance_Ast / player['Playing Time_MP']).toFixed(2) : "N/A" },
        { name: "Passes <span id='AddedValue'>(Completed)</span>", value: `${player.Total_Att} <span id='AddedValue'>(${player.Total_Cmp})</span>` },
        { name: "Touches <span id='AddedValue'>(on Area)</span>", value: player['Touches_Att Pen'] },
        { name: "Key Passes", value: player.KP },

        { type: "header", name: "Performance" },
        { name: "Minutes Played", value: player.PlayingTime_Min },
        { name: "Expected Goals (xG)", value: player.Expected_xG },
        { name: "Expected Assists (xA)", value: player.Expected_xAG },
        { name: "xG+xAG", value: player['Expected_npxG+xAG'] },

        { type: "header", name: "Discipline" },
        { name: "Yellow Cards", value: player['Performance_CrdY'] },
        { name: "Red Cards", value: player['Performance_CrdR'] },
    ];

    const detailedStatsContainer = document.querySelector(".detailed-stats");
    if (detailedStatsContainer) {
        detailedStatsContainer.innerHTML = ''; // Clear existing content

        let currentGroup = null;

        detailedStats.forEach(stat => {
            if (stat.type === "header") {
                // Close the previous group if it exists
                if (currentGroup) {
                    detailedStatsContainer.appendChild(currentGroup);
                }

                // Create a new group for the header and its stats
                currentGroup = document.createElement('div');
                currentGroup.className = 'stats-group';

                // Add the header
                const headerElement = document.createElement('div');
                headerElement.className = 'detailed-stat-header';
                headerElement.innerHTML = `<h3>${stat.name}</h3>`;
                currentGroup.appendChild(headerElement);
            } else {
                // Add the stat to the current group
                const statElement = document.createElement('div');
                statElement.className = 'detailed-stat-item';
                statElement.innerHTML = `
                    <span class="detailed-stat-name">${stat.name}</span>
                    <span class="detailed-stat-value">${stat.value}</span>
                `;
                currentGroup.appendChild(statElement);
            }
        });

        // Append the last group
        if (currentGroup) {
            detailedStatsContainer.appendChild(currentGroup);
        }
    } else {
        console.error("Element with class 'detailed-stats' not found.");
    }

    // Create the spider chart
    createSpiderChart(player);
    createTouchesBarChart(player);


    // Display historical performance using all seasons
    displayHistoricalPerformance(player, allPlayers);
}

// Load player data based on the extracted parameters
async function loadPlayerDetails() {
    const { playerName, season } = getQueryParams();

    if (!playerName) {
        console.error('No player name provided in the URL.');
        return;
    }

    // Load all players data (for historical performance)
    const allPlayers = await loadCSVData(); // Load all data (no season filter)

    // Load filtered players data (for main player details)
    const filteredPlayers = await loadCSVData(season); // Filter by selected season

    // Debug: Log the players data
    console.log("All Players Data (For Historical Performance):", allPlayers);
    console.log("Filtered Players Data (For Main Details):", filteredPlayers);

    // Find the player in the filtered dataset (for main details)
    const player = filteredPlayers.find(p => p.player.toLowerCase() === playerName.toLowerCase());

    // Debug: Log the player being searched for
    console.log("Searching for Player:", playerName);
    console.log("Player Found:", player);

    if (player) {
        // Display main player details using filtered data (for the selected season)
        await displayPlayerDetails(player, season, allPlayers); // Pass allPlayers for historical performance
    } else {
        console.error('Player not found in the dataset.');
        document.getElementById('playerName').textContent = 'Player Not Found';
    }
}

// Initialize player details page
document.addEventListener("DOMContentLoaded", loadPlayerDetails);