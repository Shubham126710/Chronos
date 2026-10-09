const fs = require('fs');
const content = fs.readFileSync('features/onboarding/ContextualTour.tsx', 'utf8');

const newContent = content.replace(
  /if \(!targetRect\).*?tooltipStyle = { top: clampedTop, left: clampedLeft };/s,
  `const step = TOUR_STEPS[currentStep];
  const padding = 8;
  
  // Calculate highlight box
  const highlightStyle = targetRect ? {
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
    boxShadow: '0 0 0 9999px rgba(11, 9, 16, 0.85)',
  } : {
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    boxShadow: '0 0 0 9999px rgba(11, 9, 16, 0.85)',
    opacity: 0,
  };

  // Calculate tooltip placement
  let tooltipStyle: React.CSSProperties = {};
  const tooltipWidth = 320;
  const tooltipHeight = 160; // Approximate max height
  const margin = 16;
  
  if (targetRect) {
    let rawTop = 0;
    let rawLeft = 0;
    
    if (step.placement === "right") {
      rawTop = targetRect.top;
      rawLeft = targetRect.right + padding + margin;
    } else if (step.placement === "bottom") {
      rawTop = targetRect.bottom + padding + margin;
      rawLeft = targetRect.left;
    } else if (step.placement === "left") {
      rawTop = targetRect.top;
      rawLeft = targetRect.left - padding - margin - tooltipWidth;
    } else {
      // top
      rawTop = targetRect.top - padding - margin - tooltipHeight;
      rawLeft = targetRect.left;
    }

    const clampedTop = Math.max(margin, Math.min(rawTop, window.innerHeight - tooltipHeight - margin));
    const clampedLeft = Math.max(margin, Math.min(rawLeft, window.innerWidth - tooltipWidth - margin));

    tooltipStyle = { top: clampedTop, left: clampedLeft };
  } else {
    tooltipStyle = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }`
);

fs.writeFileSync('features/onboarding/ContextualTour.tsx', newContent);
