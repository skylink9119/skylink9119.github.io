/**
 * 优化的粒子动画 + 渐变流动背景
 * 高性能、响应式、优雅的粒子系统
 */

(function() {
  'use strict';
  
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCombinedBackground);
  } else {
    initCombinedBackground();
  }
  
  function initCombinedBackground() {
    // 只在首页启用
    if (!document.body.classList.contains('home')) {
      return;
    }
    
    console.log('🚀 初始化粒子动画 + 渐变流动背景...');
    
    // 创建Canvas元素
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置Canvas
    canvas.id = 'particle-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 2s ease';
    
    // 插入到页面
    document.body.appendChild(canvas);
    
    // 粒子系统配置
    const config = {
      particleCount: 60,           // 粒子数量（性能友好）
      particleColors: [
        '#22d3ee', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'
      ],
      lineColors: [
        'rgba(34, 211, 238, 0.15)',
        'rgba(236, 72, 153, 0.12)',
        'rgba(139, 92, 246, 0.1)'
      ],
      maxLineDistance: 120,        // 连线最大距离
      baseSpeed: 0.3,              // 基础速度
      mouseRadius: 150,            // 鼠标影响半径
      interactionStrength: 1.5,    // 交互强度
      fadeInDuration: 2000         // 淡入时间(ms)
    };
    
    // 系统状态
    let particles = [];
    let mouse = { x: -1000, y: -1000, radius: config.mouseRadius };
    let animationId;
    let width, height;
    let startTime = Date.now();
    
    // 粒子类
    class Particle {
      constructor() {
        this.reset();
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }
      
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * config.baseSpeed;
        this.speedY = (Math.random() - 0.5) * config.baseSpeed;
        this.color = config.particleColors[
          Math.floor(Math.random() * config.particleColors.length)
        ];
        this.opacity = Math.random() * 0.5 + 0.3;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveSpeed = Math.random() * 0.02 + 0.01;
        this.waveAmplitude = Math.random() * 0.5 + 0.2;
      }
      
      update() {
        // 波浪运动
        const waveX = Math.sin(Date.now() * 0.001 * this.waveSpeed + this.waveOffset) * this.waveAmplitude;
        const waveY = Math.cos(Date.now() * 0.001 * this.waveSpeed + this.waveOffset) * this.waveAmplitude;
        
        // 边界处理（柔和反弹）
        if (this.x > width) {
          this.x = 0;
          this.reset();
        } else if (this.x < 0) {
          this.x = width;
          this.reset();
        }
        
        if (this.y > height) {
          this.y = 0;
          this.reset();
        } else if (this.y < 0) {
          this.y = height;
          this.reset();
        }
        
        // 鼠标交互
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          
          this.speedX += Math.cos(angle) * force * config.interactionStrength * 0.1;
          this.speedY += Math.sin(angle) * force * config.interactionStrength * 0.1;
          
          // 鼠标附近的粒子变亮
          this.opacity = Math.min(0.9, this.opacity + force * 0.1);
        } else {
          // 缓慢恢复原始透明度
          this.opacity = Math.max(0.3, this.opacity - 0.01);
        }
        
        // 速度限制
        const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        const maxSpeed = config.baseSpeed * 2;
        if (speed > maxSpeed) {
          this.speedX = (this.speedX / speed) * maxSpeed;
          this.speedY = (this.speedY / speed) * maxSpeed;
        }
        
        // 应用运动
        this.x += this.speedX + waveX;
        this.y += this.speedY + waveY;
        
        // 缓慢恢复原始速度
        this.speedX *= 0.99;
        this.speedY *= 0.99;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // 渐变填充
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, this.color + 'FF');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 光晕效果
        if (this.opacity > 0.6) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = this.color + '30';
          ctx.fill();
        }
      }
    }
    
    // 初始化粒子
    function initParticles() {
      particles = [];
      for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
      }
    }
    
    // 绘制连接线
    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < config.maxLineDistance) {
            // 根据距离计算透明度
            const opacity = 1 - (distance / config.maxLineDistance);
            const lineColor = config.lineColors[
              Math.floor(Math.random() * config.lineColors.length)
            ];
            
            ctx.beginPath();
            ctx.strokeStyle = lineColor.replace(')', `, ${opacity * 0.3})`);
            ctx.lineWidth = 0.3;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }
    
    // 动画循环
    function animate() {
      // 使用半透明清空实现拖尾效果
      ctx.fillStyle = 'rgba(10, 14, 26, 0.05)';
      ctx.fillRect(0, 0, width, height);
      
      // 更新和绘制粒子
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // 绘制连接线
      drawLines();
      
      animationId = requestAnimationFrame(animate);
    }
    
    // 窗口大小调整
    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    }
    
    // 鼠标移动跟踪
    function handleMouseMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    
    // 鼠标离开
    function handleMouseLeave() {
      mouse.x = -1000;
      mouse.y = -1000;
    }
    
    // 触摸设备支持
    function handleTouchMove(e) {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        e.preventDefault();
      }
    }
    
    // 淡入效果
    function fadeInCanvas() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / config.fadeInDuration, 1);
      
      canvas.style.opacity = progress * 0.7;
      
      if (progress < 1) {
        requestAnimationFrame(fadeInCanvas);
      }
    }
    
    // 卡片鼠标跟踪
    function initCardTracking() {
      const cards = document.querySelectorAll('.recent-post-item');
      
      cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          
          card.style.setProperty('--mouse-x', `${x}%`);
          card.style.setProperty('--mouse-y', `${y}%`);
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.removeProperty('--mouse-x');
          card.style.removeProperty('--mouse-y');
        });
      });
    }
    
    // 性能监控
    function initPerformanceMonitor() {
      let frameCount = 0;
      let lastTime = performance.now();
      const fpsElement = document.createElement('div');
      
      // 只在开发环境显示FPS
      if (window.location.hostname === 'localhost') {
        fpsElement.style.position = 'fixed';
        fpsElement.style.bottom = '10px';
        fpsElement.style.left = '10px';
        fpsElement.style.background = 'rgba(0,0,0,0.7)';
        fpsElement.style.color = '#0f0';
        fpsElement.style.padding = '5px 10px';
        fpsElement.style.borderRadius = '5px';
        fpsElement.style.fontFamily = 'monospace';
        fpsElement.style.fontSize = '12px';
        fpsElement.style.zIndex = '9999';
        fpsElement.textContent = 'FPS: --';
        document.body.appendChild(fpsElement);
        
        function updateFPS() {
          frameCount++;
          const currentTime = performance.now();
          if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            fpsElement.textContent = `FPS: ${fps} | Particles: ${particles.length}`;
            frameCount = 0;
            lastTime = currentTime;
          }
          requestAnimationFrame(updateFPS);
        }
        
        updateFPS();
      }
    }
    
    // 初始化
    function init() {
      handleResize();
      animate();
      fadeInCanvas();
      initCardTracking();
      
      // 事件监听
      window.addEventListener('resize', handleResize);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      
      // 性能监控（仅开发环境）
      if (window.location.hostname === 'localhost') {
        initPerformanceMonitor();
      }
      
      console.log('✅ 粒子动画 + 渐变流动背景初始化完成');
    }
    
    // 清理函数
    window.cleanupCombinedBackground = function() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      
      console.log('🧹 粒子动画已清理');
    };
    
    // 启动
    init();
  }
})();