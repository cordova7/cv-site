import dynamic from "next/dynamic";

const MarcoIosHomeShell = dynamic(() => import("../components/MarcoIosHomeShell"), {
  ssr: false,
});

export default function HomePage() {
  return <MarcoIosHomeShell />;
}
