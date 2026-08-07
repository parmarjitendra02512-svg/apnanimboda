"use client";

import { useEffect } from "react";

export default function SecurityWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 🛡️ High-Profile Self-XSS Console Warning (Facebook / Instagram / Discord Security Standard)
    try {
      console.clear();
      console.log(
        "%cरुको! / STOP!",
        "color: #ef4444; font-family: system-ui, -apple-system, sans-serif; font-size: 3.8rem; font-weight: 900; text-shadow: 2px 2px 0px #000000; padding: 10px 0;",
      );
      console.log(
        "%cयह ब्राउज़र डेवलपर टूल है। यदि किसी ने आपसे यहां कोई कोड कॉपी-पेस्ट करने को कहा है, तो यह एक धोखाधड़ी (Scam/Self-XSS) हो सकती है और वे आपके खाते तक अनधिकृत पहुंच प्राप्त कर सकते हैं।\n\nThis is a browser feature intended for developers. If someone told you to copy-paste something here, it is a scam (Self-XSS) and could compromise your account.\n\n🛡️ APNA NIMBODA (343029) Cyber Security Shield Active.\nInstagram Official: @nimboda_view | Web: https://nimboda.in",
        "font-family: system-ui, -apple-system, sans-serif; font-size: 1.05rem; font-weight: 600; color: #f59e0b; line-height: 1.6;",
      );
    } catch (e) {}

    // Block Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Block Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
      }

      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
      }

      // Cmd+Option+I (Mac Inspect)
      if (e.metaKey && e.altKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
      }

      // Cmd+Option+J (Mac Console)
      if (e.metaKey && e.altKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
      }

      // Cmd+Option+U (Mac View Source)
      if (e.metaKey && e.altKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
      }
    };

    // Attach listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <>{children}</>;
}
