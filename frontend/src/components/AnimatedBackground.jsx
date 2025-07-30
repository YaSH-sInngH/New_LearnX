import React from "react";
import aImg from "../assets/a.png";
import bImg from "../assets/b.png";
import cImg from "../assets/c.png";
import dImg from "../assets/d.png";
// import eImg from "../assets/e.png"; // Removed as requested
import fImg from "../assets/f.png";
import gImg from "../assets/g.png";
import hImg from "../assets/h.png";
import iImg from "../assets/i.png";
import jImg from "../assets/j.png";

// Removed eImg from the array
const images = [aImg, bImg, cImg, dImg, fImg, gImg];
// Bring images closer to the center/login box
const positions = [
  // Top left, closer to center
  "top-32 left-56",
  // Top right, closer to center
  "top-32 right-56",
  // Mid left, closer to center
  "top-1/2 left-32",
  // Mid right, closer to center
  "top-1/2 right-32",
  // Lower left, closer to center
  "bottom-32 left-56",
  // Lower right, closer to center
  "bottom-32 right-56",
];
const anims = [
  "animate-float-large scale-110",
  "animate-float-medium scale-105",
  "animate-float-small scale-115",
  "animate-float-large scale-110",
  "animate-float-medium scale-105",
  "animate-float-small scale-115",
];
const sizes = ["w-56", "w-64", "w-52", "w-56", "w-60", "w-52"];

// New background images for behind the form
const behindImages = [hImg, iImg, jImg];
const behindStyles = [
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 opacity-30 blur-lg z-0",
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 opacity-20 blur-md z-0",
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 opacity-25 blur-md z-0",
];

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Custom linear gradient background */}
      <div style={{backgroundImage: 'linear-gradient(to right bottom, #f5c513, #aed94e, #67e290, #1ce2cb, #45dcf0)'}} className="absolute inset-0 w-full h-full" />
      {/* Soft linear gradient overlay for polish */}
      <div className="absolute inset-0 w-full h-full bg-white/40 pointer-events-none" />
      {/* Behind-form images */}
      {behindImages.map((img, idx) => (
        <img
          key={"behind-" + idx}
          src={img}
          alt="bg-behind-shape"
          className={behindStyles[idx % behindStyles.length]}
          draggable={false}
        />
      ))}
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt="bg-shape"
          className={`absolute rounded-2xl ${positions[idx % positions.length]} ${sizes[idx % sizes.length]} ${anims[idx % anims.length]} opacity-70 shadow-lg`}
          draggable={false}
        />
      ))}
      {/* Custom keyframes for unique animation */}
      <style>{`
        @keyframes float-large { 0%{transform:translateY(0)} 50%{transform:translateY(-32px)} 100%{transform:translateY(0)} }
        .animate-float-large { animation: float-large 8s ease-in-out infinite; }
        @keyframes float-medium { 0%{transform:translateY(0)} 50%{transform:translateY(-20px)} 100%{transform:translateY(0)} }
        .animate-float-medium { animation: float-medium 7s ease-in-out infinite; }
        @keyframes float-small { 0%{transform:translateY(0)} 50%{transform:translateY(-12px)} 100%{transform:translateY(0)} }
        .animate-float-small { animation: float-small 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AnimatedBackground; 