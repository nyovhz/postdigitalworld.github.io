export default function Banner({ title, author }: { title?: string; author?: string }) {
  return (
    <div className="mt-6 flex justify-center w-[300px]  p-5">
      <div className="w-full border border-[rgba(0,100,0,0.8)] bg-black overflow-hidden shadow-[0px_1px_10px_green] h-[40px] rounded-[100%] flex items-center px-6 relative">
        <div className="whitespace-nowrap animate-marquee text-white text-sm select-none z-0 w-full">
          {`${title || "Sin título"} — ${author || "Autor desconocido"}`}
        </div>
      </div>
    </div>
  );
}
