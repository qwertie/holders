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

This library consists of two parts: 

1. ['holders'](https://github.com/qwertie/holders/blob/master/holders.ts) is the basic code for creating holder objects, including the `holdValue`, `holdStates`, `holdProps`, and `holdAllProps` functions. This module is tiny and does not use React or JSX.
2. ['elements'](https://github.com/qwertie/holders/blob/master/elements.tsx) provides small React components named `Label`, `TextBox`, `CheckBox`, `DateBox`, etc., which wrap standard elements like `<label>`, `<input type="text">`, and `<input type="checkbox">`. Each element can have a label and all standard HTML attributes are supported on each form element. Validation is supported via `HTMLInputElement.setCustomValidity()`. 5K minified.

It also includes an example (demo.html, demo.tsx).

To install it in your npm project, run this terminal command: `npm i holders`

To run the demo
---------------

Due to [bug #1904](https://github.com/parcel-bundler/parcel/issues/1904) in parcel-bundler, Parcel versions above 1.6.2 don't work.

    npm install --global parcel-bundler@1.6.2
    npm run demo
    
Then visit http://localhost:1234 in browser.

Features
--------

- UMD modules targeting ES5 (old browsers supported)
- Minified size: 2.4K for hold.min.js, 5.0K for elements.min.js
- Includes d.ts files (written in TypeScript)
- Elements are expected to be compatible with Preact as well as React

To Learn More
-------------

This library is part of the [TypeScript-React Primer](http://typescript-react-primer.loyc.net); see [part 5, example 5](http://typescript-react-primer.loyc.net/tutorial-5.html#example-5-simple-forms) to learn more about how to use *holders*.