document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("bookingForm");
    const bookingTableBody = document.getElementById("bookingTableBody");
    const downloadCSV = document.getElementById("download-bookings-csv");

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    function updateTable() {
        bookingTableBody.innerHTML = "";
        bookings.forEach((booking, index) => {
            let row = `<tr>
                <td>${booking.date}</td>
                <td>${booking.day}</td>
                <td>${booking.class}</td>
                <td>${booking.teacher}</td>
                <td>${booking.startTime}</td>
                <td>${booking.endTime}</td>
                <td><button class="btn btn-danger btn-sm delete-btn" data-index="${index}">Delete</button></td>
            </tr>`;
            bookingTableBody.innerHTML += row;
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function () {
                let index = this.getAttribute("data-index");
                bookings.splice(index, 1);
                localStorage.setItem("bookings", JSON.stringify(bookings));
                updateTable();
            });
        });
    }

    bookingForm.addEventListener("submit", function (e) {
        e.preventDefault();
        
        let date = document.getElementById("bookingDate").value;
        let className = document.getElementById("bookingClass").value;
        let teacher = document.getElementById("bookingTeacher").value;
        let startTime = document.getElementById("startTime").value;
        let endTime = document.getElementById("endTime").value;

        if (!date || !className || !teacher || !startTime || !endTime) {
            alert("Please fill in all fields.");
            return;
        }

        let day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        let newBooking = { date, day, class: className, teacher, startTime, endTime };
        bookings.push(newBooking);
        localStorage.setItem("bookings", JSON.stringify(bookings));

        updateTable();
        bookingForm.reset();
    });

    downloadCSV.addEventListener("click", function () {
        let csvContent = "Date,Day,Class,Teacher,Start Time,End Time\n";
        bookings.forEach(booking => {
            csvContent += `${booking.date},${booking.day},${booking.class},${booking.teacher},${booking.startTime},${booking.endTime}\n`;
        });

        let blob = new Blob([csvContent], { type: "text/csv" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "lab_bookings.csv";
        link.click();
    });

    updateTable();
});
