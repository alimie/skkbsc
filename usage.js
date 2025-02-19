document.addEventListener("DOMContentLoaded", function () {
    const usageForm = document.getElementById("usageForm");
    const usageTableBody = document.getElementById("usageTableBody");
    const downloadPDF = document.getElementById("download-usage-pdf");

    let usageRecords = JSON.parse(localStorage.getItem("usageRecords")) || [];
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    function populateClassOptions() {
        const classSelect = document.getElementById("usageClass");
        classSelect.innerHTML = "";
        bookings.forEach(booking => {
            let option = document.createElement("option");
            option.value = booking.class;
            option.textContent = `${booking.class} (${booking.date})`;
            classSelect.appendChild(option);
        });
    }

    function updateTable() {
        usageTableBody.innerHTML = "";
        usageRecords.forEach((record, index) => {
            let row = `<tr>
                <td>${record.date}</td>
                <td>${record.class}</td>
                <td>${record.teacher}</td>
                <td>${record.experimentDetails}</td>
                <td><button class="btn btn-danger btn-sm delete-btn" data-index="${index}">Delete</button></td>
            </tr>`;
            usageTableBody.innerHTML += row;
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function () {
                let index = this.getAttribute("data-index");
                usageRecords.splice(index, 1);
                localStorage.setItem("usageRecords", JSON.stringify(usageRecords));
                updateTable();
            });
        });
    }

    usageForm.addEventListener("submit", function (e) {
        e.preventDefault();

        let date = document.getElementById("usageDate").value;
        let className = document.getElementById("usageClass").value;
        let teacher = document.getElementById("usageTeacher").value;
        let experimentDetails = document.getElementById("experimentDetails").value;

        if (!date || !className || !teacher || !experimentDetails) {
            alert("Please fill in all fields.");
            return;
        }

        let newRecord = { date, class: className, teacher, experimentDetails };
        usageRecords.push(newRecord);
        localStorage.setItem("usageRecords", JSON.stringify(usageRecords));

        updateTable();
        usageForm.reset();
    });

    downloadPDF.addEventListener("click", function () {
        if (usageRecords.length === 0) {
            alert("No records to download!");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Load the logo as Base64
        const logoUrl = "logo.png";

        let img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = logoUrl;
        img.onload = function () {
            // Add Logo
            doc.addImage(img, "PNG", 15, 10, 20, 20);

            // Add Title
            doc.setFont("helvetica", "bold");
            doc.text("Science Lab Usage Record", 70, 20);

            // Add Table
            doc.autoTable({
                startY: 40,
                head: [["Date", "Class", "Teacher", "Experiment"]],
                body: usageRecords.map(record => [record.date, record.class, record.teacher, record.experimentDetails]),
                styles: { font: "helvetica", fontSize: 10, cellPadding: 2 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 12 },
                alternateRowStyles: { fillColor: [240, 240, 240] },
                theme: "grid"
            });

            // Save PDF
            doc.save("Science_Lab_Usage_Record.pdf");
        };

        img.onerror = function () {
            alert("Failed to load logo. Please check the URL.");
        };
    });

    populateClassOptions();
    updateTable();
});
