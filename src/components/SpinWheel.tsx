import React, { useCallback, useMemo, useRef, useState } from "react";

export function SpinWheel({
    items,
    onFinish,
    onSpin,
    isSpinning: isSpinningProp,
}: {
    items: Array<{
        id?: string | number;
        text: string;
        color?: string;
        probability?: number;
    }>;
    onFinish?: (index: number) => void;
    onSpin?: (item: { id?: string | number; text: string; color?: string; probability?: number }) => void;
    isSpinning?: boolean;
}) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0); // degrees
    const [selected, setSelected] = useState<number | null>(null);
    const wheelRef = useRef<HTMLDivElement | null>(null);
    const isSpinningRef = useRef(false);
    const currentRotationRef = useRef(0);

    const segmentAngle = useMemo(() => 360 / items.length, [items.length]);

    const computeFinalRotation = useCallback(
        (index: number, spins = 6) => {
            const centerOfSegment = index * segmentAngle + segmentAngle / 2;
            const targetDeg = (360 - centerOfSegment) % 360;
            const currentMod = currentRotationRef.current % 360;
            const relative = (targetDeg - currentMod + 360) % 360;
            const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.2);
            const final = currentRotationRef.current + spins * 360 + relative + randomOffset;
            return final;
        },
        [segmentAngle]
    );

    const spinTo = useCallback(
        (index: number) => {
            if (isSpinningRef.current) return;
            isSpinningRef.current = true;
            setIsSpinning(true);
            setSelected(index);
            const final = computeFinalRotation(index, 6);

            const el = wheelRef.current;
            if (el) {
                // reset any existing transition, force reflow, then apply new transition
                el.style.transition = "none";
                // force reflow
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                el.getBoundingClientRect();
                el.style.willChange = "transform";
                // apply transition in next frame to ensure it's picked up
                requestAnimationFrame(() => {
                    el.style.transition = "transform 4s cubic-bezier(.22,.98,.2,.99)";
                    el.style.transform = `rotate(${final}deg) translateZ(0)`;
                });

                const handler = () => {
                    if (el) {
                        el.style.transition = "";
                        el.style.willChange = "";
                    }
                    isSpinningRef.current = false;
                    setIsSpinning(false);
                    currentRotationRef.current = final;
                    setRotation(final);
                    onFinish?.(index);
                    // call onSpin with the actual item object for consumers
                    onSpin?.(items[index]);
                };
                el.addEventListener("transitionend", handler, { once: true });
            } else {
                // fallback
                isSpinningRef.current = false;
                setIsSpinning(false);
            }
        },
        [computeFinalRotation, onFinish, onSpin, items]
    );

    return (
        <div className="spin-wheel-container">
            <div className="arrow">▼</div>
            <div
                className="wheel"
                ref={wheelRef}
                style={{
                    transform: `rotate(${rotation}deg) translateZ(0)`,
                    willChange: isSpinning ? "transform" : "auto",
                }}
            >
                <svg viewBox="0 0 360 360" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(0,0)">
                        {items.map((item, i) => {
                            const startAngle = i * segmentAngle;
                            const endAngle = startAngle + segmentAngle;
                            const cx = 180;
                            const cy = 180;
                            const r = 170;

                            const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
                                const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
                                return {
                                    x: centerX + radius * Math.cos(angleInRadians),
                                    y: centerY + radius * Math.sin(angleInRadians),
                                };
                            };

                            const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
                                const start = polarToCartesian(x, y, radius, endAngle);
                                const end = polarToCartesian(x, y, radius, startAngle);
                                const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
                                return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
                            };

                            const pathD = describeArc(cx, cy, r, startAngle, endAngle);
                            const midAngle = startAngle + segmentAngle / 2;
                            const labelPos = polarToCartesian(cx, cy, r * 0.62, midAngle);
                            const isActive = selected === i;
                            const key = item.id ?? i;

                            return (
                                <g key={key}>
                                    <path d={pathD} fill={item.color ?? '#888'} stroke="rgba(0,0,0,0.12)" strokeWidth={1} className={isActive ? 'active' : ''} />
                                    <text x={labelPos.x} y={labelPos.y} fontSize={12} fontWeight={700} fill="#fff" textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: 'none' }}>
                                        {item.text}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>

            <div className="controls">
                <button onClick={() => spinTo(Math.floor(Math.random() * items.length))} disabled={isSpinningProp ?? isSpinning}>
                    Spin
                </button>
            </div>
        </div>
    );
}

export default SpinWheel;