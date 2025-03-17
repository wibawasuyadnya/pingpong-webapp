// global.d.ts
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "material-dialog": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}
export { };
