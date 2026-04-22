import { Hero } from "@/components/hero";
import { LabPanel } from "@/components/lab-panel";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,96,0.22),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(15,118,110,0.18),_transparent_25%),linear-gradient(180deg,_#fffaf2_0%,_#fefdf9_100%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-12 px-6 py-10 sm:px-10 lg:px-12">
        <Hero />
        <LabPanel />
      </div>
    </main>
  );
}
