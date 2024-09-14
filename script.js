// Create a seating layout with 11 rows of 7 seats and 1 row of 3 seats
const rows = Array(11).fill().map(() => Array(7).fill(false)).concat([Array(3).fill(false)]);

// Randomly pre-book some seats (between 5 and 20 seats)
function randomlyPreBookSeats() {
    const totalSeats = rows.flat().length; // Total number of seats (80 in this case)
    const randomSeatsToBook = Math.floor(Math.random() * (20 - 5 + 1)) + 5; // Randomly choose between 5 and 20 seats to pre-book

    let bookedSeatsCount = 0;

    while (bookedSeatsCount < randomSeatsToBook) {
        const randomSeat = Math.floor(Math.random() * totalSeats); // Pick a random seat number
        const rowIndex = Math.floor(randomSeat / 7); // Which row (0 to 11 for 7-seat rows, 12 for the 3-seat row)
        const seatIndex = randomSeat % rows[rowIndex].length; // Which seat in the row

        // Ensure the seat is not already booked
        if (!rows[rowIndex][seatIndex]) {
            rows[rowIndex][seatIndex] = true; // Book the seat
            bookedSeatsCount++;
        }
    }
}

randomlyPreBookSeats(); // Call the function to pre-book some random seats

const seatLayout = document.getElementById('seat-layout');
const seatCountInput = document.getElementById('seat-count');
const bookSeatsButton = document.getElementById('book-seats');
const messageDiv = document.getElementById('message');
const availableSeatsDiv = document.getElementById('available-seats');

// Function to render the seating layout
function renderSeats() {
    seatLayout.innerHTML = '';
    rows.forEach((row, rowIndex) => {
        row.forEach((seat, seatIndex) => {
            const seatElement = document.createElement('div');
            seatElement.className = 'seat' + (seat ? ' booked' : '');
            seatElement.textContent = `R${rowIndex + 1}S${seatIndex + 1}`;
            seatElement.dataset.row = rowIndex; // Store row index for scrolling
            seatElement.dataset.seat = seatIndex; // Store seat index for scrolling
            seatLayout.appendChild(seatElement);
        });
    });
    updateAvailableSeats(); // Update available seat count
}

// Function to count available seats
function countAvailableSeats() {
    let count = 0;
    rows.forEach(row => {
        row.forEach(seat => {
            if (!seat) count++;
        });
    });
    return count;
}

// Function to update available seats display
function updateAvailableSeats() {
    const availableSeats = countAvailableSeats();
    availableSeatsDiv.textContent = `Available seats: ${availableSeats}`;
}

// Check if enough seats are available
function areSeatsAvailable(num) {
    let availableSeats = 0;
    let contiguousAvailable = false;

    // Check for contiguous seats in one row
    rows.forEach(row => {
        for (let j = 0; j <= row.length - num; j++) {
            if (row.slice(j, j + num).every(seat => !seat)) {
                contiguousAvailable = true;
                break;
            }
        }
    });

    // If contiguous seats are not available, check for any available seats
    if (!contiguousAvailable) {
        rows.forEach(row => {
            row.forEach(seat => {
                if (!seat) availableSeats++;
            });
        });
    }

    return contiguousAvailable || availableSeats >= num;
}

// Check if all seats are filled
function areAllSeatsFilled() {
    return rows.every(row => row.every(seat => seat));
}

// Function to find and book seats in fewest rows
function findAndBookSeats(num) {
    let seatsBooked = [];
    let seatsNeeded = num;

    // First, try to find and book contiguous seats in one row
    for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j <= rows[i].length - num; j++) {
            if (rows[i].slice(j, j + num).every(seat => !seat)) {
                for (let k = j; k < j + num; k++) {
                    rows[i][k] = true;
                    seatsBooked.push(`R${i + 1}S${k + 1}`);
                }
                return seatsBooked;
            }
        }
    }

    // If contiguous seats are not available, find nearby seats across fewest rows
    let availableSeats = [];
    for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < rows[i].length; j++) {
            if (!rows[i][j]) {
                availableSeats.push({ row: i, seat: j });
                seatsNeeded--;

                if (seatsNeeded === 0) {
                    break;
                }
            }
        }
        if (seatsNeeded === 0) {
            break;
        }
    }

    if (seatsNeeded === 0) {
        // Book the nearby seats across fewest rows
        availableSeats.slice(0, num).forEach(seat => {
            rows[seat.row][seat.seat] = true;
            seatsBooked.push(`R${seat.row + 1}S${seat.seat + 1}`);
        });
    }

    return seatsBooked;
}

// Function to scroll to the first booked seat if it's not visible
function scrollToBookedSeats(seats) {
    if (seats.length > 0) {
        const firstSeat = document.querySelector(`.seat:not(.booked)`);
        if (firstSeat) {
            firstSeat.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }
}

// Event listener for booking seats
bookSeatsButton.addEventListener('click', () => {
    const numSeats = parseInt(seatCountInput.value);
    if (isNaN(numSeats) || numSeats < 1 || numSeats > 7) {
        messageDiv.textContent = 'Please enter a valid number of seats between 1 and 7.';
        seatCountInput.value = '';
        return;
    }

    if (!areSeatsAvailable(numSeats)) {
        messageDiv.textContent = 'Not enough seats available. Remaining seats: ' + countAvailableSeats();
        return;
    }

    if (areAllSeatsFilled()) {
        messageDiv.textContent = 'All seats are filled. No seats available.';
        return;
    }

    const bookedSeats = findAndBookSeats(numSeats);
    renderSeats();
    scrollToBookedSeats(bookedSeats); // Scroll to the booked seats
    messageDiv.innerHTML = `Seats booked: ${bookedSeats.join(', ')}<br>Thank you for booking!`;
    seatCountInput.value = '';
});

// Event listener for Enter key
seatCountInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        bookSeatsButton.click();
    }
});

// Initial rendering of seats
renderSeats();