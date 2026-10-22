/* =====================================================
   MEDCARE - MEDICINE REMINDER SYSTEM
===================================================== */

const STORAGE_KEY = "medcare_medicines";
const TAKEN_KEY = "medcare_tracking";


// -----------------------------------------------------
// GET DATA
// -----------------------------------------------------

function getMedicines() {
    return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );
}


function saveMedicines(medicines) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(medicines)
    );
}


function getTracking() {
    return JSON.parse(
        localStorage.getItem(TAKEN_KEY) || "[]"
    );
}


function saveTracking(data) {
    localStorage.setItem(
        TAKEN_KEY,
        JSON.stringify(data)
    );
}


// -----------------------------------------------------
// NOTIFICATION PERMISSION
// -----------------------------------------------------

async function requestNotificationPermission() {

    if (!("Notification" in window)) {
        alert(
            "Your browser does not support notifications."
        );
        return;
    }

    if (Notification.permission === "default") {

        await Notification.requestPermission();

    }

    if (Notification.permission === "granted") {

        showBrowserNotification(
            "MedCare Notifications Enabled",
            "You will receive medicine reminders here."
        );

    }
}


// -----------------------------------------------------
// BROWSER NOTIFICATION
// -----------------------------------------------------

function showBrowserNotification(title, body) {

    if (
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {
        return;
    }

    const notification =
        new Notification(title, {
            body: body,
            icon: "https://cdn-icons-png.flaticon.com/512/2966/2966486.png",
            badge: "https://cdn-icons-png.flaticon.com/512/2966/2966486.png"
        });

    notification.onclick = function () {

        window.focus();

        window.location.href =
            "reminders.html";

    };
}


// -----------------------------------------------------
// REMINDER SOUND
// -----------------------------------------------------

function playReminderSound() {

    try {

        const audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = 800;

        gain.gain.setValueAtTime(
            0.2,
            audioContext.currentTime
        );

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.7
        );

    } catch (error) {

        console.log(
            "Sound unavailable"
        );

    }
}


// -----------------------------------------------------
// TODAY DATE
// -----------------------------------------------------

function getToday() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// -----------------------------------------------------
// CREATE MEDICINE
// -----------------------------------------------------

function addMedicine(medicine) {

    const medicines =
        getMedicines();

    medicine.id =
        Date.now().toString();

    medicine.createdAt =
        new Date().toISOString();

    medicine.status =
        "Pending";

    medicine.lastReminder =
        null;

    medicines.push(medicine);

    saveMedicines(medicines);

    return medicine;
}


// -----------------------------------------------------
// DELETE MEDICINE
// -----------------------------------------------------

function deleteMedicine(id) {

    let medicines =
        getMedicines();

    medicines =
        medicines.filter(
            medicine =>
                medicine.id !== id
        );

    saveMedicines(medicines);

    renderMedicines();
    updateDashboard();
}


// -----------------------------------------------------
// TAKEN
// -----------------------------------------------------

function markTaken(id) {

    const medicines =
        getMedicines();

    const medicine =
        medicines.find(
            item =>
                item.id === id
        );

    if (!medicine) return;

    medicine.status =
        "Taken";

    medicine.takenAt =
        new Date().toISOString();

    saveMedicines(medicines);


    const tracking =
        getTracking();

    tracking.push({

        id:
            Date.now().toString(),

        medicineId:
            medicine.id,

        medicineName:
            medicine.name,

        profile:
            medicine.profile,

        status:
            "Taken",

        time:
            new Date().toISOString()

    });

    saveTracking(tracking);

    renderMedicines();
    updateDashboard();
}


// -----------------------------------------------------
// MISSED
// -----------------------------------------------------

function markMissed(id) {

    const medicines =
        getMedicines();

    const medicine =
        medicines.find(
            item =>
                item.id === id
        );

    if (!medicine) return;

    medicine.status =
        "Missed";

    medicine.missedAt =
        new Date().toISOString();

    saveMedicines(medicines);


    const tracking =
        getTracking();

    tracking.push({

        id:
            Date.now().toString(),

        medicineId:
            medicine.id,

        medicineName:
            medicine.name,

        profile:
            medicine.profile,

        status:
            "Missed",

        time:
            new Date().toISOString()

    });

    saveTracking(tracking);


    playReminderSound();

    showBrowserNotification(
        "🚨 Medicine Missed",
        `${medicine.name} was not taken on time.`
    );

    renderMedicines();
    updateDashboard();
}


// -----------------------------------------------------
// SNOOZE
// -----------------------------------------------------

function snoozeMedicine(id) {

    const medicines =
        getMedicines();

    const medicine =
        medicines.find(
            item =>
                item.id === id
        );

    if (!medicine) return;

    medicine.snoozeUntil =
        Date.now() +
        (10 * 60 * 1000);

    medicine.status =
        "Snoozed";

    saveMedicines(medicines);

    alert(
        "Reminder snoozed for 10 minutes."
    );

    renderMedicines();
}


// -----------------------------------------------------
// REMINDER CHECK
// -----------------------------------------------------

function checkReminders() {

    const medicines =
        getMedicines();

    const now =
        new Date();

    const today =
        getToday();

    medicines.forEach(
        medicine => {

            if (!medicine.date) {
                return;
            }

            if (medicine.date !== today) {
                return;
            }

            if (
                medicine.status ===
                "Taken"
            ) {
                return;
            }


            const reminderDate =
                new Date(
                    `${medicine.date}T${medicine.time}`
                );


            const difference =
                now.getTime() -
                reminderDate.getTime();


            /*
              Reminder window:
              0 to 5 minutes after scheduled time
            */

            if (
                difference >= 0 &&
                difference <= 5 * 60 * 1000
            ) {

                const reminderKey =
                    `${medicine.id}-${today}-${medicine.time}`;

                if (
                    medicine.lastReminder !==
                    reminderKey
                ) {

                    medicine.lastReminder =
                        reminderKey;

                    saveMedicines(
                        medicines
                    );


                    playReminderSound();


                    showBrowserNotification(
                        "💊 Medicine Reminder",
                        `${medicine.name} - ${medicine.dosage} is due now.`
                    );


                    renderMedicines();

                }

            }


            /*
              Check missed after 15 minutes
            */

            if (
                difference >
                15 * 60 * 1000 &&
                medicine.status ===
                "Pending"
            ) {

                markMissed(
                    medicine.id
                );

            }

        }
    );
}


// -----------------------------------------------------
// RENDER REMINDERS
// -----------------------------------------------------

function renderMedicines() {

    const container =
        document.getElementById(
            "medicine-list"
        );

    if (!container) {
        return;
    }


    const medicines =
        getMedicines();


    if (medicines.length === 0) {

        container.innerHTML = `

            <div class="feature-card">

                <div class="feature-icon">
                    💊
                </div>

                <h3>
                    No Medicines Added
                </h3>

                <p>
                    Add your first medicine
                    to create a reminder.
                </p>

                <br>

                <a
                    href="add-medicine.html"
                    class="btn btn-primary">

                    + Add Medicine

                </a>

            </div>

        `;

        return;
    }


    container.innerHTML =
        medicines.map(
            medicine => `

            <div class="feature-card medicine-item">

                <div class="feature-icon">
                    💊
                </div>

                <h3>
                    ${medicine.name}
                </h3>

                <p>
                    <strong>
                        Profile:
                    </strong>
                    ${medicine.profile}
                </p>

                <p>
                    <strong>
                        Dosage:
                    </strong>
                    ${medicine.dosage}
                </p>

                <p>
                    <strong>
                        Time:
                    </strong>
                    ${medicine.time}
                </p>

                <p>
                    <strong>
                        Food:
                    </strong>
                    ${medicine.food}
                </p>

                <p>
                    <strong>
                        Status:
                    </strong>

                    <span class="medicine-status">
                        ${medicine.status || "Pending"}
                    </span>

                </p>

                <br>

                <button
                    class="btn btn-primary"
                    onclick="markTaken('${medicine.id}')">

                    ✓ Taken

                </button>

                <button
                    class="btn btn-secondary"
                    onclick="snoozeMedicine('${medicine.id}')">

                    ⏰ Snooze

                </button>

                <button
                    class="btn btn-secondary"
                    onclick="editMedicine('${medicine.id}')">

                    ✏️ Edit

                </button>

                <button
                    class="btn btn-secondary"
                    onclick="deleteMedicine('${medicine.id}')">

                    🗑️ Delete

                </button>

            </div>

        `
        ).join("");
}


// -----------------------------------------------------
// EDIT MEDICINE
// -----------------------------------------------------

function editMedicine(id) {

    const medicines =
        getMedicines();

    const medicine =
        medicines.find(
            item =>
                item.id === id
        );

    if (!medicine) return;


    const name =
        prompt(
            "Medicine Name:",
            medicine.name
        );

    if (!name) return;


    const dosage =
        prompt(
            "Dosage:",
            medicine.dosage
        );

    if (!dosage) return;


    const time =
        prompt(
            "Reminder Time (HH:MM):",
            medicine.time
        );

    if (!time) return;


    medicine.name =
        name;

    medicine.dosage =
        dosage;

    medicine.time =
        time;

    medicine.status =
        "Pending";

    medicine.lastReminder =
        null;


    saveMedicines(
        medicines
    );

    renderMedicines();

    alert(
        "Medicine updated successfully."
    );
}


// -----------------------------------------------------
// DASHBOARD
// -----------------------------------------------------

function updateDashboard() {

    const medicines =
        getMedicines();

    const today =
        getToday();

    const todayMedicines =
        medicines.filter(
            medicine =>
                medicine.date === today
        );


    const taken =
        todayMedicines.filter(
            medicine =>
                medicine.status === "Taken"
        ).length;


    const missed =
        todayMedicines.filter(
            medicine =>
                medicine.status === "Missed"
        ).length;


    const pending =
        todayMedicines.filter(
            medicine =>
                medicine.status ===
                "Pending"
        ).length;


    const totalElement =
        document.getElementById(
            "today-count"
        );

    const takenElement =
        document.getElementById(
            "taken-count"
        );

    const missedElement =
        document.getElementById(
            "missed-count"
        );

    const pendingElement =
        document.getElementById(
            "pending-count"
        );


    if (totalElement)
        totalElement.textContent =
            todayMedicines.length;

    if (takenElement)
        takenElement.textContent =
            taken;

    if (missedElement)
        missedElement.textContent =
            missed;

    if (pendingElement)
        pendingElement.textContent =
            pending;
}


// -----------------------------------------------------
// FORM SUBMIT
// -----------------------------------------------------

function loadProfilesIntoMedicineForm() {

    const select =
        document.getElementById("profile");

    if (!select) return;


    const profiles =
        JSON.parse(
            localStorage.getItem(
                "medcare_profiles"
            ) || "[]"
        );


    select.innerHTML = `
        <option value="">
            Select Profile
        </option>
    `;


    profiles.forEach(
        profile => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                profile.name;

            option.textContent =
                profile.type === "Kid"
                ? `👦 ${profile.name} - Kid (${profile.age})`
                : `👴 ${profile.name} - Elderly (${profile.age})`;

            select.appendChild(
                option
            );

        }
    );

}
function setupMedicineForm() {

    const form =
        document.getElementById(
            "medicine-form"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const profile =
                document.getElementById(
                    "profile"
                ).value;

            const name =
                document.getElementById(
                    "medicine-name"
                ).value.trim();

            const dosage =
                document.getElementById(
                    "dosage"
                ).value.trim();

            const date =
                document.getElementById(
                    "medicine-date"
                ).value;

            const time =
                document.getElementById(
                    "medicine-time"
                ).value;

            const food =
                document.getElementById(
                    "food"
                ).value;

            const instructions =
                document.getElementById(
                    "instructions"
                ).value.trim();


            if (
                !profile ||
                !name ||
                !dosage ||
                !date ||
                !time
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            addMedicine({

                profile:
                    profile,

                name:
                    name,

                dosage:
                    dosage,

                date:
                    date,

                time:
                    time,

                food:
                    food,

                instructions:
                    instructions

            });


            /*
              Ask notification permission
            */

            requestNotificationPermission();


            alert(
                "✅ Medicine added successfully!"
            );


            form.reset();


            /*
              Go to reminders
            */

            setTimeout(
                function() {

                    window.location.href =
                        "reminders.html";

                },
                500
            );

        }
    );
}


// -----------------------------------------------------
// START APP
// -----------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupMedicineForm();

        renderMedicines();

        updateDashboard();

        checkReminders();


        /*
          Check every 10 seconds
        */

        setInterval(
            checkReminders,
            10000
        );

    }
);
