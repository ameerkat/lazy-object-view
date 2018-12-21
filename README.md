# lazy-object-view
lazy-object-view is a simple JS object tree visualizer/explorer that adheres to "what you see is what's in the DOM".

## Usage
lazy-object-view has a react wrapper [react-lazy-object-view](https://github.com/ameerkat/react-lazy-object-view)

```
import LazyObjectView from 'lazy-object-view'

const lazyObjectView = new LazyObjectView();
const targetElement = document.getElementById("root");
if (targetElement !== null) {
    lazyObjectView.render(targetElement, { "test": { "nested_key": "nested_value" }});
}
```
