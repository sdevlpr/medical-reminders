/* =========================================
   MEDCARE APP
========================================= */

function toggleMenu() {

    const navigation =
        document.querySelector(".navigation");

    if (!navigation) return;

    if (
        navigation.style.display === "flex"
    ) {

        navigation.style.display = "none";

    } else {

        navigation.style.display = "flex";

        navigation.style.flexDirection =
            "column";

        navigation.style.position =
            "absolute";

        navigation.style.top = "76px";

        navigation.style.left = "0";

        navigation.style.right = "0";

        navigation.style.padding = "20px";

        navigation.style.background =
            "white";

        navigation.style.borderBottom =
            "1px solid #e2e8f0";
    }
}


/* Current year */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const year =
            document.querySelector(
                ".current-year"
            );

        if (year) {

            year.textContent =
                new Date().getFullYear();

        }

    }
);
