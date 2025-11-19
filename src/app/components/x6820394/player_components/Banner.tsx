export default function Banner({ title, author }: { title?: string; author?: string }) {
  return (
    <div className="mt-6 flex justify-center w-[500px] p-5">
      <div className="w-full overflow-hidden h-[40px] rounded-[100%] flex items-center px-6 relative backdrop-blur-sm bg-transparent">
        <div className="whitespace-nowrap animate-marquee text-white text-sm select-none z-0 w-full">
          {`${title || "Sin título"} — ${author || "Autor desconocido"}`}
        </div>
      </div>
    </div>
  );
}
