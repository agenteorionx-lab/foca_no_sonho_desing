document.addEventListener('DOMContentLoaded', () => {
    // Variáveis Globais
    const allCategories = [...new Set(projectsData.map(p => p.category))].sort();
    let currentCategory = 'all'; 
    let currentSearch = '';
    let swiperInstance = null;
    
    // Variáveis para Infinite Scroll
    let displayedProjectsCount = 20;
    const projectsPerLoad = 20;
    let filteredProjects = [];

    // Elementos do DOM
    const gridContainer = document.getElementById('gridContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const navToggle = document.getElementById('categoryGrid');
    const filterToggle = document.getElementById('filterToggle');
    const filterOverlay = document.getElementById('filterOverlay');
    const closeFilters = document.getElementById('closeFilters');
    
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const swiperWrapper = document.getElementById('swiperWrapper');
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');

    // Inicialização Dinâmica de Categorias
    function initCategories() {
        navToggle.innerHTML = '';
        
        // Botão "Todos"
        const allBtn = document.createElement('button');
        allBtn.className = currentCategory === 'all' ? 'nav-btn active' : 'nav-btn';
        allBtn.setAttribute('data-category', 'all');
        allBtn.textContent = 'Ver Todos';
        navToggle.appendChild(allBtn);

        allCategories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = cat === currentCategory ? 'nav-btn active' : 'nav-btn';
            btn.setAttribute('data-category', cat);
            btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            navToggle.appendChild(btn);
        });

        // Eventos dos botões
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.getAttribute('data-category');
                renderGrid();
                closeFilterOverlay(); // Fecha ao selecionar
            });
        });
    }

    // Lógica do Overlay de Filtros
    function openFilterOverlay() {
        filterOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeFilterOverlay() {
        filterOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    filterToggle.addEventListener('click', openFilterOverlay);
    closeFilters.addEventListener('click', closeFilterOverlay);
    
    // Abrir ao focar na busca (opcional, para conveniência)
    searchInput.addEventListener('focus', openFilterOverlay);

    // Fechar ao clicar fora do conteúdo do filtro
    filterOverlay.addEventListener('click', (e) => {
        if (e.target === filterOverlay) closeFilterOverlay();
    });

    initCategories();
    renderGrid();

    // 2. Lógica de Busca em tempo real
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase().trim();
        renderGrid();
    });

    // Mapeamento de Cores por Categoria (Expandido e Vibrante)
    function getCategoryColor(category) {
        const cat = category.toLowerCase().trim();
        const colors = {
            'agro': '#00FF66',           // Verde Neon
            'alimentação': '#FFD700',    // Dourado
            'estética': '#FF69B4',       // Rosa Choque
            'imobiliária': '#00BFFF',    // Azul Céu
            'tecnologia': '#7B68EE',     // Roxo Médio
            'moda': '#FF4500',           // Laranja
            'saúde': '#40E0D0',          // Turquesa
            'educação': '#1E90FF',       // Azul Real
            'coringas': '#FF00FF',       // Magenta
            'vendas': '#32CD32',         // Lime Green
            'jurídico': '#C0C0C0',       // Prata
            'social media': '#FF1493',   // Deep Pink
            'mentoria': '#FFA500',       // Laranja Ouro
            'branding': '#BC13FE',       // Roxo Neon
            'arquitetura': '#8B4513',    // Marrom
            'gastronomia': '#FF6347',    // Tomato
            'automotivo': '#00F3FF',     // Ciano Neon
            'com mascote': '#FF0055',    // Carmim
            'beleza': '#FFB6C1',         // Rosa Claro
            'consultoria': '#ADFF2F',    // Verde Amarelado
            'eventos': '#FF00FF',        // Magenta
            'fitness': '#FF8C00'         // Dark Orange
        };
        
        // Tenta encontrar a cor exata ou parcial
        for (const key in colors) {
            if (cat.includes(key)) return colors[key];
        }
        
        // Se não encontrar, gera uma cor baseada no nome da categoria para garantir que seja única
        let hash = 0;
        for (let i = 0; i < cat.length; i++) {
            hash = cat.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash % 360);
        return `hsl(${h}, 80%, 60%)`; // Cor dinâmica baseada no texto
    }

    // 3. Renderizar Grid
    function renderGrid() {
        gridContainer.innerHTML = '';
        displayedProjectsCount = projectsPerLoad;
        
        filteredProjects = projectsData.filter(project => {
            const matchCategory = currentCategory === 'all' || project.category === currentCategory;
            
            const matchSearch = currentSearch === '' || 
                                project.title.toLowerCase().includes(currentSearch) || 
                                project.subcategory.toLowerCase().includes(currentSearch) ||
                                (project.tags && project.tags.some(tag => tag.includes(currentSearch.toLowerCase())));
            
            return matchCategory && matchSearch;
        });

        if (filteredProjects.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            renderProjectBatch();
        }
    }

    function renderProjectBatch() {
        const batch = filteredProjects.slice(gridContainer.children.length, gridContainer.children.length + projectsPerLoad);
        
        batch.forEach((project) => {
            const card = document.createElement('div');
            card.className = `project-card`;
            
            const catColor = getCategoryColor(project.subcategory || project.category);
            card.style.setProperty('--category-color', catColor);
            
            const categoryHtml = project.subcategory.toLowerCase().includes('coringas') 
                ? '' 
                : `<p class="project-category" style="color: var(--category-color); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-top: 0.2rem;">${project.subcategory}</p>`;

            card.innerHTML = `
                <div class="card-image-container">
                    <img src="${project.cover}" alt="${project.title}" loading="lazy">
                </div>
                <div class="card-info">
                    <h3>${project.title}</h3>
                    ${categoryHtml}
                </div>
            `;
            
            card.addEventListener('click', () => openModal(project));
            gridContainer.appendChild(card);
        });
    }

    // Scroll Infinito
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            if (gridContainer.children.length < filteredProjects.length) {
                renderProjectBatch();
            }
        }
    });

    // 4. Lógica do Modal e Swiper Otimizada
    function openModal(project) {
        modalTitle.textContent = project.title;
        modalCategory.textContent = project.subcategory;
        
        swiperWrapper.innerHTML = '';
        project.slides.forEach((slideUrl, index) => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.dataset.src = slideUrl; // Armazena a URL para carregar depois
            
            const loader = document.createElement('div');
            loader.className = 'slide-loader';
            loader.innerHTML = '<div class="spinner"></div>';
            slide.appendChild(loader);

            swiperWrapper.appendChild(slide);
        });

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            modalOverlay.classList.add('mobile-vertical-view');
            // Carregar todos os slides no mobile (pois não há eventos de swiper)
            // Mas de forma sequencial para não travar
            loadMobileSlides();
            
            const hint = document.createElement('div');
            hint.className = 'rotation-hint';
            hint.innerHTML = '<span class="material-symbols-outlined">screen_rotation</span> Gire para ver melhor';
            modalOverlay.appendChild(hint);
            setTimeout(() => hint.remove(), 5000);
        } else {
            modalOverlay.classList.remove('mobile-vertical-view');
            
            if (swiperInstance) {
                swiperInstance.destroy(true, true);
            }

            swiperInstance = new Swiper('.mySwiper', {
                loop: false,
                keyboard: { enabled: true },
                pagination: {
                    el: '.swiper-pagination',
                    type: 'fraction',
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                effect: 'fade',
                fadeEffect: { crossFade: true },
                on: {
                    init: function () {
                        loadSlideCanvas(this.activeIndex);
                        loadSlideCanvas(this.activeIndex + 1);
                    },
                    slideChange: function () {
                        loadSlideCanvas(this.activeIndex);
                        loadSlideCanvas(this.activeIndex + 1);
                        loadSlideCanvas(this.activeIndex - 1);
                    }
                }
            });
        }
    }

    function loadSlideCanvas(index) {
        const slides = swiperWrapper.querySelectorAll('.swiper-slide');
        if (index < 0 || index >= slides.length) return;
        
        const slide = slides[index];
        if (slide.querySelector('canvas')) return; // Já carregado

        const slideUrl = slide.dataset.src;
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-wrapper protected-content';
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            slide.querySelector('.slide-loader')?.remove();
            canvasContainer.appendChild(canvas);
            
            const overlay = document.createElement('div');
            overlay.className = 'protection-overlay';
            canvasContainer.appendChild(overlay);
            
            slide.appendChild(canvasContainer);
        };
        img.src = slideUrl;
    }

    async function loadMobileSlides() {
        const slides = swiperWrapper.querySelectorAll('.swiper-slide');
        for (let i = 0; i < slides.length; i++) {
            // Pequeno delay entre carregamentos para não travar a UI
            await new Promise(r => setTimeout(r, 100));
            loadSlideCanvas(i);
        }
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (swiperInstance) {
            swiperInstance.destroy(true, true);
            swiperInstance = null;
        }
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // SEGURANÇA
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
            e.preventDefault();
        }
        if (e.key === 'PrintScreen') {
            triggerSecurityBlur();
        }
    });

    window.addEventListener('blur', triggerSecurityBlur);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) triggerSecurityBlur();
        else removeSecurityBlur();
    });
    window.addEventListener('focus', removeSecurityBlur);

    function triggerSecurityBlur() {
        document.body.classList.add('security-blur');
    }

    function removeSecurityBlur() {
        setTimeout(() => {
            document.body.classList.remove('security-blur');
        }, 500);
    }
});
