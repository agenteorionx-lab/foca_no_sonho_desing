document.addEventListener('DOMContentLoaded', () => {
    // Variáveis Globais
    let currentCategory = 'mascote';
    let currentSearch = '';
    let swiperInstance = null;

    // Elementos do DOM
    const gridContainer = document.getElementById('gridContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const navButtons = document.querySelectorAll('.nav-btn');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const swiperWrapper = document.getElementById('swiperWrapper');
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');

    // Inicialização
    renderGrid();

    // 1. Lógica de Filtro por Categoria (Abas)
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active style from all
            navButtons.forEach(b => b.classList.remove('active'));
            // Add active style to clicked
            btn.classList.add('active');
            
            // Set current category
            currentCategory = btn.getAttribute('data-category');
            renderGrid();
        });
    });

    // 2. Lógica de Busca em tempo real
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase().trim();
        renderGrid();
    });

    // 3. Renderizar Grid
    function renderGrid() {
        gridContainer.innerHTML = '';
        
        // Filtrar projetos
        const filteredProjects = projectsData.filter(project => {
            const matchCategory = project.category === currentCategory;
            const matchSearch = project.title.toLowerCase().includes(currentSearch) || 
                                project.subcategory.toLowerCase().includes(currentSearch);
            return matchCategory && matchSearch;
        });

        // Mostrar estado vazio se não houver projetos
        if (filteredProjects.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            
            // Gerar HTML dos cards
            filteredProjects.forEach((project, index) => {
                const card = document.createElement('div');
                
                // Lógica de alternância de cores (Roxo, Preto e Verde)
                const colorClasses = ['bg-purple', 'bg-black', 'bg-green'];
                const colorClass = colorClasses[index % 3];
                
                card.className = `project-card ${colorClass}`;
                card.innerHTML = `
                    <img src="${project.cover}" alt="${project.title}" loading="lazy">
                    <div class="card-info">
                        <h3>${project.title}</h3>
                        <p class="project-category">${project.subcategory}</p>
                    </div>
                `;
                
                // Evento de clique para abrir o Modal
                card.addEventListener('click', () => openModal(project));
                
                gridContainer.appendChild(card);
            });
        }
    }

    // 4. Lógica do Modal e Swiper
    function openModal(project) {
        modalTitle.textContent = project.title;
        modalCategory.textContent = project.subcategory;
        
        // Gerar Slides
        swiperWrapper.innerHTML = '';
        project.slides.forEach(slideUrl => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            
            // Imagem com lazy load nativo para performance de catálogos grandes
            slide.innerHTML = `<img src="${slideUrl}" alt="Slide de ${project.title}" loading="lazy">`;
            swiperWrapper.appendChild(slide);
        });

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evitar rolagem do body

        // Inicializar ou Atualizar Swiper
        if (swiperInstance) {
            swiperInstance.destroy(true, true);
        }

        swiperInstance = new Swiper('.mySwiper', {
            loop: false,
            keyboard: {
                enabled: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            }
        });
    }

    // Fechar Modal
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (swiperInstance) {
            swiperInstance.destroy(true, true);
            swiperInstance = null;
        }
    }

    modalClose.addEventListener('click', closeModal);
    
    // Fechar ao clicar fora da área
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    
    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

});
