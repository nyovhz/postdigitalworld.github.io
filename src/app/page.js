"use client";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8 sm:p-20 text-green-500">
      {/* Spinner */}
      <div className="flex flex-col items-center justify-center space-y-6 mb-10">
        <div className="w-16 h-16 border-4 border-t-green-500 border-b-green-500 border-gray-700 rounded-full animate-spin"></div>
        <p className="text-xl sm:text-2xl font-semibold">In Development</p>
      </div>

      {/* Contenido del modal */}
      <div className="bg-black p-10 max-w-3xl w-full text-center border border-green-500 rounded-lg">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Welcome to Postdigital World
        </h2>
        <p className="text-lg sm:text-xl">
          Postdigital World is an experimental environment where digital and
          physical morphologies intersect. Here, spaces evolve, interactions
          transform, and the perception of reality expands. Explore, interact,
          and immerse yourself in a new paradigm of digital experience.
        </p>
      </div>
    </div>
  );
}
