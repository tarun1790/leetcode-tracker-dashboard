import React, { useEffect, useRef } from 'react';

export default function InteractiveGridBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Spacing between grid points
    const spacing = 32;
    const maxDistance = 200; // Radius of interaction (slightly tighter)

    class Bubble {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 1.0; // Smaller base radius
        this.opacity = 0.04; // Slightly fainter default opacity
        this.isGlowing = false;
      }

      update(mx, my, active) {
        const dx = this.x - mx;
        const dy = this.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetRadius = 1.0;
        let targetOpacity = 0.04;
        let glowing = false;

        if (active && dist < maxDistance) {
          const factor = 1 - dist / maxDistance;
          // Radius expands up to 4.5px (much smaller and more elegant)
          targetRadius = 1.0 + factor * 3.5;
          // Opacity goes up to 0.50
          targetOpacity = 0.04 + factor * 0.46;
          glowing = true;
        }

        // Smoothly interpolate radius and opacity
        this.radius += (targetRadius - this.radius) * 0.1;
        this.opacity += (targetOpacity - this.opacity) * 0.1;
        this.isGlowing = glowing;
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (this.isGlowing && this.opacity > 0.05) {
          // Glow state: solid glowing golden brown dot (hue 38)
          // Gradients the lightness to be slightly brighter gold at the cursor center
          const factor = (this.radius - 1.0) / 3.5;
          const lightness = 42 + factor * 18;
          ctx.fillStyle = `hsla(38, 78%, ${lightness}%, ${this.opacity})`;
          ctx.shadowColor = `hsla(38, 78%, 50%, 0.4)`;
          ctx.shadowBlur = 4;
          ctx.fill();
        } else {
          // Inactive state: tiny solid grey dot
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.shadowBlur = 0;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    let bubbles = [];
    const initGrid = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      bubbles = [];

      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          bubbles.push(new Bubble(c * spacing, r * spacing));
        }
      }
    };

    initGrid();

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleResize = () => {
      initGrid();
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const active = mouseRef.current.active;

      bubbles.forEach((bubble) => {
        bubble.update(mx, my, active);
        bubble.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.75
      }}
    />
  );
}
