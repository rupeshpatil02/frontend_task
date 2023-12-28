let data;
let multipleWinsLaureates = new Set();
let laureateWinsCount = new Map();

async function fetchData() {
    try {
        // Fetch prize data
        let prizeUrl = 'https://api.nobelprize.org/v1/prize.json';
        let prizeData = await fetch(prizeUrl);
        data = await prizeData.json();

        // Extract unique categories and years between 1900 and 2018
        const categories = getUniqueCategories(data.prizes);
        const years = getYearsBetween(1900, 2018);

        // Populate dropdowns with all categories and years
        populateDropdown('categoryFilter', ['All Categories', ...categories]);
        populateDropdown('yearFilter', ['All Years', ...years]);

        // Fetch laureate data
        let laureateUrl = 'https://api.nobelprize.org/v1/laureate.json';
        let laureateData = await fetch(laureateUrl);
        let laureateJson = await laureateData.json();

        // Check if laureate data is available
        if (laureateJson.laureates) {
            // Identify laureates with multiple wins
            identifyMultipleWinsLaureates(data.prizes, laureateJson.laureates);

            // Display initial list
            displayPrizeWinners(data.prizes);
            displayMultipleWinsLaureates(laureateJson.laureates);
        } else {
            console.error('Error: Data not found!');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function getUniqueCategories(prizes) {
    return Array.from(new Set(prizes.map(prize => prize.category)));
}

function getYearsBetween(start, end) {
    const years = [];
    for (let year = start; year <= end; year++) {
        years.push(year.toString());
    }
    return years;
}

function populateDropdown(dropdownId, options) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = ''; // Clear previous content
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        dropdown.appendChild(optionElement);
    });
}

function identifyMultipleWinsLaureates(prizes, laureates) {
    const laureatesWinsCount = new Map();

    prizes.forEach(prize => {
        if (prize.laureates) {
            prize.laureates.forEach(laureate => {
                if (laureatesWinsCount.has(laureate.id)) {
                    laureatesWinsCount.set(laureate.id, laureatesWinsCount.get(laureate.id) + 1);
                    if (laureatesWinsCount.get(laureate.id) > 1) {
                        multipleWinsLaureates.add(laureate.id);
                    }
                } else {
                    laureatesWinsCount.set(laureate.id, 1);
                }
            });
        }
    });

    // Update the laureateWinsCount to ensure all laureates are included
    laureates.forEach(laureate => {
        if (!laureatesWinsCount.has(laureate.id)) {
            laureatesWinsCount.set(laureate.id, 0);
        }
    });

    laureateWinsCount = laureatesWinsCount;
}


function displayPrizeWinners(prizes) {
    const prizeListContainer = document.getElementById('prizeList');
    prizeListContainer.innerHTML = ''; // Clear previous content

    prizes.forEach(prize => {
        const prizeItem = document.createElement('li');
        prizeItem.innerHTML = `<strong>Year:</strong> ${prize.year}<br>
                              <strong>Category:</strong> ${prize.category}<br>
                              <strong>Laureates:</strong><ul>${getLaureatesList(prize.laureates)}</ul>`;
        prizeListContainer.appendChild(prizeItem);
    });
}

function getLaureatesList(laureates) {
    if (laureates) {
        return laureates.map(laureate => `<li>ID: ${laureate.id}, Name: ${laureate.firstname} ${laureate.surname},  Motivation: ${laureate.motivation}</li>`).join('');
    } else {
        return '<li>No laureates for this prize</li>';
    }
}

function displayMultipleWinsLaureates(laureates) {
    const multipleWinsListContainer = document.getElementById('multipleWinsList');
    multipleWinsListContainer.innerHTML = ''; // Clear previous content

    const laureatesWithMultipleWins = laureates.filter(laureate =>
        multipleWinsLaureates.has(laureate.id)
    );

    laureatesWithMultipleWins.forEach(laureate => {
        const laureateItem = document.createElement('li');
        laureateItem.innerHTML = `<strong>Name:</strong> ${laureate.firstname} ${laureate.surname}<br>
                                  <strong>ID:</strong> ${laureate.id}<br>
                                  <strong>Wins:</strong> ${laureateWinsCount.get(laureate.id) || 0}<br>`;
        multipleWinsListContainer.appendChild(laureateItem);
    });
}

function filterPrizes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const selectedYear = document.getElementById('yearFilter').value;

    const filteredPrizes = data.prizes.filter(prize =>
        (selectedCategory === 'All Categories' || prize.category === selectedCategory) &&
        (selectedYear === 'All Years' || prize.year === selectedYear)
    );

    displayPrizeWinners(filteredPrizes);
    displayMultipleWinsLaureates(data.laureates);
}

fetchData();