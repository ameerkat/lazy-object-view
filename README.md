# lazy-object-view
lazy-object-view is a simple JS object tree visualizer/explorer that adheres to "what you see is what's in the DOM". lazy-object-view is written in Typescript.

## Why
lazy-object-view is intended to be a more performant alternative to existing JSON visualization packages such as [react-json-tree](https://www.npmjs.com/package/react-json-tree) when the size of the object to be rendered is very large. lazy-object-view attempts to minimize the number of DOM elements on the page by not rendering nodes until they are expanded, and culling nodes when they are closed.

## Usage
lazy-object-view is available as [an npm package](https://www.npmjs.com/package/lazy-object-view). Install this in npm with `npm i lazy-object-view`.

lazy-object-view has a react wrapper @ [react-lazy-object-view](https://github.com/ameerkat/react-lazy-object-view)

To use in a Typescript project simply import and construct a new LazyObjectView object.

```
import LazyObjectView from 'lazy-object-view'

const lazyObjectView = new LazyObjectView();
const targetElement = document.getElementById("root");
if (targetElement !== null) {
    lazyObjectView.render(targetElement, { "test": { "nested_key": "nested_value" }});
}
```

lazy-object-view is exported using webpack's umd (universal module definition).