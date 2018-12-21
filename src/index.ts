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
}

export class LazyObjectView {
    private readonly elementTypeToUse: string = "div";
    private readonly keyValueClassName: string = "key-value";
    private readonly keyClassName: string = "key";
    private readonly valueClassName: string = "value";
    private readonly subtreeClassName: string = "subtree";
    private readonly defaultRootNodeName: string = "root";
    private document: Document;

    constructor(document?: Document) {
        this.document = document || window.document;
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

        for (const dataAttributeName in data) {
            if (!data.hasOwnProperty(dataAttributeName)) {
                continue;
            }

            const keyValueParent = this.document.createElement(this.elementTypeToUse);
            keyValueParent.className = this.keyValueClassName;
            const keyElement = this.document.createElement(this.elementTypeToUse);
            keyElement.className = this.keyClassName;
            const keyTextElement = this.document.createTextNode(dataAttributeName);
            keyElement.appendChild(keyTextElement);
            keyValueParent.appendChild(keyElement);
           
            const dataAttributeValue = data[dataAttributeName];
            const dataAttributeType = typeof dataAttributeValue;
            let valueElement = this.document.createElement(this.elementTypeToUse);
            valueElement.className = this.valueClassName + " " + dataAttributeType;
            if (dataAttributeType === "object") {
                const subtreeElement = this.document.createElement(this.elementTypeToUse);
                subtreeElement.className = this.subtreeClassName;
                keyValueParent.appendChild(subtreeElement);

                keyElement.className += " collapsed";
                let thisToggleState = false;
                keyElement.onclick = (event: MouseEvent) => {
                    if (thisToggleState === false) {
                        if (options && options.showLoadingIndicator) {
                            const loaderElement = this.document.createElement("div");
                            loaderElement.className = "spinner";
                            target.appendChild(loaderElement);
                            window.setTimeout(() => {
                                this.render(subtreeElement, dataAttributeValue, options);
                                thisToggleState = true;
                                target.removeChild(loaderElement);
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
            } else if (dataAttributeType === "undefined") {
                const valueTextElement = this.document.createTextNode("undefined");
                valueElement.appendChild(valueTextElement);
                valueElement.className += " undefined";
                keyValueParent.appendChild(valueElement);
            } else if (dataAttributeValue === null) {
                const valueTextElement = this.document.createTextNode("null");
                valueElement.appendChild(valueTextElement);
                valueElement.className += " null";
                keyValueParent.appendChild(valueElement);
            } else if (dataAttributeType === "string") {
                const valueTextElement = this.document.createTextNode("\"" + dataAttributeValue + "\"");
                valueElement.appendChild(valueTextElement);
                keyValueParent.appendChild(valueElement);
            } else {
                const valueTextElement = this.document.createTextNode(dataAttributeValue.toString());
                valueElement.appendChild(valueTextElement);
                keyValueParent.appendChild(valueElement);
            }

            target.appendChild(keyValueParent);
        }
    }

    collapse(target: HTMLElement) {
        target.innerHTML = "";
    }
}

export default LazyObjectView;