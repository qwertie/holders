Holders
-------

React tutorials for beginners teach you to separately send state to child components, and then receive new state back from those child components through an `onChange` handler. For instance if you've written a `TimeSelector` component to edit a time value, you might use it like this:

~~~jsx
    <TimeSelector time={this.state.teaTime}
              onChange={ t => this.setState({teaTime: t}) }/>
~~~

The *holders* library shortens your code by bundling the "getter" (`this.state.teaTime`) together with the "setter" (`t => this.setState({teaTime: t})`) into a single object called a `Holder`, in order to simplify communication between components to this:

~~~jsx
    <TimeSelector time={this.state.teaTime}/>
~~~

If `teaTime` is a `Holder<Date>` object, `teaTime.get` returns the current value and `teaTime.set(v)` is called to update `teaTime` with a new value. Although *holders* was written in TypeScript, the package is published as JavaScript code so it can be used equally well from JavaScript and TypeScript projects.

To install it in your npm project, run this terminal command: `npm i holders`

Features
--------

- UMD modules targeting ES5 (old browsers supported)
- Two parts: 'hold' is React-independent; 'elements' provides React components that wrap standard elements like `<label>`, `<input type="text">`, `<input type="checkbox">` and so on.
- Minified size: 0.9K for hold.min.js, 4.7K for elements.min.js
- Includes a demo (demo.html)

To Learn More
-------------

This library is part of the [TypeScript-React Primer](http://typescript-react-primer.loyc.net); see [part 5, example 5](http://typescript-react-primer.loyc.net/tutorial-5.html#example-5-simple-forms) to learn more about how to use *holders*.