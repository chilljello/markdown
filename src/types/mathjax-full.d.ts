declare module 'mathjax-full' {
    interface MathJaxConfig {
        tex?: {
            inlineMath?: string[][];
            displayMath?: string[][];
            processEscapes?: boolean;
            processEnvironments?: boolean;
            packages?: string[];
        };
        svg?: {
            fontCache?: string;
            scale?: number;
            minScale?: number;
            mtextInheritFont?: boolean;
        };
        options?: {
            enableMenu?: boolean;
            menuOptions?: {
                settings?: {
                    texHints?: boolean;
                    semantics?: boolean;
                    zoom?: string;
                    zoomFactor?: string;
                };
            };
        };
    }

    interface MathJaxStartup {
        defaultReady(): void;
        defaultPageReady(): Promise<void>;
        promise?: Promise<void>;
    }

    interface MathJax {
        config: MathJaxConfig;
        startup: MathJaxStartup;
        typesetPromise(elements: NodeListOf<Element> | Element[]): Promise<void>;
    }

    const MathJax: MathJax;
    export = MathJax;
}
