"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";

import IOSHome from "../src/marco_frontend/src/features/ios-interface/components/IOSHome.jsx";
import IOSStatusBar from "../src/marco_frontend/src/features/ios-interface/components/IOSStatusBar.jsx";
import IOSSplashScreen from "../src/marco_frontend/src/features/ios-interface/components/IOSSplashScreen.jsx";
import IPadFrame from "../src/marco_frontend/src/features/ios-interface/components/IPadFrame.jsx";
import GlassDock from "../src/marco_frontend/src/features/ios-interface/components/GlassDock.jsx";
import FloatingWidget from "../src/marco_frontend/src/shared/components/FloatingWidget.jsx";
import WallpaperShowcase from "./WallpaperShowcase";

const Finder = React.lazy(() => import("../src/marco_frontend/src/shared/components/Finder.jsx"));
const IOSNotes = React.lazy(() => import("../src/marco_frontend/src/features/ios-interface/components/IOSNotes.jsx"));
const IOSPhotos = React.lazy(() => import("../src/marco_frontend/src/features/ios-interface/components/IOSPhotos.jsx"));
const AudioShowcaseWidget = React.lazy(() => import("../src/marco_frontend/src/features/ios-interface/components/AudioShowcaseWidget.jsx"));

function getDesktopMode() {
  const hasFinePointer = typeof window.matchMedia === "function" ? window.matchMedia("(pointer: fine)").matches : false;
  return window.innerWidth >= 1024 && hasFinePointer;
}

export default function MarcoIosHomeShell() {
  const [currentTime, setCurrentTime] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(() =>
    typeof window === "undefined" ? true : window.location.pathname === "/",
  );

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setCurrentTime(`${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}`);
    };

    updateTime();
    const timeInterval = window.setInterval(updateTime, 60_000);

    const updateDesktop = () => setIsDesktop(getDesktopMode());
    updateDesktop();
    window.addEventListener("resize", updateDesktop);

    return () => {
      window.clearInterval(timeInterval);
      window.removeEventListener("resize", updateDesktop);
    };
  }, []);

  useEffect(() => {
    const warmImageCache = (urls: string[]) => {
      urls.forEach((url) => {
        const image = new window.Image();
        image.decoding = "async";
        image.src = url;
      });
    };

    warmImageCache([
      "/assets/icons/folder-icon.png",
      "/assets/icons/pdf-icon.png",
      "/assets/icons/image-icon.png",
      "/assets/icons/csv-icon.png",
      "/assets/memes-app/project1.png",
      "/assets/memes-app/project2.png",
      "/assets/memes-app/project4.png",
      "/assets/yosemite.jpg",
      "/assets/yosemite2.png",
      "/assets/yosemite3.jpg",
      "/assets/yosemite4.jpg",
    ]);

    void import("../src/marco_frontend/src/shared/components/Finder.jsx");
    void import("../src/marco_frontend/src/features/ios-interface/components/IOSPhotos.jsx");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("ipad-frame-mode", isDesktop);
    return () => {
      document.body.classList.remove("ipad-frame-mode");
    };
  }, [isDesktop]);

  const glassDockApps = useMemo(
    () => [
      { id: "finder", name: "Finder", icon: "/assets/finder-icon.png", color: "transparent", noGlass: true },
      { id: "memes", name: "Portfolio", icon: "/assets/portfolio-icon.png", color: "transparent", noGlass: true },
      { id: "notes", name: "CV", iconName: "file-text", iconTint: "#111827", color: "#FBBF24" },
    ],
    [],
  );

  const onAppSwitch = (appId: string) => {
    if (!appId || appId === "home") {
      setActiveWidget(null);
      return;
    }
    if (["finder", "notes", "memes"].includes(appId)) {
      setActiveWidget(appId);
      return;
    }
    if (appId === "linkedin") {
      window.open("https://www.linkedin.com/in/marco-cordova-116357321/", "_blank", "noopener,noreferrer");
      return;
    }
    if (appId === "github") {
      window.open("https://github.com/cordova7", "_blank", "noopener,noreferrer");
      return;
    }
    if (appId === "mail") {
      window.location.href = "mailto:marco7cordova@gmail.com";
      return;
    }
  };

  const closeWidget = () => setActiveWidget(null);

  useEffect(() => {
    if (window.location.pathname !== "/") {
      window.history.replaceState({}, "", `/${window.location.search}${window.location.hash}`);
    }
  }, []);

  const widgetConfig = useMemo<{
    title: string;
    Component: React.ComponentType<any>;
    props?: Record<string, unknown>;
  } | null>(() => {
    switch (activeWidget) {
      case "finder":
        return { title: "Finder", Component: Finder as unknown as React.ComponentType<any> };
      case "notes":
        return { title: "CV", Component: IOSNotes as unknown as React.ComponentType<any> };
      case "memes":
        return { title: "Portfolio", Component: IOSPhotos as unknown as React.ComponentType<any> };
      case "audio":
        return { title: "Audio", Component: AudioShowcaseWidget as unknown as React.ComponentType<any> };
      default:
        return null;
    }
  }, [activeWidget]);

  const appContent = (
    <div
      className="app"
      style={{
        position: "relative",
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      <WallpaperShowcase
        images={["/assets/yosemite.jpg", "/assets/yosemite2.png", "/assets/yosemite3.jpg", "/assets/yosemite4.jpg"]}
        introIntervalMs={0}
        ambientIntervalMs={0}
        introOncePerSession={false}
      />
      <IOSStatusBar time={currentTime} title={null} />
      <div className="app-content home-active">
        <IOSHome onAppSwitch={onAppSwitch} />
      </div>

       {widgetConfig && (
         <FloatingWidget
           title={widgetConfig.title}
           onClose={closeWidget}
           className={activeWidget ? `floating-widget-${activeWidget}` : ""}
         >
           <Suspense fallback={<div className="app-route-loading" aria-busy="true" aria-label="Loading" />}>
            <widgetConfig.Component {...(widgetConfig.props || {})} />
           </Suspense>
         </FloatingWidget>
       )}
      <div className="ios-home-indicator" />
    </div>
  );

  return (
    <>
      {isDesktop ? (
        <IPadFrame>
          {appContent}
          <GlassDock apps={glassDockApps} onAppLaunch={onAppSwitch} />
        </IPadFrame>
      ) : (
        <>
          {appContent}
          <GlassDock apps={glassDockApps} onAppLaunch={onAppSwitch} />
        </>
      )}
      {showSplash && <IOSSplashScreen onLoadComplete={() => setShowSplash(false)} />}
    </>
  );
}
