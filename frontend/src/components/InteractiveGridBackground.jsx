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
    const maxDistance = 250; // Radius of interaction

    class Dash {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = Math.PI / 4; // Initial default tilt (45 degrees)
        this.length = 2;
        this.opacity = 0.05;
        this.hue = 0;
        this.isGlowing = false;
      }

      update(mx, my, active) {
        const dx = this.x - mx;
        const dy = this.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetAngle = Math.PI / 4; // Default tilt angle (45 deg)
        let targetOpacity = 0.05;
        let targetLength = 2;
        let targetHue = 0;
        let glowing = false;

        if (active && dist < maxDistance) {
          const factor = 1 - dist / maxDistance;
          // Perpendicular (tangent) angle to create concentric circles around cursor
          targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
          // Opacity goes up to 0.5
          targetOpacity = 0.05 + factor * 0.45;
          // Length goes up to 10px
          targetLength = 2 + factor * 8;
          // Radial hue sweep centered at the cursor
          targetHue = Math.floor((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360);
          glowing = true;
        }

        // Smoothly interpolate angle
        let angleDiff = targetAngle - this.angle;
        // Normalize angle difference to [-PI, PI] to prevent spins
        angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        this.angle += angleDiff * 0.1;

        // Smoothly interpolate length and opacity
        this.length += (targetLength - this.length) * 0.1;
        this.opacity += (targetOpacity - this.opacity) * 0.1;
        this.hue = targetHue;
        this.isGlowing = glowing;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(-this.length / 2, 0);
        ctx.lineTo(this.length / 2, 0);
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';

        if (this.isGlowing && this.opacity > 0.06) {
          // Glow state: beautiful dynamic HSL color wheel centered on cursor
          ctx.strokeStyle = `hsla(${this.hue}, 85%, 65%, ${this.opacity})`;
          ctx.shadowColor = `hsla(${this.hue}, 85%, 65%, 0.4)`;
          ctx.shadowBlur = 3;
        } else {
          // Faint grey default state
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

      dashes.forEach((dash) => {
        dash.update(mx, my, active);
        dash.draw();
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
