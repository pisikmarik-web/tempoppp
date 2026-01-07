document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    
    // Определяем мобильное устройство
    let isMobile = window.innerWidth < 768;

    // Настраиваем цвета и прозрачность в зависимости от устройства
    // На телефоне делаем более прозрачными (0.2 - 0.4), чтобы не заливало экран
    const getColors = () => isMobile ? [
        'rgba(41, 82, 255, 0.25)', 
        'rgba(29, 64, 204, 0.2)', 
        'rgba(20, 20, 30, 0.4)',  
        'rgba(41, 82, 255, 0.15)'
    ] : [
        'rgba(41, 82, 255, 0.6)', 
        'rgba(29, 64, 204, 0.5)', 
        'rgba(20, 20, 30, 0.8)',  
        'rgba(41, 82, 255, 0.3)'
    ];

    let colors = getColors();

    class Orb {
        constructor() {
            this.setParams();
        }

        setParams() {
            // На мобильном шары распределяем по всему экрану, на ПК - больше справа
            this.x = isMobile ? Math.random() * width : (width * 0.3) + (Math.random() * (width * 0.7));
            this.y = Math.random() * height;
            
            // На мобильном радиус значительно меньше
            const minRadius = isMobile ? 80 : 200;
            const maxRadius = isMobile ? 150 : 300;

            this.radius = Math.random() * (maxRadius - minRadius) + minRadius; 
            
            // Скорость поменьше на мобильном
            const speedFactor = isMobile ? 0.3 : 0.5;
            this.vx = (Math.random() - 0.5) * speedFactor; 
            this.vy = (Math.random() - 0.5) * speedFactor;
            
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Мягкие границы возврата
            if (this.x < -this.radius) this.x = width + this.radius;
            if (this.x > width + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = height + this.radius;
            if (this.y > height + this.radius) this.y = -this.radius;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            
            // Добавляем blur прямо здесь, чтобы было красиво
            ctx.filter = isMobile ? 'blur(40px)' : 'blur(60px)';
            
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
            ctx.filter = 'none'; // Сброс фильтра для производительности
        }
    }

    let orbs = [];
    
    // Меньше шаров на телефоне
    const getOrbCount = () => isMobile ? 4 : 7;

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        
        isMobile = width < 768;
        colors = getColors();
        
        orbs = [];
        const count = getOrbCount();
        for(let i = 0; i < count; i++) {
            orbs.push(new Orb());
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        
        // Легкое наложение черного для следа не нужно, просто чистим
        // Но можно добавить глобальную композицию
        // ctx.globalCompositeOperation = 'screen'; // Экспериментально

        orbs.forEach(orb => {
            orb.update();
            orb.draw();
        });

        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    
    resize();
    animate();
});