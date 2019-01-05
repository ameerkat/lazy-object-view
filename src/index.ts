import './styles/index.scss'

export interface RenderOptions {
    /**
     * Whether or not to encapsulate the entire object inside a single root element.
     */
    useRootElement?: boolean;

    /**
     * The name of the root element to use if useRootElement is true. Defaults to "root".
     */
    rootName?: string;

    /**
     * Attempt to show a loading indicator before expanding nodes
     * Note that this introduces a small artificial delay of 10ms when expanding
     */
    showLoadingIndicator?: boolean;

    /**
     * If set will collapse values over that number and show an ellipses (...) at the 
     * end with the remaining count to expand.
     */
    collapseStringsOver?: number;
}

export class LazyObjectView {
    private readonly elementTypeToUse: string = "div";
    private readonly keyValueClassName: string = "key-value";
    private readonly keyClassName: string = "key";
    private readonly valueClassName: string = "value";
    private readonly subtreeClassName: string = "subtree";
    private readonly defaultRootNodeName: string = "root";
    private window: Window;

    constructor(windowObject?: Window) {
        this.window = windowObject || window;
    }

    private constructTextElement(textValue: string, options?: RenderOptions): HTMLElement | Text {
        if (options
            && typeof options.collapseStringsOver !== "undefined"
            && options.collapseStringsOver !== null
            && options.collapseStringsOver >= 0
            && textValue.length > options.collapseStringsOver) {
            const parentElement = this.window.document.createElement("span");
            const displayedPartString = textValue.substring(0, options.collapseStringsOver);
            const textElement = this.window.document.createTextNode(displayedPartString);
            parentElement.appendChild(textElement);

            const ellipsesElement = this.window.document.createElement("span");
            ellipsesElement.className = "ellipses";
            const ellipsesText = this.window.document.createTextNode("... [+" + (textValue.length - options.collapseStringsOver) + "]");
            ellipsesElement.appendChild(ellipsesText);
            parentElement.appendChild(ellipsesElement);
            ellipsesElement.onclick = (event: MouseEvent) => {
                parentElement.innerHTML = "";
                const fullTextElement = this.window.document.createTextNode(textValue);
                parentElement.appendChild(fullTextElement);
            };

            return parentElement;
        }

        return this.window.document.createTextNode(textValue);
    }

    private constructRenderedKeyValue(
        dataAttributeName: string, 
        dataAttributeValue: any, 
        options?: RenderOptions): HTMLElement {
        const keyValueParent = this.window.document.createElement(this.elementTypeToUse);
        keyValueParent.className = this.keyValueClassName;
        const keyElement = this.window.document.createElement(this.elementTypeToUse);
        keyElement.className = this.keyClassName;
        const keyTextElement = this.window.document.createTextNode(dataAttributeName);
        keyElement.appendChild(keyTextElement);
        keyValueParent.appendChild(keyElement);
       
        const dataAttributeType = typeof dataAttributeValue;
        let valueElement = this.window.document.createElement(this.elementTypeToUse);
        valueElement.className = this.valueClassName + " " + dataAttributeType;
        if (dataAttributeType === "undefined") {
            const valueTextElement = this.constructTextElement("undefined", options);
            valueElement.appendChild(valueTextElement);
            keyValueParent.appendChild(valueElement);
        } else if (dataAttributeValue === null) {
            const valueTextElement = this.constructTextElement("null", options);
            valueElement.appendChild(valueTextElement);
            valueElement.className += " null";
            keyValueParent.appendChild(valueElement);
        } else if (Array.isArray(dataAttributeValue) && dataAttributeValue.length === 0) {
            const valueTextElement = this.constructTextElement("[]", options);
            valueElement.appendChild(valueTextElement);
            valueElement.className += " empty";
            keyValueParent.appendChild(valueElement);
        } else if (dataAttributeType === "object") {
            const subtreeElement = this.window.document.createElement(this.elementTypeToUse);
            subtreeElement.className = this.subtreeClassName;
            keyValueParent.appendChild(subtreeElement);

            keyElement.className += " collapsed";
            let thisToggleState = false;
            keyElement.onclick = (event: MouseEvent) => {
                if (thisToggleState === false) {
                    if (options && options.showLoadingIndicator) {
                        const loaderElement = this.window.document.createElement("div");
                        loaderElement.className = "spinner";
                        subtreeElement.appendChild(loaderElement);
                        this.window.setTimeout(() => {
                            // We don't reuse the same action here as below since we want to remove the spinner
                            // before actually setting the expanded class on the key element.
                            this.render(subtreeElement, dataAttributeValue, options);
                            thisToggleState = true;
                            subtreeElement.removeChild(loaderElement);
                            keyElement.className = keyElement.className.replace(/\bcollapsed\b/, "expanded");
                        }, 10);
                    } else {
                        this.render(subtreeElement, dataAttributeValue, options);
                        thisToggleState = true;
                        keyElement.className = keyElement.className.replace(/\bcollapsed\b/, "expanded");
                    }
                } else {
                    this.collapse(subtreeElement);
                    thisToggleState = false;
                    keyElement.className = keyElement.className.replace(/\bexpanded\b/, "collapsed");
                }
            };
        } else if (dataAttributeType === "string") {
            const valueTextElement = this.constructTextElement("\"" + dataAttributeValue + "\"", options);
            valueElement.appendChild(valueTextElement);
            keyValueParent.appendChild(valueElement);
        } else {
            const valueTextElement = this.constructTextElement(dataAttributeValue.toString(), options);
            valueElement.appendChild(valueTextElement);
            keyValueParent.appendChild(valueElement);
        }

        return keyValueParent;
    }

    /**
     * Renders a json viewer on the target element for the given data
     * @param target The target element to render the JSON document under
     * @param data The data to render as a tree view
     * @param options Options for rendering the viewer
     */
    render(target: HTMLElement, data: any, options?: RenderOptions) {
        if (target === null || typeof target === "undefined") {
            throw new Error("target HTMLElement must not be null or undefined.");
        } else if (data === null || typeof data === "undefined") {
            return null;
        }
        
        if (options && options.useRootElement) {
            const rootName = options.rootName || this.defaultRootNodeName;
            const dataRef = data;
            data = {};
            data[rootName] = dataRef;
            options.useRootElement = false;
        }

        const accumulator = this.window.document.createDocumentFragment();
        for (const dataAttributeName in data) {
            if (!data.hasOwnProperty(dataAttributeName)) {
                continue;
            }

            const keyValueParent = this.constructRenderedKeyValue(
                dataAttributeName, 
                data[dataAttributeName],
                options);
            accumulator.appendChild(keyValueParent);
        }

        target.appendChild(accumulator);
    }

    collapse(target: HTMLElement) {
        target.innerHTML = "";
    }
}

export default LazyObjectView;
