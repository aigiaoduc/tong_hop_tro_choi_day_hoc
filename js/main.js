document.addEventListener('DOMContentLoaded', () => {
    const sidebarNav = document.getElementById('sidebar-nav');
    const contentIframe = document.getElementById('content-iframe');

    // Hàm để tải và tạo menu
    async function createMenu() {
        try {
            const response = await fetch('js/routes.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const menuItems = data.menuItems;

            // Hàm đệ quy để tạo các mục menu, hỗ trợ đa cấp
            function buildMenuItems(parentUl, items) {
                items.forEach(item => {
                    const li = document.createElement('li');

                    if (item.type === 'divider') {
                        li.className = 'nav-item-divider';
                        parentUl.appendChild(li);
                        return;
                    }

                    li.className = 'nav-item';
                    const a = document.createElement('a');
                    a.href = '#';
                    a.textContent = item.title;

                    if (item.url) {
                        a.dataset.page = item.url;
                    }

                    li.appendChild(a);

                    // Nếu có submenu, gọi đệ quy để tạo menu con
                    if (item.submenu && item.submenu.length > 0) {
                        li.classList.add('has-submenu');
                        const subUl = document.createElement('ul');
                        subUl.className = 'submenu';
                        
                        // Gọi lại hàm buildMenuItems cho menu con
                        buildMenuItems(subUl, item.submenu);
                        
                        li.appendChild(subUl);
                    }

                    parentUl.appendChild(li);
                });
            }

            // Bắt đầu xây dựng menu từ cấp cao nhất
            buildMenuItems(sidebarNav, menuItems);

            // Thêm các trình xử lý sự kiện sau khi menu được tạo
            addEventListeners();

        } catch (error) {
            console.error("Could not load or create menu:", error);
            sidebarNav.innerHTML = '<li><a href="#">Lỗi tải menu</a></li>';
        }
    }

    // Hàm để thêm các trình xử lý sự kiện
    function addEventListeners() {
        // Sử dụng event delegation trên toàn bộ sidebar để hiệu quả hơn
        const sidebar = document.getElementById('sidebar');
        sidebar.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (!link) return;

            event.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ a

            const parentLi = link.parentElement;

            // Xử lý click vào link để thay đổi iframe
            const page = link.dataset.page;
            if (page) {
                contentIframe.src = page;
            }

            // Xử lý click để mở/đóng submenu
            if (parentLi.classList.contains('has-submenu')) {
                // Đóng các submenu khác đang mở
                const parentUl = parentLi.parentElement;
                const siblings = parentUl.querySelectorAll(':scope > .nav-item.has-submenu.open');
                siblings.forEach(sibling => {
                    if (sibling !== parentLi) {
                        sibling.classList.remove('open');
                    }
                });

                // Mở/đóng submenu được click
                parentLi.classList.toggle('open');

                if (!link.dataset.page) {
                    event.stopPropagation(); // Ngăn sự kiện lan ra các menu cha
                }
            }
        });
    }

    // Bắt đầu quá trình
    createMenu();

    // Tải trang chào mừng mặc định khi vào
    // (Mặc dù iframe đã có src, nhưng để đảm bảo tính nhất quán)
    contentIframe.src = "pages/welcome.html";
});
