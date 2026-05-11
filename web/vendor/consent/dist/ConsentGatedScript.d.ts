export interface ConsentGatedScriptProps {
    /** Consent category that must be accepted before the script loads. */
    category: keyof import('./types.js').ConsentCategories;
    /** Script src URL. */
    src: string;
    /** Next.js Script loading strategy. Default: "afterInteractive". */
    strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive';
    /** Any additional data-* attributes passed to the <script> element. */
    [key: string]: unknown;
}
export declare function ConsentGatedScript({ category, src, strategy, ...rest }: ConsentGatedScriptProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=ConsentGatedScript.d.ts.map