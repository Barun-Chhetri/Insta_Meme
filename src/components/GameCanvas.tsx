import React, { useEffect, useRef } from 'react';
import type { Fish, GameState } from '../types/game';

interface GameCanvasProps {
  gameState: GameState;
  ownerMood: 'suspicious' | 'furious' | 'confused' | 'flabbergasted' | 'phone' | 'calm';
  ownerAnger: number; // 0 - 100
  isReeling: boolean;
  hasBite: boolean;
  isCasting: boolean;
  isZoomed: boolean;
  screenShake: boolean;
  hitTheRoadText: string | null;
  dramaticCaption: string | null;
  caughtFish: Fish | null;
  onCanvasClick: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  ownerMood,
  ownerAnger,
  isReeling,
  hasBite,
  isCasting,
  isZoomed,
  screenShake,
  hitTheRoadText,
  dramaticCaption,
  caughtFish,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation states
  const animTimeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const ownerXRef = useRef<number>(950); // approaches to ~720
  const ownerTargetXRef = useRef<number>(720);
  const shakeIntensityRef = useRef<number>(0);
  const zoomFactorRef = useRef<number>(1);

  // Trigger shake when screenShake prop updates
  useEffect(() => {
    if (screenShake) {
      shakeIntensityRef.current = 18;
    }
  }, [screenShake]);

  // Main render loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      animTimeRef.current += 0.03;
      const t = animTimeRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Update camera zoom smoothly
      const targetZoom = isZoomed ? 1.6 : 1.0;
      zoomFactorRef.current += (targetZoom - zoomFactorRef.current) * 0.08;

      // Update screen shake
      let shakeX = 0;
      let shakeY = 0;
      if (shakeIntensityRef.current > 0.1) {
        shakeX = (Math.random() - 0.5) * shakeIntensityRef.current;
        shakeY = (Math.random() - 0.5) * shakeIntensityRef.current;
        shakeIntensityRef.current *= 0.88;
      }

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Apply screen shake & zoom (centered on owner when zoomed)
      ctx.translate(width / 2 + shakeX, height / 2 + shakeY);
      ctx.scale(zoomFactorRef.current, zoomFactorRef.current);
      if (isZoomed) {
        ctx.translate(-width / 2 + 150, -height / 2 + 30);
      } else {
        ctx.translate(-width / 2, -height / 2);
      }

      // 1. SKY GRADIENT
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
      skyGrad.addColorStop(0, '#5cb8ff');
      skyGrad.addColorStop(0.5, '#bfe7ff');
      skyGrad.addColorStop(1, '#fef9e7');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      const cloud1X = ((t * 12) % (width + 300)) - 150;
      drawCloud(ctx, cloud1X, 65, 90);
      const cloud2X = (((t * 8) + 400) % (width + 300)) - 150;
      drawCloud(ctx, cloud2X, 110, 70);

      // 2. DISTANT RURAL BACKGROUND (TRACTOR SUPPLY BUILDING & TREES)
      drawRuralBackground(ctx, width, height);

      // 3. GROUND / BANK / MUD PATCH
      drawBankAndMud(ctx, width, height);

      // 4. RETENTION POND (WATER, WAVES, LILY PADS, FISH SHADOWS)
      drawRetentionPond(ctx, width, height, t);

      // 5. BOBBER & FISHING LINE
      const bobberX = width * 0.38 + Math.sin(t * 1.5) * 4;
      const bobberY = height * 0.72 + Math.cos(t * 2.2) * (hasBite ? 7 : 3);
      drawFishingLineAndBobber(ctx, width, height, t, isReeling, hasBite, bobberX, bobberY);

      // 6. FISHERMAN CHARACTER
      drawFisherman(ctx, width, height, t, isReeling, hasBite, isCasting, caughtFish);

      // 7. OWNER CHARACTER (Tractor Supply's Daddy)
      const isOwnerPresent = gameState !== 'INTRO';
      if (isOwnerPresent) {
        // Move owner smoothly onto screen
        ownerXRef.current += (ownerTargetXRef.current - ownerXRef.current) * 0.04;
      } else {
        ownerXRef.current = 1050; // offscreen
      }
      drawOwner(ctx, ownerXRef.current, height * 0.68, t, ownerMood, ownerAnger);

      // 8. PARTICLES (Splashes, Mud, Steam)
      updateAndDrawParticles(ctx);

      // Spawn periodic steam particles from owner's ears if angry
      if (ownerAnger > 30 && Math.random() < ownerAnger / 250) {
        spawnSteamParticle(ownerXRef.current, height * 0.68 - 110);
      }

      ctx.restore();

      // OVERLAY FX (Speed lines if zoomed)
      if (isZoomed) {
        drawSpeedLines(ctx, width, height, t);
      }

      // COMIC OVERLAYS: HIT THE ROAD!
      if (hitTheRoadText) {
        drawHitTheRoadBanner(ctx, width, height, hitTheRoadText, t);
      }

      // DRAMATIC CAPTION: LOCK 'EM UP?!
      if (dramaticCaption) {
        drawDramaticCaption(ctx, width, height, dramaticCaption, t);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, ownerMood, ownerAnger, isReeling, hasBite, isCasting, isZoomed, hitTheRoadText, dramaticCaption, caughtFish]);

  // Helper drawing functions
  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
    ctx.arc(x + r * 0.4, y - r * 0.2, r * 0.6, 0, Math.PI * 2);
    ctx.arc(x + r * 0.9, y, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawRuralBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Distant hill silhouette
    ctx.fillStyle = '#6fa476';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.48);
    ctx.bezierCurveTo(width * 0.3, height * 0.44, width * 0.7, height * 0.49, width, height * 0.46);
    ctx.lineTo(width, height * 0.6);
    ctx.lineTo(0, height * 0.6);
    ctx.closePath();
    ctx.fill();

    // Tractor Supply Building in distance (Right side)
    const bldgX = width * 0.68;
    const bldgY = height * 0.36;
    const bldgW = 220;
    const bldgH = 90;

    // Building wall (tan / grey)
    ctx.fillStyle = '#dcd4c8';
    ctx.fillRect(bldgX, bldgY, bldgW, bldgH);

    // Green Roof
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.moveTo(bldgX - 10, bldgY);
    ctx.lineTo(bldgX + bldgW / 2, bldgY - 26);
    ctx.lineTo(bldgX + bldgW + 10, bldgY);
    ctx.closePath();
    ctx.fill();

    // Red Tractor Supply Accent Stripe
    ctx.fillStyle = '#ba181b';
    ctx.fillRect(bldgX, bldgY + 20, bldgW, 16);

    // Tractor Supply Signboard
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bldgX + 25, bldgY + 8, bldgW - 50, 24);
    ctx.strokeStyle = '#ba181b';
    ctx.lineWidth = 2;
    ctx.strokeRect(bldgX + 25, bldgY + 8, bldgW - 50, 24);

    ctx.fillStyle = '#ba181b';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRACTOR SUPPLY CO.', bldgX + bldgW / 2, bldgY + 24);

    // Silo / Water tank
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(bldgX - 35, bldgY - 10, 28, 100);
    ctx.beginPath();
    ctx.arc(bldgX - 21, bldgY - 10, 14, Math.PI, 0);
    ctx.fill();

    // Telephone poles & wires
    ctx.strokeStyle = '#6d594b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.35);
    ctx.lineTo(width * 0.15, height * 0.52);
    ctx.moveTo(width * 0.45, height * 0.36);
    ctx.lineTo(width * 0.45, height * 0.52);
    ctx.stroke();

    // Wire
    ctx.strokeStyle = 'rgba(70, 60, 50, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.37);
    ctx.quadraticCurveTo(width * 0.08, height * 0.39, width * 0.15, height * 0.37);
    ctx.quadraticCurveTo(width * 0.30, height * 0.40, width * 0.45, height * 0.38);
    ctx.quadraticCurveTo(width * 0.65, height * 0.41, bldgX, height * 0.39);
    ctx.stroke();
  };

  const drawBankAndMud = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Muddy grassy bank (Back slope)
    ctx.fillStyle = '#588157';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.58);
    ctx.bezierCurveTo(width * 0.4, height * 0.55, width * 0.7, height * 0.56, width, height * 0.53);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Red clay dirt road / mud tire tracks on right side
    const mudGrad = ctx.createLinearGradient(width * 0.55, 0, width, 0);
    mudGrad.addColorStop(0, 'rgba(160, 82, 45, 0)');
    mudGrad.addColorStop(0.3, 'rgba(160, 82, 45, 0.85)');
    mudGrad.addColorStop(1, '#8b4513');
    ctx.fillStyle = mudGrad;
    ctx.beginPath();
    ctx.moveTo(width * 0.55, height * 0.64);
    ctx.lineTo(width, height * 0.55);
    ctx.lineTo(width, height);
    ctx.lineTo(width * 0.5, height);
    ctx.closePath();
    ctx.fill();

    // Deep mud tire ruts
    ctx.strokeStyle = '#5a2d0c';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(width * 0.7, height * 0.72);
    ctx.bezierCurveTo(width * 0.8, height * 0.73, width * 0.9, height * 0.75, width, height * 0.74);
    ctx.moveTo(width * 0.68, height * 0.78);
    ctx.bezierCurveTo(width * 0.78, height * 0.80, width * 0.88, height * 0.82, width, height * 0.81);
    ctx.stroke();

    // Mud puddle with reflection
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.ellipse(width * 0.78, height * 0.77, 65, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(180, 140, 100, 0.5)';
    ctx.beginPath();
    ctx.ellipse(width * 0.78, height * 0.76, 50, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fallen "PRIVATE PROPERTY" wooden signpost
    ctx.fillStyle = '#795548';
    ctx.fillRect(width * 0.58, height * 0.58, 8, 45); // post
    // Signboard fallen at an angle in the mud!
    ctx.save();
    ctx.translate(width * 0.60, height * 0.64);
    ctx.rotate(0.35);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(-22, -14, 44, 28);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.strokeRect(-22, -14, 44, 28);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NO', 0, -4);
    ctx.fillText('FISHING', 0, 4);
    // Mud splatter on sign
    ctx.fillStyle = 'rgba(101, 67, 33, 0.7)';
    ctx.beginPath();
    ctx.arc(8, 6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Red Pickup Truck parked on the bank
    drawPickupTruck(ctx, width * 0.82, height * 0.59);
  };

  const drawPickupTruck = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Cab & Bed (Old red farm truck)
    ctx.fillStyle = '#b91c1c';
    // Truck bed
    ctx.fillRect(-70, -22, 60, 24);
    // Cab
    ctx.fillRect(-10, -36, 48, 38);
    // Hood
    ctx.fillRect(38, -20, 24, 22);

    // Windows
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(-6, -33, 22, 14);
    ctx.fillRect(18, -33, 16, 14);

    // Tires
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(-45, 4, 13, 0, Math.PI * 2);
    ctx.arc(42, 4, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(-45, 4, 5, 0, Math.PI * 2);
    ctx.arc(42, 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Mud on truck panels
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(-45, -5, 10, 0, Math.PI * 2);
    ctx.arc(42, -5, 9, 0, Math.PI * 2);
    ctx.arc(-10, -4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Fishing rods poking out of truck bed
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-50, -15);
    ctx.lineTo(-85, -45);
    ctx.stroke();

    ctx.restore();
  };

  const drawRetentionPond = (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
    // Pond water area (Left to Center-Right)
    const waterGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
    waterGrad.addColorStop(0, '#1d4e4f');
    waterGrad.addColorStop(0.5, '#133e3f');
    waterGrad.addColorStop(1, '#0a2324');

    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.64);
    // Sinusoidal wavy water line
    for (let x = 0; x <= width * 0.52; x += 20) {
      const wave = Math.sin(x * 0.02 + t * 2) * 3;
      ctx.lineTo(x, height * 0.64 + wave);
    }
    ctx.bezierCurveTo(width * 0.56, height * 0.75, width * 0.54, height * 0.95, width * 0.48, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Water surface ripples & shimmer
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const rx = (width * 0.15) + (i * 80) + Math.sin(t + i) * 15;
      const ry = height * 0.68 + (i * 22);
      ctx.beginPath();
      ctx.ellipse(rx, ry, 35 + i * 10, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Swimming fish shadows underwater
    ctx.fillStyle = 'rgba(10, 30, 30, 0.45)';
    const fish1X = (width * 0.2 + Math.sin(t * 0.8) * 80);
    const fish1Y = height * 0.78 + Math.cos(t * 0.8) * 15;
    drawFishShadow(ctx, fish1X, fish1Y, 28, Math.cos(t * 0.8) > 0);

    const fish2X = (width * 0.35 + Math.cos(t * 0.6) * 60);
    const fish2Y = height * 0.86 + Math.sin(t * 0.6) * 12;
    drawFishShadow(ctx, fish2X, fish2Y, 40, Math.sin(t * 0.6) > 0);

    // Lily pad with friendly frog
    drawLilyPad(ctx, width * 0.16, height * 0.75);

    // Cattails / Reeds along pond bank
    drawCattails(ctx, width * 0.04, height * 0.64, t);
    drawCattails(ctx, width * 0.47, height * 0.78, t);
  };

  const drawFishShadow = (ctx: CanvasRenderingContext2D, x: number, y: number, len: number, facingRight: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) ctx.scale(-1, 1);
    ctx.beginPath();
    ctx.ellipse(0, 0, len * 0.6, len * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(-len * 0.5, 0);
    ctx.lineTo(-len * 0.8, -len * 0.25);
    ctx.lineTo(-len * 0.8, len * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawLilyPad = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0.4, Math.PI * 2 - 0.4);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();

    // Little frog on pad
    ctx.fillStyle = '#52b788';
    ctx.beginPath();
    ctx.arc(x + 2, y - 6, 6, 0, Math.PI * 2);
    ctx.fill();
    // Frog eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 1, y - 10, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x - 1, y - 10, 1.2, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 10, 1.2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawCattails = (ctx: CanvasRenderingContext2D, x: number, y: number, t: number) => {
    ctx.strokeStyle = '#386641';
    ctx.lineWidth = 3;
    const sway = Math.sin(t + x) * 4;

    for (let i = 0; i < 4; i++) {
      const cx = x + i * 8;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.quadraticCurveTo(cx + sway * 0.5, y - 30, cx + sway, y - 60 - i * 5);
      ctx.stroke();

      // Brown cattail sausage top
      ctx.fillStyle = '#6f4e37';
      ctx.beginPath();
      ctx.ellipse(cx + sway, y - 48 - i * 5, 4, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawFishingLineAndBobber = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    t: number,
    isReeling: boolean,
    hasBite: boolean,
    bobberX: number,
    bobberY: number
  ) => {
    const rodTipX = width * 0.28 + (isReeling ? 5 : 0);
    const rodTipY = height * 0.58 + (isReeling ? 15 : 0);

    // Fishing line
    ctx.strokeStyle = 'rgba(230, 240, 255, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rodTipX, rodTipY);
    // Line droop curve or tight tension
    const droop = isReeling ? -5 : 20;
    ctx.quadraticCurveTo((rodTipX + bobberX) / 2, (rodTipY + bobberY) / 2 + droop, bobberX, bobberY);
    ctx.stroke();

    // Bobber ripples in water
    ctx.strokeStyle = hasBite ? 'rgba(255, 200, 0, 0.7)' : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = hasBite ? 2 : 1;
    const rippleRadius = (t * 20) % 30;
    ctx.beginPath();
    ctx.ellipse(bobberX, bobberY + 6, rippleRadius, rippleRadius * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Bobber (Classic Red & White Float)
    ctx.save();
    ctx.translate(bobberX, bobberY);
    // Red top half
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 8, Math.PI, 0);
    ctx.fill();
    // White bottom half
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // BITE ALERT EXCLAMATION MARK!
    if (hasBite) {
      ctx.save();
      ctx.translate(bobberX, bobberY - 26);
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Luckiest Guy", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, 7);
      ctx.restore();
    }
  };

  const drawFisherman = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    t: number,
    isReeling: boolean,
    hasBite: boolean,
    isCasting: boolean,
    caughtFish: Fish | null
  ) => {
    const chairX = width * 0.22;
    const chairY = height * 0.69;

    ctx.save();
    ctx.translate(chairX, chairY);

    // If casting, animate arm and rod backward then forward
    const castAngle = isCasting ? -0.4 : 0;
    ctx.rotate(castAngle);

    // Green Fold-up Camping Chair
    ctx.strokeStyle = '#1e3a1e';
    ctx.lineWidth = 4;
    // Chair legs X
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(16, 26);
    ctx.moveTo(16, 0);
    ctx.lineTo(-18, 26);
    ctx.stroke();
    // Chair back & seat cloth
    ctx.fillStyle = '#2d6a4f';
    ctx.fillRect(-22, -18, 40, 18);
    ctx.fillRect(-22, -38, 12, 38);

    // Beer / Soda Cooler next to chair
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(24, 6, 28, 20); // cooler body
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(22, 2, 32, 6); // cooler lid
    // Ice cubes visible
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(26, 4, 8, 4);

    // Fisherman Body
    // Khaki Shorts & Legs
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(-8, 2, 10, 18);
    ctx.fillRect(4, 2, 10, 18);
    // Flip flops / sneakers
    ctx.fillStyle = '#334155';
    ctx.fillRect(-12, 18, 14, 6);
    ctx.fillRect(4, 18, 14, 6);

    // Torso (Fisherman Khaki Vest with pockets)
    ctx.fillStyle = '#cca473';
    ctx.fillRect(-14, -28, 28, 30);
    // Pockets
    ctx.fillStyle = '#b08958';
    ctx.fillRect(-10, -18, 8, 8);
    ctx.fillRect(2, -18, 8, 8);

    // Arms holding rod
    ctx.strokeStyle = '#d4a373';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-4, -22);
    ctx.lineTo(12, -14 + (isReeling ? Math.sin(t * 15) * 4 : 0));
    ctx.lineTo(26, -10);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#fbcfe8'; // skin
    ctx.beginPath();
    ctx.arc(0, -38, 12, 0, Math.PI * 2);
    ctx.fill();

    // Sunglasses
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2, -41, 12, 6);

    // Fisherman Bucket Hat
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-14, -46, 26, 10);
    ctx.beginPath();
    ctx.ellipse(0, -42, 18, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sweat drop when fish bites
    if (hasBite) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(14, -46, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fishing Rod
    ctx.save();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(14, -10);
    // If reeling, rod bends violently!
    const bendX = isReeling ? 55 : 45;
    const bendY = isReeling ? -28 : -38;
    const tipX = isReeling ? 70 : 65;
    const tipY = isReeling ? -42 : -62;
    ctx.quadraticCurveTo(bendX, bendY, tipX, tipY);
    ctx.stroke();

    // Reel spool
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(22, -8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Catch Victory Display: Holding fish triumphantly!
    if (caughtFish) {
      ctx.save();
      ctx.translate(10, -68);
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(caughtFish.icon, 0, 0);

      // Sparkles around fish
      ctx.fillStyle = '#fde047';
      for (let s = 0; s < 4; s++) {
        const sx = Math.cos(t * 4 + s * 1.5) * 25;
        const sy = Math.sin(t * 4 + s * 1.5) * 20;
        ctx.fillRect(sx, sy, 4, 4);
      }
      ctx.restore();
    }

    ctx.restore();
  };

  const drawOwner = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    t: number,
    mood: 'suspicious' | 'furious' | 'confused' | 'flabbergasted' | 'phone' | 'calm',
    anger: number
  ) => {
    ctx.save();
    ctx.translate(x, y);

    const isFurious = mood === 'furious' || anger > 55;
    const stompOffset = isFurious ? Math.abs(Math.sin(t * 8)) * 4 : 0;

    // Red neck / anger skin tint!
    // Face transitions from pale beige to flushed red based on anger
    const angerRatio = Math.min(1, anger / 100);
    const r = Math.round(245 + angerRatio * 10);
    const g = Math.round(195 - angerRatio * 125);
    const b = Math.round(175 - angerRatio * 125);
    const skinColor = `rgb(${r}, ${g}, ${b})`;

    // Legs & Work Boots
    ctx.fillStyle = '#1e3a5f'; // Denim jeans
    ctx.fillRect(-16, -15 - stompOffset, 14, 35);
    ctx.fillRect(4, -15, 14, 35);

    // Heavy muddy work boots
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(-22, 16 - stompOffset, 20, 10);
    ctx.fillRect(4, 16, 20, 10);

    // Torso: Red Plaid Shirt under Denim Overalls
    ctx.fillStyle = '#dc2626'; // red shirt sleeves
    ctx.fillRect(-22, -65, 46, 52);

    // Denim Bib Overalls
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(-18, -48, 38, 38);
    // Overalls shoulder straps with brass buckles
    ctx.fillRect(-16, -65, 8, 20);
    ctx.fillRect(10, -65, 8, 20);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-16, -48, 8, 4);
    ctx.fillRect(10, -48, 8, 4);

    // Big Beer Belly profile
    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.ellipse(0, -32, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';

    if (mood === 'phone') {
      // Holding chunky flip phone to ear
      ctx.beginPath();
      ctx.moveTo(14, -55);
      ctx.lineTo(24, -75);
      ctx.stroke();
      // Flip phone
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(22, -88, 10, 18);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(24, -84, 6, 8); // phone screen
    } else if (isFurious) {
      // Aggressively pointing finger at fisherman
      ctx.beginPath();
      ctx.moveTo(-12, -55);
      ctx.lineTo(-45, -50 + Math.sin(t * 10) * 3);
      ctx.stroke();
      // Pointing hand
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(-47, -50 + Math.sin(t * 10) * 3, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Hands on hips
      ctx.beginPath();
      ctx.moveTo(-16, -55);
      ctx.lineTo(-26, -42);
      ctx.lineTo(-16, -32);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(16, -55);
      ctx.lineTo(26, -42);
      ctx.lineTo(16, -32);
      ctx.stroke();
    }

    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -82, 16, 0, Math.PI * 2);
    ctx.fill();

    // White bushy mustache & stubble
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -75, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Angry eyes / eyebrows
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    if (isFurious) {
      // Angled sharp furious eyebrows
      ctx.beginPath();
      ctx.moveTo(-10, -88);
      ctx.lineTo(-2, -84);
      ctx.moveTo(10, -88);
      ctx.lineTo(2, -84);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-10, -86);
      ctx.lineTo(-2, -86);
      ctx.moveTo(2, -86);
      ctx.lineTo(10, -86);
      ctx.stroke();
    }

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-6, -83, 2.5, 0, Math.PI * 2);
    ctx.arc(6, -83, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Red Trucker Cap with Green Patch
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(0, -90, 16, Math.PI, 0);
    ctx.fill();
    // Cap visor
    ctx.fillRect(-22, -92, 28, 5);
    // Front white patch
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -98, 12, 7);

    ctx.restore();
  };

  const spawnSteamParticle = (x: number, y: number) => {
    particlesRef.current.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -1.5 - Math.random() * 2,
      size: 4 + Math.random() * 5,
      color: 'rgba(255, 255, 255, 0.8)',
      alpha: 0.9,
      life: 0,
      maxLife: 35
    });
  };

  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D) => {
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.size += 0.2;
      const progress = p.life / p.maxLife;
      const alpha = p.alpha * (1 - progress);

      ctx.fillStyle = p.color.replace('0.8', `${alpha.toFixed(2)}`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.life >= p.maxLife) {
        particlesRef.current.splice(i, 1);
      }
    }
  };

  const drawSpeedLines = (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 2;
    const cx = width * 0.72;
    const cy = height * 0.5;

    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2 + Math.sin(t * 10 + i) * 0.05;
      const r1 = 180 + Math.random() * 40;
      const r2 = 600;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawHitTheRoadBanner = (ctx: CanvasRenderingContext2D, width: number, height: number, text: string, t: number) => {
    ctx.save();
    ctx.translate(width / 2, height * 0.28);
    // Comic rotation and wobble
    ctx.rotate(-0.06 + Math.sin(t * 8) * 0.03);

    // Big comic text drop shadow
    ctx.font = '900 68px "Luckiest Guy", "Bangers", sans-serif';
    ctx.textAlign = 'center';

    // Black heavy border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.strokeText(text, 0, 0);

    // Red to Yellow gradient text
    const grad = ctx.createLinearGradient(0, -50, 0, 20);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#dc2626');
    ctx.fillStyle = grad;
    ctx.fillText(text, 0, 0);

    ctx.restore();
  };

  const drawDramaticCaption = (ctx: CanvasRenderingContext2D, width: number, height: number, text: string, t: number) => {
    ctx.save();
    ctx.translate(width / 2, height * 0.38);

    // Comic explosion burst background
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    const numPoints = 16;
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? 190 : 130;
      const angle = (i / (numPoints * 2)) * Math.PI * 2 + t * 0.5;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * (radius * 0.55);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.font = '900 60px "Luckiest Guy", "Bangers", sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 12;
    ctx.strokeText(text, 0, 18);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 0, 18);
    ctx.restore();
  };

  return (
    <div className="game-canvas-wrapper" onClick={onCanvasClick}>
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        className="game-canvas"
      />
    </div>
  );
};
