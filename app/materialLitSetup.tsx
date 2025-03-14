"use client";

import React, { Fragment, useEffect } from "react";
import "./components/my-lit-button.ts";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";

export function MaterialLitSetup({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        document.adoptedStyleSheets = [
            ...document.adoptedStyleSheets,
            typescaleStyles.styleSheet,
        ];
    }, []);

    return <Fragment>{children}</Fragment>;
}
