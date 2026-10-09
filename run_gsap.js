const fs = require('fs');
const content = fs.readFileSync('features/dashboard/engine/WidgetCanvas.tsx', 'utf8');

let newContent = content.replace(
  'import { useQuery } from "@tanstack/react-query";',
  'import { useQuery } from "@tanstack/react-query";\nimport gsap from "gsap";'
);

newContent = newContent.replace(
  'const [isRemoving, setIsRemoving] = useState<string | null>(null);',
  `const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [mounted, widgets.length > 0]);`
);

newContent = newContent.replace(
  '<div className="w-full space-y-8 relative z-10 pb-20 p-4 sm:p-8">',
  '<div ref={containerRef} className="w-full space-y-8 relative z-10 pb-20 p-4 sm:p-8">'
);

newContent = newContent.replace(
  '<h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground leading-[1.1] tracking-tight mb-8">',
  '<h1 className="gsap-canvas-title text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground leading-[1.1] tracking-tight mb-8">'
);

newContent = newContent.replace(
  '<div\n              key={widget.id}\n              data-grid={{\n',
  '<div\n              key={widget.id}\n              className="gsap-canvas-widget"\n              data-grid={{\n'
);

fs.writeFileSync('features/dashboard/engine/WidgetCanvas.tsx', newContent);
