import React, { useState, useEffect } from 'react';
import { ExerciseMovementGroup } from '../../types';
import { MOVEMENT_GROUPS_CATALOG } from '../../utils/gameRules';
import { Sparkles } from 'lucide-react';

interface StudentPECharacterProps {
  movement: ExerciseMovementGroup;
  currentRep?: number;
  totalReps?: number;
  isExercising?: boolean;
  onFinishExercise?: () => void;
  characterGender?: 'boy' | 'girl';
  onGenderChange?: (gender: 'boy' | 'girl') => void;
  showControls?: boolean;
}

export const StudentPECharacter: React.FC<StudentPECharacterProps> = ({
  movement,
  currentRep = 1,
  totalReps = 4,
  isExercising = false,
  onFinishExercise,
  characterGender: controlledGender,
  onGenderChange,
  showControls = true,
}) => {
  const [localGender, setLocalGender] = useState<'boy' | 'girl'>('boy');
  const gender = controlledGender ?? localGender;
  const setGender = (g: 'boy' | 'girl') => {
    setLocalGender(g);
    onGenderChange?.(g);
  };

  const [phase, setPhase] = useState<number>(0);
  const [idlePhase, setIdlePhase] = useState<number>(0);
  const [internalRep, setInternalRep] = useState(currentRep);
  const [isPlaying, setIsPlaying] = useState(isExercising);

  const meta = MOVEMENT_GROUPS_CATALOG.find((m) => m.id === movement) || MOVEMENT_GROUPS_CATALOG[0];

  useEffect(() => {
    setIsPlaying(isExercising);
    setInternalRep(currentRep);
  }, [isExercising, currentRep]);

  // Unified animation cycle loop with smooth requestAnimationFrame
  useEffect(() => {
    let animId: number;
    let startTime: number | null = null;
    const durationMs = 1600; // 1.6s per exercise repetition cycle
    const idlePeriodMs = 3600; // 3.6s gentle human breathing cycle when resting

    const loop = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (isPlaying) {
        setPhase((elapsed % durationMs) / durationMs);
      } else {
        setPhase(0);
      }
      setIdlePhase((elapsed % idlePeriodMs) / idlePeriodMs);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Angular parameters for continuous human movement (radians)
  const theta = phase * Math.PI * 2;
  // Inertia lag for distal joints (child joints follow parent joints with 0.4 rad ~ 23deg phase delay)
  const thetaLag = theta - 0.42;
  const thetaLag2 = theta - 0.85;

  // Primary smooth wave functions
  const sinPrimary = Math.sin(theta);
  const cosPrimary = Math.cos(theta);
  const sinLag = Math.sin(thetaLag);
  const cosLag = Math.cos(thetaLag);
  const sinLag2 = Math.sin(thetaLag2);
  const cosLag2 = Math.cos(thetaLag2);
  const sinDouble = Math.sin(theta * 2);
  const cosDouble = Math.cos(theta * 2);

  // Subtle natural idle human breathing wave when resting
  const idleTheta = idlePhase * Math.PI * 2;
  const breatheSin = Math.sin(idleTheta);

  // =========================================================================
  // ANATOMICAL JOINT KINEMATIC CHAIN (HUMAN MOVEMENT COUPLING)
  // All joints work in coordinated unison rather than single isolated rotation
  // =========================================================================

  // Root Pelvis & Spine (Cột sống và Thân người)
  let pelvisX = 0;
  let pelvisY = 0;
  let spineLean = 0; // Lateral spine curve (degrees)
  let spinePitch = 0; // Forward/backward lean
  let spineStretchY = 0; // Vertical elongation

  // Head & Neck (Cổ và Đầu)
  let neckTilt = 0;
  let headY = 0;
  let headNod = 0;

  // Shoulder Girdle & Arms (Vai và Cánh tay)
  let leftShoulderY = 0;
  let rightShoulderY = 0;
  let leftUpperArmAngle = 0;
  let rightUpperArmAngle = 0;
  let leftForearmAngle = 0;
  let rightForearmAngle = 0;
  let leftWristAngle = 0;
  let rightWristAngle = 0;

  // Legs, Knees & Ankles (Hông, Đầu gối và Cổ chân)
  let leftHipAngle = 0;
  let rightHipAngle = 0;
  let leftKneeAngle = 0;
  let rightKneeAngle = 0;
  let leftAnkleAngle = 0;
  let rightAnkleAngle = 0;

  if (!isPlaying) {
    // IDLE MODE: Natural alive human posture with subtle rhythmic respiration
    // Chest gently rises 1.5px, shoulders relax softly, micro head tilt keeps character alive
    spineStretchY = -breatheSin * 1.5;
    leftShoulderY = -breatheSin * 1.2;
    rightShoulderY = -breatheSin * 1.2;
    neckTilt = Math.sin(idleTheta * 0.5) * 1.2;
    headY = breatheSin * 0.8;
    leftUpperArmAngle = 4 + breatheSin * 1.5;
    rightUpperArmAngle = -4 - breatheSin * 1.5;
    leftForearmAngle = 8 + breatheSin * 1.2;
    rightForearmAngle = -8 - breatheSin * 1.2;
  } else {
    // EXERCISE MODE: Coordinated multi-joint kinematic simulations
    switch (movement) {
      case 'neck': {
        // 1. CỔ: Nghiêng đầu sang trái/phải nhẹ nhàng, trở về trung tâm tự nhiên
        // Cột sống hơi uốn cong bù trừ (-2.5 deg) để giữ thăng bằng cơ thể
        // Vai hơi hạ thấp phía bên nghiêng để giãn cơ cổ tối đa
        neckTilt = sinPrimary * 14; // Gentle 14 deg tilt, perfectly within human comfort range
        headY = Math.abs(cosPrimary) * 2;
        headNod = Math.sin(theta * 2) * 2.5; // Subtle nod down/up during transition
        spineLean = -sinPrimary * 2.5; // Natural counter-balance spine curve
        leftShoulderY = sinPrimary * 3; // Reciprocal shoulder elevation/depression
        rightShoulderY = -sinPrimary * 3;
        // Arms hang relaxed with slight inertia follow
        leftUpperArmAngle = 3 + sinLag * 2;
        rightUpperArmAngle = -3 + sinLag * 2;
        leftForearmAngle = 6;
        rightForearmAngle = -6;
        break;
      }

      case 'shoulders': {
        // 2. VAI: Nâng, hạ và xoay tròn vai; phối hợp nhịp nhàng với cánh tay và lồng ngực
        // Vai chuyển động theo quỹ đạo elip (nâng lên, xoay ra sau, hạ xuống, đưa về trước)
        const rollY = -Math.sin(theta) * 7.5; // Vertical elevation
        const rollX = Math.cos(theta) * 3; // Forward/backward pitch
        leftShoulderY = rollY;
        rightShoulderY = rollY;
        spinePitch = rollX * 0.8; // Cột sống hơi ưỡn nhẹ khi vai mở ra sau
        // Cánh tay phối hợp: khi vai nâng và xoay, cánh tay mở nhẹ ra ngoài với độ trễ quán tính
        leftUpperArmAngle = -12 + sinLag * 12;
        rightUpperArmAngle = 12 - sinLag * 12;
        leftForearmAngle = 18 + sinLag2 * 8; // Khuỷu tay co tự nhiên theo quán tính
        rightForearmAngle = -18 - sinLag2 * 8;
        headY = rollY * 0.25;
        break;
      }

      case 'wrists': {
        // 3. CỔ TAY: Hai bàn tay hướng về phía trước ngực, xoay tròn cổ tay nhẹ nhàng
        // Cẳng tay giữ ở vị trí thoải mái trước ngực, cổ tay xoay chuyển động elip
        leftUpperArmAngle = -32;
        rightUpperArmAngle = 32;
        leftForearmAngle = 65 + Math.sin(thetaLag) * 6;
        rightForearmAngle = -65 - Math.sin(thetaLag) * 6;
        // Cổ tay xoay vòng tròn mượt mà theo 2 trục
        leftWristAngle = sinDouble * 24;
        rightWristAngle = -sinDouble * 24;
        spineLean = sinPrimary * 1.5; // Nhịp thở thân người nhẹ nhàng
        leftShoulderY = -Math.abs(sinPrimary) * 2;
        rightShoulderY = -Math.abs(sinPrimary) * 2;
        break;
      }

      case 'elbows': {
        // 4. KHUỶU TAY: Co và duỗi theo góc tự nhiên của cơ thể người
        // Cẳng tay gập từ 20 độ lên 95 độ và duỗi ra; cánh tay hơi nâng đỡ theo nhịp
        const flexFactor = (1 - Math.cos(theta)) * 0.5; // 0 to 1 smooth curve
        leftUpperArmAngle = -10 - flexFactor * 14;
        rightUpperArmAngle = 10 + flexFactor * 14;
        leftForearmAngle = 18 + flexFactor * 78; // Co duỗi 18 -> 96 độ
        rightForearmAngle = -18 - flexFactor * 78;
        leftWristAngle = flexFactor * 12; // Cổ tay khép tự nhiên khi gập
        rightWristAngle = -flexFactor * 12;
        spineStretchY = -flexFactor * 2;
        break;
      }

      case 'hips': {
        // 5. HÔNG & THÂN: Hai tay chống hông, xoay tròn hông và nghiêng lườn
        // Hông di chuyển theo quỹ đạo elip (X và Y), cột sống uốn lượn bù trừ để đầu giữ thăng bằng
        pelvisX = sinPrimary * 12;
        pelvisY = Math.abs(cosPrimary) * 2;
        spineLean = -sinPrimary * 7; // Cột sống nghiêng lườn bù trừ giữ trọng tâm
        // Hai tay chống hông chắc chắn theo khung xương
        leftUpperArmAngle = -36 + sinPrimary * 3;
        rightUpperArmAngle = 36 + sinPrimary * 3;
        leftForearmAngle = 52;
        rightForearmAngle = -52;
        leftWristAngle = 10;
        rightWristAngle = -10;
        // Khớp gối nhún nhẹ phối hợp theo hông
        leftKneeAngle = Math.max(0, sinPrimary * 5);
        rightKneeAngle = Math.max(0, -sinPrimary * 5);
        break;
      }

      case 'knees': {
        // 6. ĐẦU GỐI: Khớp gối gập và duỗi tự nhiên (squat / nhún nhẹ nhàng)
        // Thân hạ thấp (pelvisY), đầu gối gập, gót chân và cổ chân phối hợp, thân hơi nghiêng trước 5 độ
        const squatDepth = (1 - Math.cos(theta)) * 0.5; // 0 to 1 smooth squat cycle
        pelvisY = squatDepth * 14; // Hông hạ xuống 14px
        spinePitch = squatDepth * 5; // Thân nghiêng nhẹ về trước giữ thăng bằng trọng tâm
        leftHipAngle = -squatDepth * 8; // Đùi hơi mở nhẹ
        rightHipAngle = squatDepth * 8;
        leftKneeAngle = squatDepth * 14; // Đầu gối gập tự nhiên
        rightKneeAngle = -squatDepth * 14;
        leftAnkleAngle = squatDepth * 6; // Cổ chân gập theo (dorsiflexion)
        rightAnkleAngle = -squatDepth * 6;
        // Hai tay đặt nhẹ lên đùi/gối hỗ trợ
        leftUpperArmAngle = -22 + squatDepth * 8;
        rightUpperArmAngle = 22 - squatDepth * 8;
        leftForearmAngle = 34 + squatDepth * 10;
        rightForearmAngle = -34 - squatDepth * 10;
        break;
      }

      case 'ankles': {
        // 7. CỔ CHÂN: Trụ chân trái, nhấc nhẹ gót chân phải xoay tròn cổ chân
        // Chân trụ đứng vững, chân phải nhón mũi xoay tròn 360 độ linh hoạt
        pelvisX = -3; // Dồn trọng tâm nhẹ sang chân trụ bên trái
        rightHipAngle = 6;
        rightKneeAngle = -10; // Gối phải hơi chùng để chân phải thả lỏng
        rightAnkleAngle = sinPrimary * 26; // Cổ chân phải xoay tròn linh hoạt
        // Tay thả lỏng tự nhiên giữ thăng bằng
        leftUpperArmAngle = 6 + sinLag * 2;
        rightUpperArmAngle = -6 - sinLag * 2;
        leftForearmAngle = 10;
        rightForearmAngle = -10;
        spineLean = -2;
        break;
      }

      case 'full_body': {
        // 8. TOÀN THÂN & VƯƠN THỞ: Hít sâu vươn người toàn thân, hai tay vươn cao qua đầu
        // Thân người vươn cao (spineStretchY), cột sống duỗi thẳng, hai tay mở rộng vòng cung lên trời
        const stretchAmount = (1 - Math.cos(theta)) * 0.5; // 0 to 1 wave
        spineStretchY = -stretchAmount * 14; // Thân người vươn cao 14px
        pelvisY = -stretchAmount * 5; // Nhón nhẹ gót chân
        // Hai tay vươn cao qua đầu theo vòng cung tự nhiên
        leftUpperArmAngle = -14 - stretchAmount * 148; // Vươn từ -14 đến -162 độ
        rightUpperArmAngle = 14 + stretchAmount * 148; // Vươn từ 14 đến 162 độ
        leftForearmAngle = stretchAmount * 8;
        rightForearmAngle = -stretchAmount * 8;
        // Cổ chân nhón nhẹ khi vươn cao
        leftAnkleAngle = stretchAmount * 4;
        rightAnkleAngle = -stretchAmount * 4;
        headY = -stretchAmount * 3;
        neckTilt = Math.sin(theta) * 2;
        break;
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#F0F7FF] via-[#E6F4FE] to-[#F8FAFC] rounded-3xl border border-[#BFDBFE]/60 shadow-xs relative overflow-hidden">
      {/* Decorative Gymnastics Badge */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-[11px] font-bold text-[#2684FF] tracking-wider uppercase">
            {meta.shortName}
          </span>
        </div>

        {/* Gender Toggle */}
        {showControls && (
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-[#BFDBFE] shadow-2xs">
            <button
              type="button"
              onClick={() => setGender('boy')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                gender === 'boy' ? 'bg-[#2684FF] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#172B4D]'
              }`}
            >
              👦 Nam sinh
            </button>
            <button
              type="button"
              onClick={() => setGender('girl')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                gender === 'girl' ? 'bg-[#EC4899] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#172B4D]'
              }`}
            >
              👧 Nữ sinh
            </button>
          </div>
        )}
      </div>

      {/* SVG Cartoon Student in THCS Mỹ Hòa PE Uniform */}
      <div className="relative w-48 h-64 sm:w-56 sm:h-72 flex items-center justify-center my-1 select-none">
        {/* Soft Dynamic Shadow on ground matching body vertical elevation */}
        <div
          className="absolute bottom-2 w-32 h-5 bg-[#2684FF]/10 rounded-full blur-xs transition-transform duration-200"
          style={{ transform: `scale(${1 + Math.abs(spineStretchY + pelvisY) * 0.02})` }}
        />

        <svg
          viewBox="0 0 240 320"
          className="w-full h-full drop-shadow-md overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Root Transform: incorporates coordinated vertical elevation and pelvis balance */}
          <g transform={`translate(${pelvisX}, ${pelvisY + spineStretchY})`}>
            {/* ====== LEGS & FEET (HÔNG, GỐI & CỔ CHÂN) ====== */}
            {/* Left Leg */}
            <g
              transform={`translate(100, 180) rotate(${leftHipAngle}, 0, 0)`}
              className="transition-transform duration-75"
            >
              {/* Thigh / Shorts */}
              <rect x="-10" y="0" width="20" height="45" rx="8" fill="#1E40AF" />
              {/* White PE Stripe on short */}
              <rect x="-8" y="5" width="4" height="35" rx="2" fill="#FFFFFF" opacity="0.9" />
              {/* Knee & Shin */}
              <g transform={`translate(0, 40) rotate(${leftKneeAngle}, 0, 0)`}>
                <rect x="-7" y="0" width="14" height="40" rx="6" fill="#FBD38D" />
                {/* White sock */}
                <rect x="-8" y="30" width="16" height="15" rx="4" fill="#FFFFFF" />
                <rect x="-8" y="32" width="16" height="2" fill="#2563EB" />
                {/* Ankle & PE Sneaker */}
                <g transform={`translate(0, 45) rotate(${leftAnkleAngle}, 0, 0)`}>
                  <ellipse cx="-2" cy="3" rx="14" ry="7" fill="#1E293B" />
                  <ellipse cx="-4" cy="2" rx="12" ry="5" fill="#3B82F6" />
                  <rect x="-16" y="5" width="26" height="5" rx="2" fill="#FFFFFF" />
                </g>
              </g>
            </g>

            {/* Right Leg */}
            <g
              transform={`translate(140, 180) rotate(${rightHipAngle}, 0, 0)`}
              className="transition-transform duration-75"
            >
              {/* Thigh / Shorts */}
              <rect x="-10" y="0" width="20" height="45" rx="8" fill="#1E40AF" />
              {/* White PE Stripe on short */}
              <rect x="4" y="5" width="4" height="35" rx="2" fill="#FFFFFF" opacity="0.9" />
              {/* Knee & Shin */}
              <g transform={`translate(0, 40) rotate(${rightKneeAngle}, 0, 0)`}>
                <rect x="-7" y="0" width="14" height="40" rx="6" fill="#FBD38D" />
                {/* White sock */}
                <rect x="-8" y="30" width="16" height="15" rx="4" fill="#FFFFFF" />
                <rect x="-8" y="32" width="16" height="2" fill="#2563EB" />
                {/* Ankle & PE Sneaker */}
                <g transform={`translate(0, 45) rotate(${rightAnkleAngle}, 0, 0)`}>
                  <ellipse cx="2" cy="3" rx="14" ry="7" fill="#1E293B" />
                  <ellipse cx="4" cy="2" rx="12" ry="5" fill="#3B82F6" />
                  <rect x="-10" y="5" width="26" height="5" rx="2" fill="#FFFFFF" />
                </g>
              </g>
            </g>

            {/* ====== TORSO & PE SHIRT (THÂN NGƯỜI, CỘT SỐNG & LỒNG NGỰC) ====== */}
            <g transform={`rotate(${spineLean + spinePitch}, 120, 165)`}>
              {/* Shorts Waistband */}
              <rect x="88" y="165" width="64" height="22" rx="8" fill="#1E40AF" />
              <rect x="117" y="166" width="6" height="10" rx="2" fill="#3B82F6" />

              {/* White PE Shirt Body */}
              <path
                d="M 85 105 L 155 105 L 152 170 L 88 170 Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              {/* Blue shoulder raglan patches */}
              <path d="M 85 105 L 105 105 L 95 130 L 85 125 Z" fill="#2563EB" />
              <path d="M 155 105 L 135 105 L 145 130 L 155 125 Z" fill="#2563EB" />

              {/* School PE Logo Badge */}
              <circle cx="103" cy="125" r="7" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1" />
              <text x="103" y="128" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#1E40AF">
                MH
              </text>

              {/* Center V-neck trim */}
              <path d="M 112 105 L 120 115 L 128 105" fill="none" stroke="#2563EB" strokeWidth="2.5" />

              {/* ====== ARMS WITH SHOULDER-ELBOW-WRIST KINEMATIC CHAIN ====== */}
              {/* Left Arm (Vai -> Khuỷu tay -> Cổ tay) */}
              <g transform={`translate(84, ${108 + leftShoulderY}) rotate(${leftUpperArmAngle}, 0, 0)`}>
                {/* Upper arm (Sleeve) */}
                <rect x="-7" y="0" width="14" height="34" rx="7" fill="#2563EB" />
                {/* Elbow Hinge & Forearm */}
                <g transform={`translate(0, 32) rotate(${leftForearmAngle}, 0, 0)`}>
                  <rect x="-6" y="0" width="12" height="34" rx="6" fill="#FBD38D" />
                  {/* Sport Wristband */}
                  <rect x="-7" y="27" width="14" height="5" rx="2.5" fill="#3B82F6" />
                  {/* Wrist joint & Hand / Fist */}
                  <g transform={`translate(0, 38) rotate(${leftWristAngle}, 0, 0)`}>
                    <circle cx="0" cy="0" r="8" fill="#FBD38D" />
                  </g>
                </g>
              </g>

              {/* Right Arm (Vai -> Khuỷu tay -> Cổ tay) */}
              <g transform={`translate(156, ${108 + rightShoulderY}) rotate(${rightUpperArmAngle}, 0, 0)`}>
                {/* Upper arm (Sleeve) */}
                <rect x="-7" y="0" width="14" height="34" rx="7" fill="#2563EB" />
                {/* Elbow Hinge & Forearm */}
                <g transform={`translate(0, 32) rotate(${rightForearmAngle}, 0, 0)`}>
                  <rect x="-6" y="0" width="12" height="34" rx="6" fill="#FBD38D" />
                  {/* Sport Wristband */}
                  <rect x="-7" y="27" width="14" height="5" rx="2.5" fill="#3B82F6" />
                  {/* Wrist joint & Hand / Fist */}
                  <g transform={`translate(0, 38) rotate(${rightWristAngle}, 0, 0)`}>
                    <circle cx="0" cy="0" r="8" fill="#FBD38D" />
                  </g>
                </g>
              </g>

              {/* ====== NECK & HEAD (CỔ VÀ ĐẦU) ====== */}
              <g
                transform={`translate(120, ${105 + headY}) rotate(${neckTilt + headNod}, 0, 0)`}
                className="transition-transform duration-75"
              >
                {/* Neck */}
                <rect x="-8" y="-12" width="16" height="15" rx="4" fill="#F6AD55" />

                {/* Head Base */}
                <ellipse cx="0" cy="-38" rx="24" ry="26" fill="#FBD38D" />

                {/* Ears */}
                <ellipse cx="-25" cy="-38" rx="5" ry="7" fill="#FBD38D" />
                <ellipse cx="25" cy="-38" rx="5" ry="7" fill="#FBD38D" />

                {/* Eyes with cheerful blink or happy arc */}
                {isPlaying ? (
                  <>
                    {/* Happy curved eyes during exercise */}
                    <path
                      d="M -15 -40 Q -10 -46 -5 -40"
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 5 -40 Q 10 -46 15 -40"
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <>
                    <ellipse cx="-10" cy="-38" rx="3.5" ry="4.5" fill="#1E293B" />
                    <ellipse cx="10" cy="-38" rx="3.5" ry="4.5" fill="#1E293B" />
                    <circle cx="-11" cy="-40" r="1.5" fill="#FFFFFF" />
                    <circle cx="9" cy="-40" r="1.5" fill="#FFFFFF" />
                  </>
                )}

                {/* Cheeks / Blush */}
                <ellipse cx="-16" cy="-32" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.6" />
                <ellipse cx="16" cy="-32" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.6" />

                {/* Cheerful Smile */}
                <path
                  d="M -8 -28 Q 0 -22 8 -28"
                  fill="none"
                  stroke="#B91C1C"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Eyebrows */}
                <path d="M -16 -46 Q -10 -50 -4 -46" fill="none" stroke="#713F12" strokeWidth="2" />
                <path d="M 4 -46 Q 10 -50 16 -46" fill="none" stroke="#713F12" strokeWidth="2" />

                {/* Hair based on Gender (Preserved 100%) */}
                {gender === 'boy' ? (
                  <g>
                    <path
                      d="M -26 -44 C -26 -65, 26 -65, 26 -44 C 26 -52, 22 -68, 0 -68 C -22 -68, -26 -52, -26 -44 Z"
                      fill="#1F2937"
                    />
                    <path
                      d="M -22 -48 Q -16 -58 -8 -48 Q 0 -58 8 -48 Q 16 -58 22 -48"
                      fill="#1F2937"
                    />
                  </g>
                ) : (
                  <g>
                    <path
                      d="M -26 -44 C -26 -68, 26 -68, 26 -44 C 26 -54, 20 -70, 0 -70 C -20 -70, -26 -54, -26 -44 Z"
                      fill="#451A03"
                    />
                    <path
                      d="M -20 -48 C -10 -56, 10 -56, 20 -48 C 15 -52, -15 -52, -20 -48 Z"
                      fill="#311502"
                    />
                    <circle cx="24" cy="-62" r="5" fill="#EC4899" />
                    <path
                      d="M 26 -64 C 44 -64, 48 -40, 42 -30 C 40 -38, 36 -58, 24 -60 Z"
                      fill="#451A03"
                    />
                  </g>
                )}

                {/* Sport Headband */}
                <path
                  d="M -25 -52 C -15 -58, 15 -58, 25 -52"
                  fill="none"
                  stroke={gender === 'boy' ? '#2563EB' : '#EC4899'}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Guide Banner */}
      <div className="w-full text-center px-2 py-2 rounded-2xl bg-white/95 border border-[#BFDBFE] mt-1 shadow-2xs">
        <div className="flex items-center justify-center gap-1.5 text-xs font-black text-[#172B4D]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{meta.title}</span>
        </div>
        <p className="text-[11px] text-[#475569] mt-0.5 leading-snug line-clamp-2">
          {meta.studentGuide}
        </p>

        {/* Repetition Counter Progress Bar */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-[10px] font-bold text-[#64748B]">Số nhịp vận động:</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalReps }).map((_, i) => (
              <span
                key={i}
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${
                  i < currentRep
                    ? 'bg-[#10B981] text-white shadow-2xs scale-105'
                    : 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0]'
                }`}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <span className="text-[10px] font-black text-[#2684FF]">
            ({currentRep}/{totalReps})
          </span>
        </div>
      </div>
    </div>
  );
};
