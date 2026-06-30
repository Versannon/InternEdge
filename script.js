document.addEventListener("DOMContentLoaded", function () {
    const studentBtn = document.getElementById("studentBtn");
    const companyBtn = document.getElementById("companyBtn");
    const loginForm = document.getElementById("loginForm");
    const registerLink = document.getElementById("registerLink");

    if (studentBtn && companyBtn && loginForm && registerLink) {
        studentBtn.addEventListener("click", function () {
            studentBtn.classList.add("active");
            companyBtn.classList.remove("active");

            loginForm.action = "login.php";
            registerLink.href = "register.html";
        });

        companyBtn.addEventListener("click", function () {
            companyBtn.classList.add("active");
            studentBtn.classList.remove("active");

            loginForm.action = "company-login.php";
            registerLink.href = "company-register.html";
        });
    }

    setupModal("openTerms", "termsModal", "closeTerms");
    setupModal("openCompanyTerms", "companyTermsModal", "closeCompanyTerms");
    setupModal("openCompanyPrivacy", "companyPrivacyModal", "closeCompanyPrivacy");
});

function setupModal(openId, modalId, closeId) {
    const modal = document.getElementById(modalId);
    const openBtn = document.getElementById(openId);
    const closeBtn = document.getElementById(closeId);

    if (!modal || !openBtn || !closeBtn) {
        return;
    }

    openBtn.addEventListener("click", function (e) {
        e.preventDefault();
        modal.style.display = "block";
    });

    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}

function showPopup(type, title, message, redirectURL = null) {
    if (!document.body) {
        document.addEventListener("DOMContentLoaded", function () {
            showPopup(type, title, message, redirectURL);
        });
        return;
    }

    let popup = document.getElementById("popupModal");

    if (!popup) {
        ensurePopupStyles();

        popup = document.createElement("div");
        popup.id = "popupModal";
        popup.className = "popup-modal";
        popup.innerHTML = [
            '<div class="popup-box">',
            '    <div class="popup-icon" id="popupIcon"></div>',
            '    <h2 id="popupTitle"></h2>',
            '    <p id="popupMessage"></p>',
            '</div>'
        ].join("");

        document.body.appendChild(popup);
    }

    const icon = document.getElementById("popupIcon");
    const popupTitle = document.getElementById("popupTitle");
    const popupMessage = document.getElementById("popupMessage");

    popup.style.display = "flex";

    if (type === "success") {
        icon.className = "popup-icon success-icon";
        icon.innerHTML = "&#10003;";
    } else {
        icon.className = "popup-icon error-icon";
        icon.innerHTML = "&#10005;";
    }

    popupTitle.innerText = title;
    popupMessage.innerText = message;

    if (redirectURL) {
        setTimeout(function () {
            window.location.href = redirectURL;
        }, 2000);
    }
}

function ensurePopupStyles() {
    if (document.getElementById("popupFallbackStyles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "popupFallbackStyles";
    style.textContent = [
        ".popup-modal {",
        "    position: fixed;",
        "    inset: 0;",
        "    display: none;",
        "    align-items: center;",
        "    justify-content: center;",
        "    background: rgba(0, 0, 0, 0.45);",
        "    z-index: 9999;",
        "    font-family: Arial, sans-serif;",
        "}",
        ".popup-box {",
        "    width: min(90%, 360px);",
        "    padding: 30px;",
        "    border-radius: 14px;",
        "    background: #fff;",
        "    text-align: center;",
        "    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.2);",
        "}",
        ".popup-icon {",
        "    width: 58px;",
        "    height: 58px;",
        "    margin: 0 auto 15px;",
        "    border-radius: 50%;",
        "    display: flex;",
        "    align-items: center;",
        "    justify-content: center;",
        "    color: #fff;",
        "    font-size: 30px;",
        "    font-weight: bold;",
        "}",
        ".success-icon { background: #22c55e; }",
        ".error-icon { background: #ef4444; }",
        ".popup-box h2 { margin: 0 0 8px; font-size: 24px; }",
        ".popup-box p { margin: 0; color: #555; }"
    ].join("");

    document.head.appendChild(style);
}
