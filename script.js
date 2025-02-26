const NOCO_API_URL = "https://app.nocodb.com/api/v2/tables/mwhjxp9f2hp8ld1/records";  
const NOCO_API_KEY = "_95xdb1wWv0CiD4ZNmRft3ogUwSorjxsK8S46-FA";

// Fetch bookings from NocoDB
async function loadBookings() {
    let response = await fetch(NOCO_API_URL, {
        headers: { "xc-auth": NOCO_API_KEY }
    });
    let data = await response.json();
    let bookings = data.list.map(record => ({
        id: record.id,  
        ...record.fields
    }));
    updateTable(bookings);
}

// Save a new booking
async function saveBooking(event) {
    event.preventDefault();
    let date = document.getElementById("date").value;
    let className = document.getElementById("class").value;
    let teacher = document.getElementById("teacher").value;
    let startTime = document.getElementById("startTime").value;
    let endTime = document.getElementById("endTime").value;

    let response = await fetch(NOCO_API_URL, {
        method: "POST",
        headers: {
            "xc-auth": NOCO_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fields: { Date: date, Class: className, Teacher: teacher, StartTime: startTime, EndTime: endTime }
        })
    });

    if (response.ok) {
        loadBookings();
    } else {
        console.error("Error saving booking");
    }
}

// Delete booking
async function deleteBooking(id) {
    let response = await fetch(`${NOCO_API_URL}/${id}`, {
        method: "DELETE",
        headers: { "xc-auth": NOCO_API_KEY }
    });

    if (response.ok) {
        loadBookings();
    } else {
        console.error("Error deleting booking");
    }
}

// Update table
function updateTable(bookings) {
    let tableBody = document.getElementById("bookingTableBody");
    tableBody.innerHTML = "";

    bookings.forEach(booking => {
        let row = `<tr>
            <td>${booking.Date}</td>
            <td>${booking.Class}</td>
            <td>${booking.Teacher}</td>
            <td>${booking.StartTime}</td>
            <td>${booking.EndTime}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteBooking('${booking.id}')">Delete</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Export CSV
function exportCSV() {
    let rows = [["Date", "Class", "Teacher", "Start Time", "End Time"]];
    document.querySelectorAll("#bookingTableBody tr").forEach(row => {
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

// Export PDF
function exportPDF() {
    let { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    let img = new Image();
    img.src = "logo.png"; // Add your logo file here
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

// Initialize
document.getElementById("bookingForm").addEventListener("submit", saveBooking);
loadBookings();
