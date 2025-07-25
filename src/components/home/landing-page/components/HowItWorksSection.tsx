import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const steps = [
  {
    img: '/assets/pice1.png',
    alt: 'Human Content badge',
    headline: 'Spot What’s Real',
    text: 'Bear Witness highlights human-written posts with a clear badge and confidence score so you know what’s authentic.',
  },
  {
    img: '/assets/pic2.png',
    alt: 'AI Detected badge',
    headline: 'See the AI Percentage',
    text: 'Every post gets a badge showing exactly how much AI-generated content it contains. No more guessing.',
  },
  {
    img: '/assets/pic3.png',
    alt: 'Bear Witness extension popup',
    headline: 'Take Control of Your Feed',
    text: 'Toggle AI scanning and choose to blur posts with high AI content. You decide what you want to see.',
  },
  {
    img: '/assets/pic4.png',
    alt: 'Bear Witness blurring high AI content',
    headline: 'Blur Out the Bots',
    text: 'Automatically blur posts that are mostly AI, so you can focus on real conversations.',
  },
];

export default function HowItWorksSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleScroll = () => {
    if (typeof window === 'undefined') return;

    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Find which step is closest to the center of the viewport
    let closestStep = 0;
    let minDistance = Infinity;

    stepRefs.current.forEach((ref, idx) => {
      if (!ref) return;

      const rect = ref.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distance = Math.abs(elementCenter - viewportCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestStep = idx;
      }
    });

    setActiveIdx(closestStep);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="w-full  min-h-[50vh] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row gap-12">
        {/* Left: Scrolling Text Content */}
        <div className="flex-1 flex flex-col justify-start pt-30">
          {steps.map((step, idx) => (
            <div
              key={idx}
              ref={(el) => {
                stepRefs.current[idx] = el;
              }}
              className="min-h-[60vh] flex flex-col justify-start"
            >
              <AnimatePresence mode="wait">
                <div key={`step-${idx}`}>
                  <h3 className="text-3xl md:text-5xl font-extrabold text-black mb-6 text-left leading-tight">
                    {step.headline}
                  </h3>
                  <p className="text-xl md:text-2xl text-gray-700 text-left">{step.text}</p>
                </div>
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Right: Fixed Sticky Image */}
        <div className="flex-1 flex justify-center md:justify-end relative pt-40">
          <div className="sticky top-32 w-full max-w-xl h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5 }}
                className="absolute w-full h-full flex items-center justify-center"
              >
                <Image
                  src={steps[activeIdx].img}
                  alt={steps[activeIdx].alt}
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl border border-gray-200 bg-white"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CTA at the bottom */}
      {/* <div className="text-center py-32">
        <a
          href="https://chrome.google.com/webstore"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-black text-white px-10 py-5 rounded-xl text-2xl font-bold shadow-lg hover:bg-gray-800 transition"
        >
          Install Bear Witness on Chrome
        </a>
      </div> */}
    </section>
  );
}
