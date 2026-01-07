document.addEventListener('DOMContentLoaded', () => {
    
    const body = document.body;
    const menuToggle = document.getElementById('menu-toggle');
    const navGlass = document.querySelector('.nav-glass');
    
    // Мобильное меню
    if (menuToggle && navGlass) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navGlass.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (navGlass.classList.contains('active') && !navGlass.contains(e.target) && !menuToggle.contains(e.target)) {
                navGlass.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });

        navGlass.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navGlass.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    // Прелоадер
    const loader = document.getElementById('preloader');
    const txt = document.querySelector('.loader-percent');
    const line = document.querySelector('.loader-line::after');
    let percent = 0;
    
    const finishLoad = () => {
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                revealIntro(); 
            }, 600);
        }
    };

    const updateLoader = () => {
        percent += (100 - percent) * 0.1;
        if(txt) txt.textContent = Math.floor(percent) + '%';
        if(line) line.style.transform = `translateX(${percent - 100}%)`;

        if (percent > 99) finishLoad();
        else requestAnimationFrame(updateLoader);
    };
    updateLoader();

    // Плавный скролл (Lenis)
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true
        });

        lenis.on('scroll', (e) => {
            const header = document.querySelector('header');
            if(header) {
                if(e.direction === 1 && e.scroll > 100) header.classList.add('hide');
                else header.classList.remove('hide');
            }
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // Анимация появления блоков
    const revealIntro = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 }); 

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    };

    // Кнопка "Показать еще"
    const showMoreBtn = document.getElementById('show-more-btn');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const hiddenProjects = document.querySelectorAll('.hidden-project');
            const btnTextSpan = showMoreBtn.querySelector('.btn-text');
            const isExpanded = showMoreBtn.classList.contains('expanded');
            
            if (!isExpanded) {
                hiddenProjects.forEach(proj => {
                    proj.style.display = 'block';
                    setTimeout(() => { proj.style.opacity = '1'; }, 50);
                });
                if (btnTextSpan) btnTextSpan.textContent = "Свернуть";
                showMoreBtn.classList.add('expanded');
            } else {
                hiddenProjects.forEach(proj => {
                    proj.style.display = 'none';
                });
                if (btnTextSpan) btnTextSpan.textContent = "Показать еще";
                showMoreBtn.classList.remove('expanded');
                if(lenis) lenis.scrollTo('#projects', {offset: -50});
            }
        });
    }

    // Воспроизведение видео в превью
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                if (entry.target.classList.contains('proj-video')) {
                     entry.target.play().catch(()=>{});
                }
            } else {
                entry.target.pause();
            }
        });
    }, { threshold: 0.6 });
    document.querySelectorAll('video').forEach(v => videoObserver.observe(v));
    
    // Эффект наклона карточек (только на десктопе)
    if (!window.matchMedia("(pointer: coarse)").matches) {
        const tiltCards = document.querySelectorAll('.tilt-card, .client-box'); // Добавили client-box

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const rotateX = (y / (rect.height / 2)) * -5; // Меньший угол наклона для аккуратности
                const rotateY = (x / (rect.width / 2)) * 5;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            });
        });
    }
});