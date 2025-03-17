"use client";

import React, {
  forwardRef,
  useEffect,
  useRef,
  MutableRefObject
} from "react";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@material/web/dialog/dialog.js";
import "@material/web/button/filled-button.js";
import "@material/web/button/text-button.js";

@customElement("material-dialog")
export class MaterialDialogElement extends LitElement {
  /** Headline text. Default matches the screenshot. */
  @property({ type: String })
  headline = "Oh no you're leaving, you sure you want to Log out?";

  /** Font size for the headline. */
  @property({ type: String })
  headingfontsize = "1.25rem";

  /** Text alignment for the headline. */
  @property({ type: String })
  headingalign = "center";

  // A reference to the <md-dialog> in the shadow root
  private get dialogEl() {
    return this.shadowRoot?.querySelector("md-dialog");
  }

  // Public methods for external usage in React
  public show() {
    this.dialogEl?.show();
  }

  public close() {
    this.dialogEl?.close();
  }

  static styles = css`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');

    :host {
      --md-filled-button-container-color: linear-gradient(180deg, #D241AA 0%, #C42BDD 100%);
      --md-filled-button-container-shape: 0px;
      --md-dialog-container-shape: 10px;
      --md-dialog-container-color: white;
      --md-text-button-label-text-color: black;

    }

    /* Style the <md-dialog> container */
    md-dialog::part(surface) {
      border-radius: 12px;
      background-color: #fff; /* White container */
      padding: 2rem;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); /* Optional subtle shadow */
    }

    .modal{
      width: 350px;
    }

    #headline {
      margin: 0;
      font-family: 'Nunito', sans-serif;
      display: block;
      font-size: var(--heading-font-size, 1.25rem);
      text-align: var(--heading-align, center);
      font-weight: 700;
      color: #333; /* Slightly darker text */
    }

    .modal-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    /* The big pink/purple gradient button for "Log out" */
    md-filled-button.logout-btn {
      background: linear-gradient(180deg, #D241AA 0%, #C42BDD 100%);
      color: #ffffff;
      font-family: 'Nunito', sans-serif;
      font-size: 1rem;
      border-radius: 10px;
      padding: 0.75rem 2rem;
      border: none;
      outline: none;
      cursor: pointer;
      padding: 15px;
      width: 250px;
    }

    md-filled-button.logout-btn[disabled] {
      background: #EBEBEB;
      color: #fff;  
      opacity: 0.7;           
      cursor: not-allowed;    
    }

    md-text-button.no-btn {
      color: #000;
      font-family: 'Nunito', sans-serif;
      font-size: 1rem;
      border-radius: 10px;
      padding: 0.75rem 2rem;
      border: none;
      outline: none;
      cursor: pointer;
      padding: 15px;
      width: 250px;
    }
  `;

  render() {
    // We can pass style vars for dynamic font size, align
    const styleVars = {
      "--heading-font-size": this.headingfontsize,
      "--heading-align": this.headingalign,
    };

    return html`
      <div style="${this.mapStyle(styleVars)}">
        <md-dialog aria-label=${this.headline} class="modal">
          <div slot="headline" id="headline">${this.headline}</div>
          <div slot="content" class="modal-content">
            <md-filled-button class="logout-btn" id="logoutBtn">
              Log out
            </md-filled-button>
            <md-text-button class="no-btn" id="noBtn">
              No
            </md-text-button>
          </div>
        </md-dialog>
      </div>
    `;
  }

  private mapStyle(vars: Record<string, string>) {
    return Object.entries(vars)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
  }
}

export interface MaterialDialogProps {
  headline?: string;
  headingfontsize?: string;
  headingalign?: string;
}

const MaterialDialog = forwardRef<MaterialDialogElement, MaterialDialogProps>(
  ({ headline, headingfontsize, headingalign }, ref) => {
    const localRef = useRef<MaterialDialogElement>(null);

    // Sync props -> attributes
    useEffect(() => {
      if (!localRef.current) return;

      if (headline !== undefined) {
        localRef.current.setAttribute("headline", headline);
      } else {
        localRef.current.removeAttribute("headline");
      }
      if (headingfontsize !== undefined) {
        localRef.current.setAttribute("headingfontsize", headingfontsize);
      } else {
        localRef.current.removeAttribute("headingfontsize");
      }
      if (headingalign !== undefined) {
        localRef.current.setAttribute("headingalign", headingalign);
      } else {
        localRef.current.removeAttribute("headingalign");
      }
    }, [headline, headingfontsize, headingalign]);

    // Merge the forwarded ref
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(localRef.current);
      } else {
        (ref as MutableRefObject<MaterialDialogElement | null>).current = localRef.current;
      }
    }, [ref]);

    // Return the custom element
    return React.createElement("material-dialog", { ref: localRef });
  }
);

MaterialDialog.displayName = "MaterialDialog";
export { MaterialDialog };
