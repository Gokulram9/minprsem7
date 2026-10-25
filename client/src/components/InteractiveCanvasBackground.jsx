import { useEffect, useRef } from 'react';

const InteractiveCanvasBackground = ({ 
  colorOverride = null, 
  density = 80, 
  maxDistance = 120, 
  speed = 0.6,
  interactive = false 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = canvas.width = canvas.parentElement ? canvas.parentElement.offsetWidth : window.innerWidth;
    let height = canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight;
    
    let particles = [];
    const mouse = { x: null, y: null, radius: 150 };

    // Function to get active theme color
    const getParticleColor = () => {
      if (colorOverride) return colorOverride;
      // Get the active primary color variable from document element styles
      const style = getComputedStyle(document.documentElement);
      const brandColor = style.getPropertyValue('--color-brand-primary').trim();
      return brandColor || '#3B82F6';
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.radius = Math.random() * 2 + 1.2;
      }

      update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off bounds with small inset padding
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Keep inside bounds
        if (this.x < 0) this.x = 0;
        if (this.x > width) this.x = width;
        if (this.y < 0) this.y = 0;
        if (this.y > height) this.y = height;

      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor();
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const calculatedDensity = Math.min(density, Math.floor((width * height) / 12000));
      const count = Math.max(15, calculatedDensity);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const themeColor = getParticleColor();
      
      // Update & Draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            // Calculate opacity proportional to distance
            const alpha = (1 - dist / maxDistance) * 0.15;
            ctx.strokeStyle = themeColor;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // Draw connection to mouse
      if (interactive && mouse.x !== null && mouse.y !== null) {
        particles.forEach(p => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            const alpha = (1 - dist / mouse.radius) * 0.12;
            ctx.strokeStyle = themeColor;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.6;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement ? canvas.parentElement.offsetWidth : window.innerWidth;
      height = canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight;
      init();
    };

    // Setup events
    window.addEventListener('resize', handleResize);

    // Initialize & Start
    init();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colorOverride, density, maxDistance, speed]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 block"
      style={{ opacity: 0.6 }}
    />
  );
};

export default InteractiveCanvasBackground;
