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

    // Grid spacing configurations
    const spacing = 35;
    const dashLength = 8;
    const maxDistance = 180; // hover glow radius

    // Particle class representing each dash
    class Dash {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.targetAngle = 0;
        this.opacity = 0.08;
        this.targetOpacity = 0.08;
        // Static hue based on screen position to create a beautiful fixed gradient map
        this.hue = Math.floor(((x / width) * 100 + (y / height) * 200) + 260) % 360; 
      }

      update(mx, my, active) {
        const dx = mx - this.x;
        const dy = my - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (active && dist < maxDistance) {
          // Rotate to point towards the cursor
          this.targetAngle = Math.atan2(dy, dx);
          // Fade in based on proximity
          this.targetOpacity = 0.15 + (1 - dist / maxDistance) * 0.75;
        } else {
          // Default state
          this.targetAngle = Math.PI / 4; // 45 degrees default tilt
          this.targetOpacity = 0.06;
        }

        // Smooth transitions (interpolation)
        let angleDiff = this.targetAngle - this.angle;
        // Normalize angle difference to [-PI, PI] for shortest rotation path
        angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        this.angle += angleDiff * 0.1;
        this.opacity += (this.targetOpacity - this.opacity) * 0.1;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw the dash segment
        ctx.beginPath();
        ctx.moveTo(-dashLength / 2, 0);
        ctx.lineTo(dashLength / 2, 0);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';

        if (this.opacity > 0.08) {
          // Glowing state: colorful gradient sweep
          ctx.strokeStyle = `hsla(${this.hue}, 85%, 65%, ${this.opacity})`;
          ctx.shadowColor = `hsla(${this.hue}, 85%, 65%, 0.4)`;
          ctx.shadowBlur = 4;
        } else {
          // Inactive state: faint grey
          ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.restore();
      }
    }

    let dashes = [];
    const initGrid = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      dashes = [];

      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          dashes.push(new Dash(c * spacing, r * spacing));
        }
      }
    };

    initGrid();

    // Event listeners
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

    // Animation Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const active = mouseRef.current.active;

      dashes.forEach((dash) => {
        dash.update(mx, my, active);
        dash.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup
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
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.85
      }}
    />
  );
}
