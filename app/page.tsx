import dynamic from "next/dynamic";

const PeppleIosHomeShell = dynamic(() => import("../components/PeppleIosHomeShell"), {
  ssr: false,
});

export default function HomePage() {
  return <PeppleIosHomeShell />;
}
