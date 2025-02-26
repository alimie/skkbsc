const USAGE_API_URL = "https://app.nocodb.com/api/v2/tables/mwhjxp9f2hp8ld1/records";  
const BOOKINGS_API_URL = "https://app.nocodb.com/api/v2/tables/mwhjxp9f2hp8ld1/records";
const NOCO_API_KEY = "_95xdb1wWv0CiD4ZNmRft3ogUwSorjxsK8S46-FA";

// Load previous bookings
async function loadBookings() {
    let response = await fetch(BOOKINGS_API_URL, {
        headers: { "xc-auth": NOCO_API_KEY }
    });
    let data = await response.json();
    
    let bookingSelect = document.getElementById("bookingSelect");
    bookingSelect.innerHTML = '<option value="">Select a Booking</option>';

    data.list.forEach(record => {
        let option = document.createElement("option");
        option.value = record.id;
        option.textContent = `${record.fields.Date} - ${record.fields.Class} (${record.fields.Teacher})`;
        bookingSelect.appendChild(option);
    });
}

// Save a new usage record
async function saveUsage(event) {
    event.preventDefault();
    let bookingId = document.getElementById("bookingSelect").value;
    let usageDetails = document.getElementById("usageDetails").value;

    if (!bookingId) {
        alert("Please select a booking.");
        return;
    }

    let response = await fetch(USAGE_API_URL, {
        method: "POST",
        headers: {
            "xc-auth": NOCO_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fields: { BookingID: bookingId, UsageDetails: usageDetails }
        })
    });

    if (response.ok) {
        loadUsages();
    } else {
        console.error("Error saving usage record");
    }
}

// Load recorded usages
async function loadUsages() {
    let response = await fetch(USAGE_API_URL, {
        headers: { "xc-auth": NOCO_API_KEY }
    });
    let data = await response.json();
    
    let tableBody = document.getElementById("usageTableBody");
    tableBody.innerHTML = "";

    data.list.forEach(record => {
        let row = `<tr>
            <td>${record.fields.Date}</td>
            <td>${record.fields.Class}</td>
            <td>${record.fields.Teacher}</td>
            <td>${record.fields.UsageDetails}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteUsage('${record.id}')">Delete</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Delete usage
async function deleteUsage(id) {
    let response = await fetch(`${USAGE_API_URL}/${id}`, {
        method: "DELETE",
        headers: { "xc-auth": NOCO_API_KEY }
    });

    if (response.ok) {
        loadUsages();
    } else {
        console.error("Error deleting usage record");
    }
}

// Export Usage CSV
function exportUsageCSV() {
    let rows = [["Date", "Class", "Teacher", "Usage Details"]];
    document.querySelectorAll("#usageTableBody tr").forEach(row => {
        let cols = row.querySelectorAll("td");
        rows.push([...cols].slice(0, 4).map(col => col.innerText));
    });

    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Lab_Usage_Records.csv");
    document.body.appendChild(link);
    link.click();
}

// Export Usage PDF
function exportUsagePDF() {
    let { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    let img = new Image();
    img.src = "logo.png";
    doc.addImage(img, "PNG", 10, 10, 30, 30);

    doc.setFontSize(18);
    doc.text("Science Lab Usage Record", 60, 20);

    let rows = [];
    document.querySelectorAll("#usageTableBody tr").forEach(row => {
        let cols = row.querySelectorAll("td");
        rows.push([...cols].slice(0, 4).map(col => col.innerText));
    });

    doc.autoTable({
        head: [["Date", "Class", "Teacher", "Usage Details"]],
        body: rows,
        startY: 50
    });

    doc.save("Lab_Usage_Records.pdf");
}

// Initialize
document.getElementById("usageForm").addEventListener("submit", saveUsage);
loadBookings();
loadUsages();
