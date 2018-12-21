import { expect } from 'chai'
import { describe } from 'mocha'
import { JSDOM } from 'jsdom'
import LazyObjectView from '../src/index'

const defaultDocument = `<!DOCTYPE html><html><head><title>Test Document</title><body><div class="root"></div></body></html>`;
const createNewTestElement = (withDocument: Document) => {
    const testTarget = withDocument.createElement("div");
    testTarget.className = "test-root";
    return testTarget;
}

describe('render', () => {
    it('should render no children for null data', () => {
        const { document } = new JSDOM(defaultDocument).window;
        const render = new LazyObjectView(document);
        const testTarget = createNewTestElement(document);
        render.render(testTarget, null);
        expect(testTarget.childElementCount).to.equal(0);
    });

    it('should render no children for undefined data', () => {
        const { document } = new JSDOM(defaultDocument).window;
        const render = new LazyObjectView(document);
        const testTarget = createNewTestElement(document);
        // @ts-ignore
        render.render(testTarget);
        expect(testTarget.childElementCount).to.equal(0);
    });

    it('should raise an exception for null target element', () => { 
        const { document } = new JSDOM(defaultDocument).window;
        const render = new LazyObjectView(document);

        // @ts-ignore
        expect(() => { render.render(null, null) }).to.throw("target HTMLElement must not be null or undefined.");
    });

    it('should raise an exception for undefined target element', () => { 
        const { document } = new JSDOM(defaultDocument).window;
        const render = new LazyObjectView(document);

        // @ts-ignore
        expect(() => { render.render() }).to.throw("target HTMLElement must not be null or undefined.");
    });

    it('should render a simple key-value for single value object', () => {
        const { document } = new JSDOM(defaultDocument).window;
        const render = new LazyObjectView(document);
        const testTarget = createNewTestElement(document);

        render.render(testTarget, { testkey: "test-value"});
        expect(testTarget.childElementCount).to.equal(1);
        expect(testTarget.children[0].className).to.equal("key-value");
        expect(testTarget.children[0].childElementCount).to.equal(2);
        const resultTestKey = testTarget.children[0].children[0].textContent;
        const resultTestValue = testTarget.children[0].children[1].textContent;
        expect(resultTestKey).to.not.be.null;
        expect(resultTestValue).to.not.be.null;
        // @ts-ignore
        expect(resultTestKey).to.equal("testkey");
        expect(testTarget.children[0].children[0].className).to.not.contain("collapsed");
        // @ts-ignore
        expect(resultTestValue).to.equal("\"test-value\"");
    });
});
