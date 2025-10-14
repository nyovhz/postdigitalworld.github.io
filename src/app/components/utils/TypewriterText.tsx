"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

type Props = {
  text: string;
  speed?: number;
  className?: string;
};

export default function TypewriterText({ text, speed = 60, className }: Props) {
  const { ref, inView } = useInView({ threshold: 0.5 });
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (inView) {
      setDisplayedText("");
      setIndex(0);
    }
  }, [inView]);

  useEffect(() => {
    if (!inView || index >= text.length) return;

    const timeout = setTimeout(() => {
      setDisplayedText(text.slice(0, index + 1));
      setIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [inView, index, text, speed]);

  return (
    <h1 ref={ref} className={className}>
      {displayedText}
    </h1>
  );
}
