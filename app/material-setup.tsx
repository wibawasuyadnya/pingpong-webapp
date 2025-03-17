// components/MaterialSetup.tsx
"use client";

import React, { useEffect } from "react";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";

export function MaterialSetup({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const styleSheet = typescaleStyles.styleSheet;
    if (styleSheet && !document.adoptedStyleSheets.includes(styleSheet)) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
    }
  }, []);

  return <>{children}</>;
}