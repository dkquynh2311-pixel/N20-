
/* =========================================
   GỬI NGƯỜI THẮP SÁNG - WEBSITE 20/11
   Developer: KAZIN
========================================= */

// 1. DỮ LIỆU GIÁO VIÊN

const DEFAULT_TEACHERS = [
    {
        id: "gv1",
        name: "Cô Nguyễn Thị Mai",
        subject: "Ngữ văn",
        image: "assets/images/teacher.jpg"
    },
    {
        id: "gv2",
        name: "Thầy Trần Minh Đức",
        subject: "Toán học",
        image: "assets/images/teacher.jpg"
    },
    {
        id: "gv3",
        name: "Cô Lê Thu Hà",
        subject: "Tiếng Anh",
        image: "assets/images/teacher.jpg"
    },
    {
        id: "gv4",
        name: "Thầy Phạm Quốc Bảo",
        subject: "Tin học",
        image: "assets/images/teacher.jpg"
    },
    {
        id: "gv5",
        name: "Cô Hoàng Ngọc Lan",
        subject: "Vật lý",
        image: "assets/images/teacher.jpg"
    },
    {
        id: "gv6",
        name: "Thầy Nguyễn Hoàng Nam",
        subject: "Lịch sử",
        image: "assets/images/teacher.jpg"
    }
];

const ADMIN_PASSWORD = "kazin2011";

const STORAGE = {
    teachers: "triAn_teachers",
    wishes: "triAn_wishes"
};

let teachers = JSON.parse(
    localStorage.getItem(STORAGE.teachers)
) || DEFAULT_TEACHERS;

let wishes = JSON.parse(
    localStorage.getItem(STORAGE.wishes)
) || [];

let selectedTeacherId = null;
let adminTab = "overview";


// 2. HÀM LƯU DỮ LIỆU

function saveData() {
    localStorage.setItem(
        STORAGE.teachers,
        JSON.stringify(teachers)
    );

    localStorage.setItem(
        STORAGE.wishes,
        JSON.stringify(wishes)
    );
}


// 3. CHUYỂN TRANG


function showPage(name) {
    const target = document.getElementById(`page-${name}`);

    if (!target || target.classList.contains("active")) return;

    document.querySelectorAll(".page.active").forEach(page => {
        page.classList.remove("active");
    });

    target.classList.add("active");

    if (name === "teachers") {
        renderTeachers();
    }

    if (name === "teacher-view") {
        renderTeacherView();
    }

    if (
        name === "admin" &&
        sessionStorage.getItem("triAnAdmin") === "yes"
    ) {
        openDashboard();
    }

    window.scrollTo(0, 0);
}

document.addEventListener("click", event => {
    const button = event.target.closest("[data-page]");

    if (!button) return;

    event.preventDefault();
    showPage(button.dataset.page);
});



// 4. HIỂN THỊ DANH SÁCH GIÁO VIÊN

function renderTeachers() {

    const grid = document.getElementById("teacher-grid");

    grid.innerHTML = teachers.map(teacher => `
    <button class="teacher-card" data-teacher="${teacher.id}">
        <span class="teacher-name">${teacher.name}</span>
    </button>
`).join("");

    grid.querySelectorAll("[data-teacher]").forEach(card => {

        card.addEventListener("click", () => {

            openCompose(card.dataset.teacher);

        });

    });
}


// 5. MỞ TRANG VIẾT LỜI CHÚC

function openCompose(id) {
    const teacher = teachers.find(item => item.id === id);
    if (!teacher) return;

    selectedTeacherId = id;

    document.getElementById("compose-recipient").textContent = teacher.name;

    const avatar = document.getElementById("compose-avatar");

    if (avatar.src !== new URL(teacher.image, document.baseURI).href) {
        avatar.src = teacher.image;
    }

    showPage("compose");
}


// 6. ĐẾM KÝ TỰ

document.getElementById("wish").addEventListener(
    "input",
    event => {

        const length = event.target.value.length;

        document.getElementById(
            "char-count"
        ).textContent = `${length} / 700`;

    }
);


// 7. GỬI LỜI CHÚC

document.getElementById("wish-form").addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const sender = document.getElementById(
            "sender"
        ).value.trim();

        const message = document.getElementById(
            "wish"
        ).value.trim();

        if (!sender || !message || !selectedTeacherId) {
            return;
        }

        const newWish = {

            id: Date.now(),

            teacherId: selectedTeacherId,

            sender: sender,

            message: message,

            date: new Date().toISOString()

        };

        wishes.unshift(newWish);

        saveData();

        showPage("success");

    }
);


// 8. GIAO DIỆN GIÁO VIÊN

function renderTeacherView() {

    const select = document.getElementById(
        "teacher-filter"
    );

    const previous = select.value;

    select.innerHTML = teachers.map(teacher => `

        <option value="${teacher.id}">
            ${teacher.name}
        </option>

    `).join("");

    if (teachers.some(t => t.id === previous)) {
        select.value = previous;
    }

    renderWishesFor(select.value);
}


document.getElementById(
    "teacher-filter"
).addEventListener("change", event => {

    renderWishesFor(event.target.value);

});


function renderWishesFor(id) {

    const list = document.getElementById("wish-list");

    const teacher = teachers.find(
        item => item.id === id
    );

    if (!teacher) {

        list.innerHTML = `
            <div class="empty-state">
                Chưa có giáo viên để hiển thị.
            </div>
        `;

        return;
    }

    const filtered = wishes.filter(
        wish => wish.teacherId === id
    );

    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                Những lời chúc dành cho thầy cô
                sẽ xuất hiện ở đây.
            </div>
        `;

        return;
    }

    list.innerHTML = filtered.map(wish => `

        <article class="wish-card">

            <blockquote>
                “${escapeHTML(wish.message)}”
            </blockquote>

            <footer>
                GỬI BỞI
                <b>${escapeHTML(wish.sender)}</b>
                · ${new Date(wish.date).toLocaleDateString("vi-VN")}
            </footer>

        </article>

    `).join("");

}


// 9. CHỐNG HIỂN THỊ HTML KHÔNG AN TOÀN

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    })[char]);

}


// 10. ĐĂNG NHẬP ADMIN

document.getElementById("login-form").addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const password = document.getElementById(
            "admin-password"
        ).value;

        if (password === ADMIN_PASSWORD) {

            sessionStorage.setItem(
                "triAnAdmin",
                "yes"
            );

            document.getElementById(
                "login-error"
            ).textContent = "";

            openDashboard();

        } else {

            document.getElementById(
                "login-error"
            ).textContent =
                "Mật khẩu không chính xác!";

        }

    }
);


// 11. MỞ DASHBOARD

function openDashboard() {

    document.getElementById(
        "admin-login"
    ).classList.add("hidden");

    document.getElementById(
        "admin-dashboard"
    ).classList.remove("hidden");

    renderAdmin();

}


// 12. CHUYỂN TAB ADMIN

document.querySelectorAll("[data-admin-tab]").forEach(
    button => {

        button.addEventListener("click", () => {

            adminTab = button.dataset.adminTab;

            renderAdmin();

        });

    }
);


// 13. ĐĂNG XUẤT

document.getElementById("logout-btn").addEventListener(
    "click",
    () => {

        sessionStorage.removeItem("triAnAdmin");

        document.getElementById(
            "admin-dashboard"
        ).classList.add("hidden");

        document.getElementById(
            "admin-login"
        ).classList.remove("hidden");

        document.getElementById(
            "admin-password"
        ).value = "";

    }
);


// 14. DASHBOARD ADMIN

function renderAdmin() {

    const content = document.getElementById(
        "admin-content"
    );

    const title = document.getElementById(
        "admin-title"
    );

    const titles = {

        overview: "Tổng quan",

        teachers: "Quản lý giáo viên",

        wishes: "Quản lý lời chúc"

    };

    title.textContent = titles[adminTab];


    // TỔNG QUAN

    if (adminTab === "overview") {

        content.innerHTML = `

            <div class="stats">

                <div class="stat">
                    <span>TỔNG GIÁO VIÊN</span>
                    <strong>${teachers.length}</strong>
                </div>

                <div class="stat">
                    <span>LỜI CHÚC ĐÃ GỬI</span>
                    <strong>${wishes.length}</strong>
                </div>

                <div class="stat">
                    <span>TRẠNG THÁI</span>
                    <strong>ONLINE</strong>
                </div>

            </div>

            <div class="admin-section">

                <h3>Hoạt động gần đây</h3>

                ${
                    wishes.slice(0, 5).map(wish => `

                        <div class="admin-row">

                            <span>
                                ${escapeHTML(wish.sender)}
                                →
                                ${escapeHTML(
                                    teachers.find(
                                        t => t.id === wish.teacherId
                                    )?.name || "Giáo viên"
                                )}
                            </span>

                        </div>

                    `).join("")
                    || "<p>Chưa có lời chúc nào.</p>"
                }

            </div>

        `;

    }


    // QUẢN LÝ GIÁO VIÊN

    else if (adminTab === "teachers") {

        content.innerHTML = `

            <div class="admin-section">

                <h3>Thêm giáo viên mới</h3>

                <form id="add-teacher-form"
                      class="admin-form">

                    <input
                        class="admin-input"
                        name="name"
                        placeholder="Tên giáo viên"
                        required
                    >

                    <input
                        class="admin-input"
                        name="subject"
                        placeholder="Môn học"
                    >

                    <input
                        class="admin-input"
                        name="image"
                        placeholder="Đường dẫn ảnh"
                    >

                    <button class="admin-action">
                        + Thêm giáo viên
                    </button>

                </form>

            </div>

            <div class="admin-section">

                <h3>Danh sách giáo viên</h3>

                ${teachers.map(teacher => `

                    <div class="admin-row">

                        <span>
                            <b>${escapeHTML(teacher.name)}</b>
                            <br>
                            <small>${escapeHTML(teacher.subject)}</small>
                        </span>

                        <button
                            class="admin-action"
                            data-delete-teacher="${teacher.id}"
                        >
                            Xóa
                        </button>

                    </div>

                `).join("")}

            </div>

        `;


        document.getElementById(
            "add-teacher-form"
        ).addEventListener("submit", event => {

            event.preventDefault();

            const data = new FormData(event.currentTarget);

            teachers.push({

                id: "gv" + Date.now(),

                name: data.get("name").trim(),

                subject: data.get("subject").trim(),

                image: data.get("image").trim()
                    || "assets/images/teacher.jpg"

            });

            saveData();

            renderAdmin();

        });


        content.querySelectorAll(
            "[data-delete-teacher]"
        ).forEach(button => {

            button.addEventListener("click", () => {

                if (!confirm("Bạn có chắc muốn xóa giáo viên này?")) {
                    return;
                }

                teachers = teachers.filter(
                    teacher =>
                        teacher.id !== button.dataset.deleteTeacher
                );

                saveData();

                renderAdmin();

            });

        });

    }


    // QUẢN LÝ LỜI CHÚC

    else if (adminTab === "wishes") {

        content.innerHTML = `

            <div class="admin-section">

                <h3>Tất cả lời chúc (${wishes.length})</h3>

                ${
                    wishes.map(wish => `

                        <div class="admin-row">

                            <span>

                                <b>${escapeHTML(wish.sender)}</b>

                                <br>

                                <small>
                                    ${escapeHTML(wish.message)}
                                </small>

                            </span>

                            <button
                                class="admin-action"
                                data-delete-wish="${wish.id}"
                            >
                                Xóa
                            </button>

                        </div>

                    `).join("")
                    || "<p>Chưa có lời chúc nào.</p>"
                }

            </div>

        `;


        content.querySelectorAll(
            "[data-delete-wish]"
        ).forEach(button => {

            button.addEventListener("click", () => {

                if (!confirm("Xóa lời chúc này?")) {
                    return;
                }

                wishes = wishes.filter(
                    wish =>
                        String(wish.id) !==
                        button.dataset.deleteWish
                );

                saveData();

                renderAdmin();

            });

        });

    }

}


// 15. KHỞI ĐỘNG WEBSITE

renderTeachers();

// KIỂM TRA NGUYÊN NHÂN TRANG BỊ NHẤP NHÁY

const composePage = document.getElementById("page-compose");

const observer = new MutationObserver(() => {
    console.log(
        "Trạng thái trang gửi lời chúc:",
        composePage.className,
        new Date().toLocaleTimeString()
    );
});

observer.observe(composePage, {
    attributes: true,
    attributeFilter: ["class"]
});

console.log(
    "Số lượng script.js:",
    [...document.scripts].filter(s =>
        s.src.includes("script.js")
    ).length
);
