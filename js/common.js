AOS.init({
  duration: 800,
  once: true,
  disable: 'mobile'
});

$(window).on('scroll', function () {
    if (window.scrollY > 150) {
        $('header').addClass('header-sticky')
    } else {
        $('header').removeClass('header-sticky')
    }
});
const dropdown = document.querySelector('li.dropdown-menu1');
const navLine = document.querySelector('.nav_menu > ul');

dropdown.addEventListener('mouseenter', () => {
  navLine.classList.add('active-line');
});
dropdown.addEventListener('mouseleave', () => {
  navLine.classList.remove('active-line');
});

// ===== Mobile footer menu js 
 const tabs = document.querySelectorAll('.tab');
        const modals = document.querySelectorAll('.modal-new');
        let currentModal = null;
        let activeTab = null;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const modalClass = Array.from(tab.classList).find(c => c.startsWith('modal'));
                const modal = document.querySelector(`.modal-new.${modalClass}`);

                if (!modal) return;

                const isSameModal = currentModal === modal;

                // Hide current modal if open
                if (currentModal) {
                    currentModal.classList.remove('show');
                }

                // Remove active class from previous tab
                if (activeTab) {
                    activeTab.classList.remove('active');
                }

                if (!isSameModal) {
                    modal.classList.add('show');
                    tab.classList.add('active');
                    currentModal = modal;
                    activeTab = tab;
                } else {
                    currentModal = null;
                    activeTab = null;
                }
            });
        });

        function closeModal(modalClass) {
            const modal = document.querySelector(`.modal-new.${modalClass}`);
            if (modal) modal.classList.remove('show');

            if (currentModal === modal) {
                currentModal = null;
                if (activeTab) activeTab.classList.remove('active');
                activeTab = null;
            }
        }

        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (
                currentModal &&
                !currentModal.contains(e.target) &&
                !e.target.closest('.tab')
            ) {
                currentModal.classList.remove('show');
                if (activeTab) activeTab.classList.remove('active');
                currentModal = null;
                activeTab = null;
            }
        });