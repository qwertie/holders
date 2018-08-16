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

Features
--------

- Targets ES5 (old browsers supported)

To Learn More
-------------

This library is part of the [TypeScript-React Primer]; see [part 5, example 5](typescript-react-primer.loyc.net/tutorial-5.html#example-5-simple-forms) to learn more about how to use *holders*.