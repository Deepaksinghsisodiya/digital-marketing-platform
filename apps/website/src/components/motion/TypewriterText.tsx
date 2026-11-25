"use client";

import React, { useState, useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface TypewriterTextProps {
  texts: string[];
  className?: string;
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  texts,
  className = "",
  speed = 80,
  deleteSpeed = 40,
  pauseTime = 2000,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const isReduced = useReducedMotion();

  useEffect(() => {
    if (isReduced || texts.length === 0) {
      setDisplayText(texts[0] || "");
      return;
    }

    const currentText = texts[textIndex] || "";

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % texts.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, deleteSpeed, pauseTime, isReduced]);

  if (isReduced) {
    return <span className={className}>{texts[0]}</span>;
  }

  return (
    <span className={className}>
      {displayText}
      <span className="animate-blink text-primary">|</span>
    </span>
  );
};
