/* =========================================================
   MEDCARE - MAIN APP.JS
   ========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const MEDICINE_KEY = "medcare_medicines";
const TRACKING_KEY = "medcare_tracking";
const PROFILE_KEY = "medcare_profiles";


function getMedicines() {

    try {
        return JSON.parse(
            localStorage.getItem(MEDICINE_KEY) || "[]"
        );
    } catch (error) {
        console.error(error);
        return [];
    }

}


function saveMedicines(medicines) {

    localStorage.setItem(
        MEDICINE_KEY,
        JSON.stringify(medicines)
    );

}


function getTracking() {

    try {
        return JSON.parse(
            localStorage.getItem(TRACKING_KEY) || "[]"
        );
    } catch (error) {
        return [];
    }

}


function saveTracking(data) {

    localStorage.setItem(
        TRACKING_KEY,
        JSON.stringify(data)
    );

}


function getProfiles() {

    try {

        return JSON.parse(
            localStorage.getItem(PROFILE_KEY) || "[]"
        );

    } catch (error) {

        return [];

    }

}


/* =========================================================
   DATE HELPERS
========================================================= */

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
        .padStart(2, "0");

    const day =
        String(now.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function formatDate(dateString) {

    if (!dateString) return "";

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   NOTIFICATION PERMISSION
========================================================= */

async function enableNotifications() {

    if (!("Notification" in window)) {

        alert(
            "❌ Your browser does not support notifications."
        );

        return;

    }


    try {

        const permission =
            await Notification.requestPermission();


        if (permission === "granted") {

            new Notification(
                "💊 MedCare Notifications Enabled",
                {
                    body:
                        "You will receive medicine reminders here."
                }
            );

            alert(
                "✅ Notifications enabled successfully!"
            );

        }

        else if (permission === "denied") {

            alert(
                "❌ Notifications are blocked.\n\n" +
                "Please allow Notifications from your browser site settings."
            );

        }

        else {

            alert(
                "⚠️ Notification permission was not granted."
            );

        }

    } catch (error) {

        console.error(
            "Notification error:",
            error
        );

    }

}


/* =========================================================
   SEND NOTIFICATION
========================================================= */

function sendNotification(
    title,
    message
) {

    if (!("Notification" in window)) {
        return false;
    }


    if (Notification.permission !== "granted") {
        return false;
    }


    try {

        const notification =
            new Notification(
                title,
                {
                    body: message,
                    icon: "https://cdn-icons-png.flaticon.com/512/822/822143.png",
                    tag: "medcare-reminder"
                }
            );


        notification.onclick =
            function() {

                window.focus();

                window.location.href =
                    "reminders.html";

            };


        playReminderSound();

        return true;

    } catch (error) {

        console.error(
            "Notification failed:",
            error
        );

        return false;

    }

}


/* =========================================================
   REMINDER SOUND
========================================================= */

function playReminderSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) return;

        const context =
            new AudioContext();

        const oscillator =
            context.createOscillator();

        const gain =
            context.createGain();

        oscillator.connect(gain);

        gain.connect(
            context.destination
        );

        oscillator.frequency.value =
            800;

        oscillator.type =
            "sine";

        gain.gain.setValueAtTime(
            0.15,
            context.currentTime
        );

        oscillator.start();

        oscillator.stop(
            context.currentTime + 0.4
        );

    } catch (error) {

        console.log(
            "Sound unavailable"
        );

    }

}


/* =========================================================
   MEDICINE FORM
========================================================= */

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


            const medicineName =
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
                )?.value || "Anytime";


            const instructions =
                document.getElementById(
                    "instructions"
                )?.value.trim() || "";


            if (
                !profile ||
                !medicineName ||
                !dosage ||
                !date ||
                !time
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            const medicines =
                getMedicines();


            const medicine = {

                id:
                    Date.now().toString(),

                profile:
                    profile,

                name:
                    medicineName,

                dosage:
                    dosage,

                date:
                    date,

                time:
                    time,

                food:
                    food,

                instructions:
                    instructions,

                status:
                    "Pending",

                lastReminder:
                    "",

                snoozeUntil:
                    "",

                createdAt:
                    new Date().toISOString()

            };


            medicines.push(
                medicine
            );


            saveMedicines(
                medicines
            );


            /* Ask notification permission */

            if (
                "Notification" in window &&
                Notification.permission === "default"
            ) {

                Notification.requestPermission();

            }


            alert(
                "✅ Medicine saved successfully!"
            );


            window.location.href =
                "reminders.html";

        }
    );

}


/* =========================================================
   UPCOMING REMINDERS
========================================================= */

function renderMedicines() {

    const container =
        document.getElementById(
            "medicine-list"
        );

    if (!container) return;


    const medicines =
        getMedicines();


    if (
        !medicines ||
        medicines.length === 0
    ) {

        container.innerHTML = `

            <div class="card"
                 style="
                 grid-column:1/-1;
                 text-align:center;
                 padding:40px;
                 ">

                <div style="font-size:50px;">
                    💊
                </div>

                <h2>
                    No Upcoming Reminders
                </h2>

                <p>
                    Add a medicine to create your first reminder.
                </p>

                <a
                    href="add-medicine.html"
                    class="btn btn-primary"
                >
                    ➕ Add Medicine
                </a>

            </div>

        `;

        return;

    }


    /* Sort by date + time */

    medicines.sort(
        function(a, b) {

            const dateA =
                new Date(
                    `${a.date}T${a.time}`
                );

            const dateB =
                new Date(
                    `${b.date}T${b.time}`
                );

            return dateA - dateB;

        }
    );


    container.innerHTML = "";


    medicines.forEach(
        function(medicine) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            card.style.position =
                "relative";


            let statusClass =
                "pending";


            if (
                medicine.status ===
                "Taken"
            ) {

                statusClass =
                    "taken";

            }


            if (
                medicine.status ===
                "Missed"
            ) {

                statusClass =
                    "missed";

            }


            card.innerHTML = `

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:15px;
                    margin-bottom:18px;
                ">

                    <div>

                        <div style="
                            font-size:30px;
                            margin-bottom:8px;
                        ">
                            💊
                        </div>

                        <h3 style="
                            margin:0 0 5px;
                        ">
                            ${escapeHTML(
                                medicine.name
                            )}
                        </h3>

                        <p style="
                            margin:0;
                            color:#667;
                        ">
                            ${escapeHTML(
                                medicine.dosage
                            )}
                        </p>

                    </div>


                    <span style="
                        padding:6px 12px;
                        border-radius:20px;
                        background:
                        ${
                            medicine.status === "Taken"
                            ? "#e8f8ee"
                            :
                            medicine.status === "Missed"
                            ? "#fdecec"
                            :
                            "#fff7df"
                        };
                        color:
                        ${
                            medicine.status === "Taken"
                            ? "#25804a"
                            :
                            medicine.status === "Missed"
                            ? "#c0392b"
                            :
                            "#9a7200"
                        };
                        font-size:12px;
                        font-weight:700;
                    ">
                        ${medicine.status}
                    </span>

                </div>


                <div style="
                    display:grid;
                    gap:8px;
                    margin-bottom:18px;
                ">

                    <div>
                        👤
                        <strong>Profile:</strong>
                        ${escapeHTML(
                            getProfileDisplayName(
                                medicine.profile
                            )
                        )}
                    </div>

                    <div>
                        📅
                        <strong>Date:</strong>
                        ${formatDate(
                            medicine.date
                        )}
                    </div>

                    <div>
                        ⏰
                        <strong>Time:</strong>
                        ${medicine.time}
                    </div>

                    <div>
                        🍽️
                        <strong>Food:</strong>
                        ${escapeHTML(
                            medicine.food ||
                            "Anytime"
                        )}
                    </div>

                </div>


                ${
                    medicine.instructions
                    ?
                    `
                    <div style="
                        background:#f6f9fa;
                        padding:12px;
                        border-radius:10px;
                        margin-bottom:15px;
                        font-size:13px;
                    ">
                        📝
                        ${escapeHTML(
                            medicine.instructions
                        )}
                    </div>
                    `
                    :
                    ""
                }


                <div style="
                    display:flex;
                    flex-wrap:wrap;
                    gap:8px;
                ">

                    <button
                        onclick="markTaken('${medicine.id}')"
                        class="btn btn-primary"
                        style="border:none;cursor:pointer;"
                    >
                        ✅ Taken
                    </button>

                    <button
                        onclick="snoozeMedicine('${medicine.id}')"
                        class="btn"
                        style="
                            border:none;
                            cursor:pointer;
                            background:#fff4dc;
                        "
                    >
                        ⏰ Snooze 10 Min
                    </button>

                    <button
                        onclick="editMedicine('${medicine.id}')"
                        class="btn"
                        style="
                            border:none;
                            cursor:pointer;
                            background:#edf5ff;
                        "
                    >
                        ✏️ Edit
                    </button>

                    <button
                        onclick="deleteMedicine('${medicine.id}')"
                        class="btn"
                        style="
                            border:none;
                            cursor:pointer;
                            background:#fdecec;
                        "
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   PROFILE DISPLAY
========================================================= */

function getProfileDisplayName(
    profileValue
) {

    const profiles =
        getProfiles();


    const profile =
        profiles.find(
            function(item) {

                return (
                    String(item.id) ===
                    String(profileValue)
                    ||
                    item.name ===
                    profileValue
                );

            }
        );


    if (!profile) {

        return profileValue || "Unknown";

    }


    return (
        profile.name +
        " - " +
        profile.type +
        " (" +
        profile.age +
        ")"
    );

}


/* =========================================================
   MARK TAKEN
========================================================= */

function markTaken(
    medicineId
) {

    const medicines =
        getMedicines();


    const medicine =
        medicines.find(
            item =>
                String(item.id) ===
                String(medicineId)
        );


    if (!medicine) return;


    medicine.status =
        "Taken";


    medicine.takenAt =
        new Date().toISOString();


    saveMedicines(
        medicines
    );


    const tracking =
        getTracking();


    tracking.push({

        medicineId:
            medicine.id,

        medicineName:
            medicine.name,

        profile:
            medicine.profile,

        status:
            "Taken",

        date:
            getToday(),

        time:
            new Date().toLocaleTimeString()

    });


    saveTracking(
        tracking
    );


    renderMedicines();

}


/* =========================================================
   MARK MISSED
========================================================= */

function markMissed(
    medicine
) {

    medicine.status =
        "Missed";


    const medicines =
        getMedicines();


    saveMedicines(
        medicines
    );


    const tracking =
        getTracking();


    tracking.push({

        medicineId:
            medicine.id,

        medicineName:
            medicine.name,

        profile:
            medicine.profile,

        status:
            "Missed",

        date:
            getToday(),

        time:
            new Date().toLocaleTimeString()

    });


    saveTracking(
        tracking
    );


    sendNotification(

        "🚨 Medicine Missed",

        `${medicine.name} was not taken on time.`

    );

}


/* =========================================================
   SNOOZE
========================================================= */

function snoozeMedicine(
    medicineId
) {

    const medicines =
        getMedicines();


    const medicine =
        medicines.find(
            item =>
                String(item.id) ===
                String(medicineId)
        );


    if (!medicine) return;


    const snoozeTime =
        new Date(
            Date.now() +
            10 * 60 * 1000
        );


    medicine.snoozeUntil =
        snoozeTime.toISOString();


    medicine.status =
        "Pending";


    saveMedicines(
        medicines
    );


    alert(
        "⏰ Reminder snoozed for 10 minutes."
    );


    renderMedicines();

}


/* =========================================================
   DELETE MEDICINE
========================================================= */

function deleteMedicine(
    medicineId
) {

    if (
        !confirm(
            "Are you sure you want to delete this medicine?"
        )
    ) {

        return;

    }


    let medicines =
        getMedicines();


    medicines =
        medicines.filter(
            item =>
                String(item.id) !==
                String(medicineId)
        );


    saveMedicines(
        medicines
    );


    renderMedicines();

}


/* =========================================================
   EDIT MEDICINE
========================================================= */

function editMedicine(
    medicineId
) {

    const medicines =
        getMedicines();


    const medicine =
        medicines.find(
            item =>
                String(item.id) ===
                String(medicineId)
        );


    if (!medicine) return;


    const newName =
        prompt(
            "Medicine Name:",
            medicine.name
        );


    if (
        newName === null ||
        !newName.trim()
    ) {

        return;

    }


    const newDosage =
        prompt(
            "Dosage:",
            medicine.dosage
        );


    if (
        newDosage === null ||
        !newDosage.trim()
    ) {

        return;

    }


    const newTime =
        prompt(
            "Reminder Time (HH:MM):",
            medicine.time
        );


    if (
        newTime === null ||
        !newTime.trim()
    ) {

        return;

    }


    medicine.name =
        newName.trim();


    medicine.dosage =
        newDosage.trim();


    medicine.time =
        newTime.trim();


    saveMedicines(
        medicines
    );


    renderMedicines();

}


/* =========================================================
   REMINDER CHECKER
========================================================= */

function checkReminders() {

    const medicines =
        getMedicines();


    if (!medicines.length) {
        return;
    }


    const now =
        new Date();


    const today =
        getToday();


    let changed =
        false;


    medicines.forEach(
        function(medicine) {

            if (
                medicine.date !==
                today
            ) {

                return;

            }


            if (
                medicine.status ===
                "Taken"
            ) {

                return;

            }


            /* -----------------------------------------
               SNOOZED REMINDER
            ----------------------------------------- */

            if (
                medicine.snoozeUntil
            ) {

                const snoozeDate =
                    new Date(
                        medicine.snoozeUntil
                    );


                if (
                    now >= snoozeDate
                ) {

                    sendNotification(

                        "💊 Medicine Reminder",

                        `${medicine.name} - ${medicine.dosage} is due now.`

                    );


                    medicine.snoozeUntil =
                        "";


                    medicine.lastReminder =
                        now.toISOString();


                    changed =
                        true;

                }


                return;

            }


            /* -----------------------------------------
               NORMAL REMINDER
            ----------------------------------------- */

            const reminderDate =
                new Date(
                    `${medicine.date}T${medicine.time}`
                );


            const difference =
                now - reminderDate;


            /* Reminder window:
               0 to 15 minutes after scheduled time
            */

            if (
                difference >= 0 &&
                difference <= 15 * 60 * 1000
            ) {

                const lastReminder =
                    medicine.lastReminder
                    ?
                    new Date(
                        medicine.lastReminder
                    )
                    :
                    null;


                const canNotify =
                    !lastReminder ||
                    (
                        now -
                        lastReminder
                        >
                        10 * 60 * 1000
                    );


                if (canNotify) {

                    sendNotification(

                        "💊 Medicine Reminder",

                        `${medicine.name} - ${medicine.dosage} is due now.`

                    );


                    medicine.lastReminder =
                        now.toISOString();


                    changed =
                        true;

                }

            }


            /* -----------------------------------------
               MISSED AFTER 15 MINUTES
            ----------------------------------------- */

            if (
                difference >
                15 * 60 * 1000 &&
                medicine.status ===
                "Pending"
            ) {

                markMissed(
                    medicine
                );


                changed =
                    true;

            }

        }
    );


    if (changed) {

        saveMedicines(
            medicines
        );

        renderMedicines();

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const medicines =
        getMedicines();


    const today =
        getToday();


    const todayMedicines =
        medicines.filter(
            medicine =>
                medicine.date ===
                today
        );


    const total =
        document.getElementById(
            "total-medicines"
        );


    const pending =
        document.getElementById(
            "pending-medicines"
        );


    const taken =
        document.getElementById(
            "taken-medicines"
        );


    const missed =
        document.getElementById(
            "missed-medicines"
        );


    if (total) {

        total.textContent =
            todayMedicines.length;

    }


    if (pending) {

        pending.textContent =
            todayMedicines.filter(
                item =>
                    item.status ===
                    "Pending"
            ).length;

    }


    if (taken) {

        taken.textContent =
            todayMedicines.filter(
                item =>
                    item.status ===
                    "Taken"
            ).length;

    }


    if (missed) {

        missed.textContent =
            todayMedicines.filter(
                item =>
                    item.status ===
                    "Missed"
            ).length;

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    if (value === undefined ||
        value === null) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   ENABLE NOTIFICATION BUTTON
========================================================= */

function setupNotificationButton() {

    const buttons =
        document.querySelectorAll(
            "#enable-notifications, .enable-notifications"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                enableNotifications
            );

        }
    );

}


/* =========================================================
   LOAD PROFILES INTO ADD MEDICINE
========================================================= */

function loadProfilesIntoMedicineForm() {

    const select =
        document.getElementById(
            "profile"
        );


    if (!select) return;


    const profiles =
        getProfiles();


    select.innerHTML = `
        <option value="">
            Select Profile
        </option>
    `;


    profiles.forEach(
        function(profile) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                profile.id ||
                profile.name;


            const icon =
                profile.type === "Kid"
                ? "👦"
                : "👴";


            option.textContent =
                `${icon} ${profile.name} - ${profile.type} (${profile.age})`;


            select.appendChild(
                option
            );

        }
    );


    if (!profiles.length) {

        select.innerHTML = `
            <option value="">
                No Profile Found - Create Profile First
            </option>
        `;

    }

}


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupMedicineForm();

        loadProfilesIntoMedicineForm();

        renderMedicines();

        updateDashboard();

        setupNotificationButton();

        checkReminders();


        /* Check every 10 seconds */

        setInterval(
            function() {

                checkReminders();

                updateDashboard();

            },
            10000
        );

    }
);
