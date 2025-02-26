const NOCO_API_URL = "https://app.nocodb.com/api/v2/tables/mwhjxp9f2hp8ld1/records";  // Example: "https://nocodb.example.com/api/v1/tables/LabBookings/records"
const NOCO_API_KEY = "_95xdb1wWv0CiD4ZNmRft3ogUwSorjxsK8S46-FA";  // Get from API Docs

// Fetch existing bookings
async function loadBookings() {
    let response = await fetch(NOCO_API_URL, {
        headers: {
            "xc-auth": NOCO_API_KEY
        }
    });
    let data = await response.json();
    let bookings = data.list.map(record => ({
        id: record.id,  // Store ID for deletion
        ...record.fields
    }));
    updateTable(bookings);
}

// Save new booking
async function saveBooking(date, className, teacher, startTime, endTime) {
    let response = await fetch(NOCO_API_URL, {
        method: "POST",
        headers: {
            "xc-auth": NOCO_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fields: {
                "Date": date,
                "Class": className,
                "Teacher": teacher,
                "Start Time": startTime,
                "End Time": endTime
            }
        })
    });

    if (response.ok) {
        loadBookings(); // Refresh list after saving
    } else {
        console.error("Error saving booking");
    }
}

// Delete booking by ID
async function deleteBooking(id) {
    let response = await fetch(`${NOCO_API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            "xc-auth": NOCO_API_KEY
        }
    });

    if (response.ok) {
        loadBookings(); // Refresh list after deletion
    } else {
        console.error("Error deleting booking");
    }
}

// Update table with booking data
function updateTable(bookings) {
    let tableBody = document.getElementById("bookingTableBody");
    tableBody.innerHTML = "";

    bookings.forEach(booking => {
        let row = `<tr>
            <td>${booking.Date}</td>
            <td>${booking.Class}</td>
            <td>${booking.Teacher}</td>
            <td>${booking["Start Time"]}</td>
            <td>${booking["End Time"]}</td>
            <td><button onclick="deleteBooking('${booking.id}')">Delete</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Export CSV
function exportCSV() {
    let rows = [["Date", "Class", "Teacher", "Start Time", "End Time"]];
    let tableRows = document.querySelectorAll("#bookingTableBody tr");

    tableRows.forEach(row => {
        let cols = row.querySelectorAll("td");
        rows.push([...cols].slice(0, 5).map(col => col.innerText));
    });

    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Lab_Bookings.csv");
    document.body.appendChild(link);
    link.click();
}

// Export PDF with table and logo
function exportPDF() {
    let { jsPDF } = window.jspdf;
    let doc = new jsPDF();
    
    let img = new Image();
    img.src = "logo.png"; // Add your logo here
    doc.addImage(img, "PNG", 10, 10, 30, 30);
    
    doc.setFontSize(18);
    doc.text("Science Lab Usage Record", 60, 20);

    let rows = [];
    document.querySelectorAll("#bookingTableBody tr").forEach(row => {
        let cols = row.querySelectorAll("td");
        rows.push([...cols].slice(0, 5).map(col => col.innerText));
    });

    doc.autoTable({
        head: [["Date", "Class", "Teacher", "Start Time", "End Time"]],
        body: rows,
        startY: 50
    });

    doc.save("Lab_Bookings.pdf");
}

// Load data on page start
loadBookings();
