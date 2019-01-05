import { expect } from 'chai'
import { describe } from 'mocha'
import { JSDOM } from 'jsdom'
import LazyObjectView, { IRenderOptions } from '../src/index'

const defaultDocument = `<!DOCTYPE html><html><head><title>Test Document</title><body><div class="root"></div></body></html>`;
const createNewTestElement = (withDocument: Document) => {
    const testTarget = withDocument.createElement("div");
    testTarget.className = "test-root";
    return testTarget;
}

const simpleTestType = (value: any, expectedValue: string, expectedType: string) => {
    const window = new JSDOM(defaultDocument).window;
    const render = new LazyObjectView(window);
    const testTarget = createNewTestElement(window.document);

    render.render(testTarget, { testkey: value });
    expect(testTarget.childElementCount).to.equal(1);
    expect(testTarget.children[0].className).to.equal("key-value");
    expect(testTarget.children[0].childElementCount).to.equal(2);
    const resultTestKey = testTarget.children[0].children[0].textContent;
    const resultTestValue = testTarget.children[0].children[1].textContent;
    expect(resultTestKey).to.not.be.null;
    expect(resultTestValue).to.not.be.null;
    expect(resultTestKey).to.equal("testkey");
    expect(testTarget.children[0].children[0].className).to.not.contain("collapsed");
    expect(testTarget.children[0].children[1].className).to.contain(expectedType);
    expect(resultTestValue).to.equal(expectedValue);
}

const testRoot = (expectedRootName: string, rootName?: string, ) => {
    const window = new JSDOM(defaultDocument).window;
    const options: IRenderOptions = { "useRootElement": true, rootName: rootName }
    const lazyObjectView = new LazyObjectView(window);
    const testTarget = createNewTestElement(window.document);

    lazyObjectView.render(
        testTarget, 
        { 
            testkey: "shouldn't contain this."
        }, 
        options);
    
    // should be like a collapsed object
    expect(testTarget.childElementCount).to.equal(1);
    expect(testTarget.children[0].className).to.equal("key-value");
    expect(testTarget.children[0].childElementCount).to.equal(2);
    const resultTestKey = testTarget.children[0].children[0].textContent;
    const resultTestValue = testTarget.children[0].children[1].textContent;
    expect(testTarget.children[0].children[0].className).to.contain("collapsed");
    // value element has no children
    expect(testTarget.children[0].children[1].childElementCount).to.equal(0);
    expect(resultTestKey).to.not.be.null;
    expect(resultTestKey).to.equal(expectedRootName);
    expect(resultTestValue).to.equal("");
}

describe('render', () => {
    it('should render no children for null data', () => {
        const window = new JSDOM(defaultDocument).window;
        const render = new LazyObjectView(window);
        const testTarget = createNewTestElement(window.document);
        render.render(testTarget, null);
        expect(testTarget.childElementCount).to.equal(0);
    });

    it('should render no children for undefined data', () => {
        const window = new JSDOM(defaultDocument).window;
        const render = new LazyObjectView(window);
        const testTarget = createNewTestElement(window.document);
        // @ts-ignore
        render.render(testTarget);
        expect(testTarget.childElementCount).to.equal(0);
    });

    it('should raise an exception for null target element', () => { 
        const window = new JSDOM(defaultDocument).window;
        const render = new LazyObjectView(window);

        // @ts-ignore
        expect(() => { render.render(null, null) }).to.throw("target HTMLElement must not be null or undefined.");
    });

    it('should raise an exception for undefined target element', () => { 
        const window = new JSDOM(defaultDocument).window;
        const render = new LazyObjectView(window);

        // @ts-ignore
        expect(() => { render.render() }).to.throw("target HTMLElement must not be null or undefined.");
    });

    it('should render a simple key-value for single string value object', () => {
        simpleTestType("test-value", "\"test-value\"", "string");
    });

    it('should render a simple key-value for single undefined value object', () => {
        simpleTestType(undefined, "undefined", "undefined");
    });

    it('should render a simple key-value for single null value object', () => {
        simpleTestType(null, "null", "null");
    });

    it('should render a simple key-value for single null value object', () => {
        simpleTestType(null, "null", "null");
    });

    it('should render a simple key-value for single empty array value object', () => {
        simpleTestType([], "[]", "empty");
    });

    it('should render a simple key-value for single number value object', () => {
        simpleTestType(3.2, "3.2", "number");
    });

    it('should render a simple key-value for single boolean value object', () => {
        simpleTestType(true, "true", "boolean");
    });

    it('should render a simple key-value for single function value object', () => {
        simpleTestType(() => { return "test"; }, "function () { return \"test\"; }", "function");
    });

    it('should render a collapsed object tree for objects passed in, and expand on click', () => {
        const window = new JSDOM(defaultDocument).window;
        const render = new LazyObjectView(window);
        const testTarget = createNewTestElement(window.document);
    
        render.render(testTarget, { 
            testkey: { 
                nested: "inner-value"
            } 
        });

        expect(testTarget.childElementCount).to.equal(1);
        expect(testTarget.children[0].className).to.equal("key-value");
        expect(testTarget.children[0].childElementCount).to.equal(2);
        const resultTestKey = testTarget.children[0].children[0].textContent;
        const resultTestValue = testTarget.children[0].children[1].textContent;
        expect(testTarget.children[0].children[0].className).to.contain("collapsed");
        // value element has no children
        expect(testTarget.children[0].children[1].childElementCount).to.equal(0);
        expect(resultTestKey).to.not.be.null;
        expect(resultTestKey).to.equal("testkey");
        expect(resultTestValue).to.equal("");

        // should expand the tree when clicked
        var evt = window.document.createEvent("HTMLEvents");
        evt.initEvent("click", false, true);
        testTarget.children[0].children[0].dispatchEvent(evt);
        // testTarget > .key-value > the value element > the nested key value > the key or value
        const nestedTestKey = testTarget.children[0].children[1].children[0].children[0].textContent;
        const nestedTestValue = testTarget.children[0].children[1].children[0].children[1].textContent;
        expect(testTarget.children[0].children[0].className).to.contain("expanded");
        expect(nestedTestKey).to.equal("nested");
        expect(nestedTestValue).to.equal("\"inner-value\"");

        // and collapse again when clicked once more
        var evt = window.document.createEvent("HTMLEvents");
        evt.initEvent("click", false, true);
        testTarget.children[0].children[0].dispatchEvent(evt);
        expect(testTarget.children[0].children[0].className).to.contain("collapsed");
        expect(testTarget.children[0].children[1].childElementCount).to.equal(0);
    });

    it('should collapse strings over a certain length when using the collapse strings option', () => {
        const window = new JSDOM(defaultDocument).window;
        const stringCutoffThreshold = 12;
        const options: IRenderOptions = { "collapseStringsOver": stringCutoffThreshold }
        const lazyObjectView = new LazyObjectView(window);
        const testTarget = createNewTestElement(window.document);

        const exampleValue = "the quick brown fox jumped over the lazy doggo.";
        const expectedValue = "\"" + exampleValue + "\"";
        lazyObjectView.render(testTarget, 
            { testkey: exampleValue}, 
            options);
        expect(testTarget.childElementCount).to.equal(1);
        expect(testTarget.children[0].className).to.equal("key-value");
        expect(testTarget.children[0].childElementCount).to.equal(2);
        const resultTestKey = testTarget.children[0].children[0].textContent;
        const resultTestValue = testTarget.children[0].children[1].textContent;
        expect(resultTestKey).to.not.be.null;
        expect(resultTestValue).to.not.be.null;
        expect(resultTestKey).to.equal("testkey");
        expect(testTarget.children[0].children[0].className).to.not.contain("collapsed");
        const truncatedExpectedValue = expectedValue.substring(0, stringCutoffThreshold);
        const remainingLength = expectedValue.length - stringCutoffThreshold;
        expect(resultTestValue).to.equal(truncatedExpectedValue + "... [+" + remainingLength.toString() + "]");

        // should expand the collapsed string value when clicked
        var evt = window.document.createEvent("HTMLEvents");
        evt.initEvent("click", false, true);
        testTarget.children[0].children[1].children[0].children[0].dispatchEvent(evt);
        const expandedTestValue = testTarget.children[0].children[1].textContent;
        expect(expandedTestValue).to.equal(expectedValue);
    });

    it('should use a root element with name "root" when specifying to use root element, and providing no name', () => {
        testRoot("root");
    });

    it('should use a root element with root name from options when specifying to use root element, and providing root name', () => {
        testRoot("pineapple", "pineapple");
    });
});
