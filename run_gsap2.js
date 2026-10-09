const fs = require('fs');
let content = fs.readFileSync('features/dashboard/engine/WidgetCanvas.tsx', 'utf8');

content = content.replace(
  'import clsx from "clsx";',
  'import clsx from "clsx";\nimport gsap from "gsap";'
);

content = content.replace(
  'const [isRemoving, setIsRemoving] = useState<string | null>(null);',
  `const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mounted || !widgets.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-canvas-title",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
      gsap.fromTo(
        ".gsap-canvas-widget",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out", delay: 0.2 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [mounted, widgets.length > 0]);`
);

content = content.replace(
  '<div className="w-full space-y-8 relative z-10 pb-20 p-4 sm:p-8">',
  '<div ref={containerRef} className="w-full space-y-8 relative z-10 pb-20 p-4 sm:p-8">'
);

content = content.replace(
  '<div\n              key={widget.id}\n              data-grid={{\n',
  '<div\n              key={widget.id}\n              className="gsap-canvas-widget"\n              data-grid={{\n'
);

fs.writeFileSync('features/dashboard/engine/WidgetCanvas.tsx', content);
