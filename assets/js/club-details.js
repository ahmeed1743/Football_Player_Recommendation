document.addEventListener("DOMContentLoaded", function () {
    // Extract club details from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const clubName = urlParams.get('club');
    const league = urlParams.get('league');
    const season = urlParams.get('season');

    // Set club information
    const formattedSeason = `${season.slice(0, 2)}/${season.slice(2)}`;
    document.getElementById('clubName').textContent = clubName;
    document.getElementById('clubLeague').textContent = `${league}`;
    document.getElementById('clubSeason').textContent = `${formattedSeason}`;
    document.getElementById('clubLogo').src = `assets/imgs/logos/${encodeURIComponent(clubName.toLowerCase())}.png`;

    // Fetch player data from CSV
    async function fetchPlayerData() {
        try {
            const response = await fetch('assets/data/final_filtered_data.csv');
            const csvData = await response.text();
            const parsedData = Papa.parse(csvData, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            }).data;

            // Filter out players with missing or invalid season data
            const validPlayers = parsedData.filter(player => player.season != null && player.season !== "");

            // Filter players for the selected club, league, and season
            const players = validPlayers.filter(player => {
                const playerTeam = String(player.team || "").trim().toLowerCase();
                const playerLeague = String(player.league || "").trim().toLowerCase();
                const playerSeason = String(player.season || "").trim().toLowerCase();

                return (
                    playerTeam === clubName.trim().toLowerCase() &&
                    playerLeague === league.trim().toLowerCase() &&
                    playerSeason === season.trim().toLowerCase()
                );
            });

            if (players.length === 0) {
                const noPlayersMessage = document.createElement('p');
                noPlayersMessage.textContent = 'No players found for the selected club, league, and season.';
                document.querySelector('.player-tables').appendChild(noPlayersMessage);
            } else {
                // Define table configurations
                const tableConfigs = [
                    {
                        id: 'passingTable',
                        sortKey: 'Total_Cmp%',
                        columnName: 'Pass Accuracy',
                        formatValue: (value) => `${value}%`
                    },
                    {
                        id: 'goalsTable',
                        sortKey: 'Performance_Gls',
                        columnName: 'Goals',
                        formatValue: (value) => value
                    },
                    {
                        id: 'appearancesTable',
                        sortKey: 'Playing Time_MP',
                        columnName: 'Appearances',
                        formatValue: (value) => value
                    },
                    {
                        id: 'expectedGoalsTable',
                        sortKey: 'Expected_xG',
                        columnName: 'Expected Goals',
                        formatValue: (value) => value
                    },
                    {
                        id: 'expectedAssistsTable',
                        sortKey: 'Expected_xAG',
                        columnName: 'Expected Assists',
                        formatValue: (value) => value
                    },
                    {
                        id: 'keyPassesTable',
                        sortKey: 'KP',
                        columnName: 'Key Passes',
                        formatValue: (value) => value
                    },
                    {
                        id: 'shotsTable',
                        sortKey: 'Standard_Sh',
                        columnName: 'Shots',
                        formatValue: (value) => value
                    },
                    {
                        id: 'tacklesTable',
                        sortKey: 'Tackles_Tkl',
                        columnName: 'Tackles',
                        formatValue: (value) => value
                    },
                    {
                        id: 'shortPassTable',
                        sortKey: 'Short_Cmp%',
                        columnName: 'Short Pass Accuracy',
                        formatValue: (value) => `${value}%`
                    },
                    {
                        id: 'longPassTable',
                        sortKey: 'Long_Cmp%',
                        columnName: 'Long Pass Accuracy',
                        formatValue: (value) => `${value}%`
                    },
                    {
                        id: 'mediumPassTable',
                        sortKey: 'Medium_Cmp%',
                        columnName: 'Medium Pass Accuracy',
                        formatValue: (value) => `${value}%`
                    },
                    {
                        id: 'minutesPlayedTable',
                        sortKey: 'PlayingTime_Min',
                        columnName: 'Minutes Played',
                        formatValue: (value) => value
                    },
                    {
                        id: 'paceTable',
                        sortKey: 'pace',
                        columnName: 'Pace (km/h)',
                        formatValue: (value) => `${value} km/h`
                    }
                ];

                // Populate tables dynamically
                tableConfigs.forEach(config => {
                    const tableBody = document.querySelector(`#${config.id} tbody`);
                    const viewFullButton = document.querySelector(`#${config.id} .view-full-list`);
                    let isShowingFullList = false; // Track the current state

                    // Function to render rows
                    const renderRows = (playersToRender) => {
                        tableBody.innerHTML = ''; // Clear existing rows

                        // Sort players in descending order based on the sortKey
                        const sortedPlayers = playersToRender.sort((a, b) => b[config.sortKey] - a[config.sortKey]);

                        sortedPlayers.forEach((player, index) => {
                            const row = document.createElement('tr');

                            // Add a special class to the first row
                            if (index === 0) {
                                row.classList.add('first-row');
                            }

                            row.innerHTML = `
                                <td>${index + 1}</td>
                                <td>${player.player}</td>
                                <td>${config.formatValue(player[config.sortKey] || 0)}</td>
                            `;
                            tableBody.appendChild(row);
                        });
                    };

                    // Initially show only the top 4 rows (sorted in descending order)
                    const sortedPlayers = players.sort((a, b) => b[config.sortKey] - a[config.sortKey]);
                    renderRows(sortedPlayers.slice(0, 4));

                    // Add "View Full List" button functionality
                    viewFullButton.addEventListener('click', () => {
                        if (isShowingFullList) {
                            // Show only the top 4 rows (sorted in descending order)
                            renderRows(sortedPlayers.slice(0, 4));
                            viewFullButton.textContent = 'View Full List';
                        } else {
                            // Show all rows (sorted in descending order)
                            renderRows(sortedPlayers);
                            viewFullButton.textContent = 'Show Less';
                        }
                        isShowingFullList = !isShowingFullList; // Toggle the state
                    });
                });

                // Calculate team statistics
                const totalPlayers = players.length;
                const totalAge = players.reduce((sum, player) => sum + (parseInt(player.age) || 0), 0);
                const totalGoals = players.reduce((sum, player) => sum + (parseInt(player.Performance_Gls) || 0), 0);
                const totalAssists = players.reduce((sum, player) => sum + (parseInt(player.Performance_Ast) || 0), 0);
                const totalPassAccuracy = players.reduce((sum, player) => sum + (parseFloat(player['Total_Cmp%']) || 0), 0);

                const averageAge = (totalAge / totalPlayers).toFixed(1);
                const averagePassAccuracy = (totalPassAccuracy / totalPlayers).toFixed(1);

                // Display team statistics
                document.getElementById('averageAge').textContent = averageAge;
                document.getElementById('totalGoals').textContent = totalGoals;
                document.getElementById('totalAssists').textContent = totalAssists;
                document.getElementById('totalPassAccuracy').textContent = `${averagePassAccuracy}%`;
            }
        } catch (error) {
            console.error('Error fetching player data:', error);
        }
    }

    // Fetch and display player data
    fetchPlayerData();
});