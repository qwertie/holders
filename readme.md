Holders: speak easy to your components
--------------------------------------

React tutorials for beginners teach you to separately send state to child components, and then receive new state back from those child components through an `onChange` handler. For instance if you've written a `Slider` component to edit a numeric value, you might use it like this:

~~~jsx
    <Slider value={this.props.cacheSize} 
            onChange={value => this.props.onCacheSizeChanged(value)} 
            min={1} max={20} step={1} style={ {width:"12em"} }/>
~~~

And then, whatever code creates _your_ component has to do the same thing again, sending in its own value for `onCacheSizeChanged`.

The *holders* library removes both of these annoyances by bundling the "getter" (`this.props.cacheSize`) together with the "setter" (`value => this.props.onCacheSizeChanged(value)`), in order to simplify communication between components to this:

~~~jsx
    <Slider value={this.props.cacheSize} 
            min={1} max={20} step={1} style={ {width:"12em"} }/>
~~~

Plus, you don't have to write a `Slider` component - this library already includes it.

The getter/setter bundle is called `Holder<T>`:

    /** A wrapper around a value. */
    export type Holder<T> = {
      readonly get: T;
      set: (newValue: T) => void;
    }


If `cacheSize` is a `Holder<number>` object, `cacheSize.get` returns the current value and `cacheSize.set(v)` is called to update `cacheSize` with a new value. This package includes three kinds of holders, and you add your own as necessary.

This library consists of two very small parts:

1. ['holders'](https://github.com/qwertie/holders/blob/master/holders.ts) is the basic code for creating holder objects, including the `holdValue`, `holdStates`, `holdProps`, and `holdAllProps` functions. This tiny module does not use or need React or JSX.
2. ['basic-forms'](https://github.com/qwertie/holders/blob/master/basic-forms.tsx) provides small React components named `Label`, `TextBox`, `CheckBox`, `DateBox`, etc., which wrap standard forms elements like `<label>`, `<input type="text">`, and `<input type="checkbox">`. Each element can have a label and all standard HTML attributes are supported on each form element. Validation is supported (see below).

It also includes an example (demo.html, demo.tsx, demo.css). It was written in TypeScript, but is published as JavaScript code so it can be used equally well from JavaScript and TypeScript projects. 

To install it in your npm project, run this terminal command: `npm i holders`

Programming should always be this easy
--------------------------------------

This package lets you describe most lines of a form with only 1 to 4 lines of code.

Wide                      |  Narrow                   
:------------------------:|:-------------------------:
![](demo.png)             |  ![](demo-narrow.png)

For example, the upper part of this demo, including validation support **and** the underlying model, is described by 38 lines of TypeScript:

~~~tsx
class Model {
  name: string = "";
  birthdate?: Date = undefined; // redundancy: because it's only an example
  address: string = "";
  city: string = "";
  province: string = "";
  email: string = "";
  date?: Date = undefined;
  color: string = "#bbff44";
  married: boolean = false;
  haveChildren: boolean = false;
  error: string;
}

// A simple form
function PersonForm(m: Holders<Model>) {
  let age = asAge(m.birthdate);
  return <form>
    <TextBox p label="Name:"  required value={m.name} autoComplete="name" placeholder="First Last"/>
    <TextBox p label="Age:"            value={age}    type="number"
             parse={text => (age.set(parseFloat(text)), age.get)}/>
    <DateBox p label="Birthdate:"      value={m.birthdate} autoComplete="bday"/>
    <TextBox p label="Address:"        value={m.address}  autoComplete="address-line1"/>
    <TextBox p label="City:"           value={m.city}     autoComplete="address-level2" maxLength={30}/>
    <TextBox p label="Province/state:" value={m.province} autoComplete="address-level1" maxLength={30}/>
    <TextBox p label="Email address:"  value={m.email}  type="email" autoComplete="email"/>
    <p>
      <LabelSpan><CheckBox label="Married"  value={m.married} labelAfter={true}/></LabelSpan>
      {m.married.get ? <CheckBox label="With Children" value={m.haveChildren}/> : undefined}
    </p>
    <ColorPicker p label="Favorite color:" value={m.color}
               error={m.color.get[1] < '9' ? "That color is ugly. It needs more red!" : ""}/>
    <Label p label={<span>Gender <b>(read-only)</b></span>}>
      <Radio label="Male" value={{get: false}}/>{" "}
      <Radio label="Female" value={{get: true}}/>
    </Label>
  </form>;
}
~~~

This form was clearly designed by an idiot, since there is _both_ an "Age" _and_ a "Birthdate" field. In order to convert ages to dates (and vice versa) we're going to need an adapter. That will require another 18 lines of code:

~~~ts
function asAge(date: Holder<Date|undefined>): Holder<number> {
  const msPerYear = 1000*60*60*24*365.2422; // milliseconds per year
  let age = {
    get get() {
      if (date.get)
        return Math.floor((new Date() as any - (date.get as any)) / msPerYear);
    },
    set(value: number) {
      if (!(value === value) || value < 0 || value > 200)
        throw new Error("Invalid age");
      let changeInYears = (age.get || 0) - value;
      let newDate = date.get || new Date();
      newDate.setFullYear(newDate.getFullYear() + changeInYears);
      date.set(newDate);
    }
  };
  return age;
}
~~~

You'll also need some glue to combine the model and view, and here it is:

~~~tsx
function App(props: { model: Model }) {
  const [holders, setHolders] = React.useState(
    holdAllProps(props.model, () => { this.setHolders(holders); })
  );
  return <PersonForm {...holders}/>
}

ReactDOM.render(<App model={new Model()}/>, document.getElementById('app'));
~~~

The built-in holders are not designed for advanced scenarios or hierarchical data. It's on my to-do list to try integrating this with an easy state-management library like MobX (I expect MobX, specifically, to work nicely with this library).

Form elements: design goals
---------------------------

- Be easy and concise to use
- Be small (under 10K minified)
- Be flexible (has global `options`, has various props for customization)
- Be well-documented
- Be minimal but complete. All advanced functionality (e.g. Date input, autocomplete, 
  validation) is offloaded to the browser as much as possible, and styling is left up to 
  CSS (see demo.css for example styling). The standard browser validation API was designed 
  very badly, though, so this library augments the built-in support.

Validation support
------------------

Your app can provide validation errors in four different ways:

1. The `parse` prop can return or throw a `new Error` to display a message
2. The `value.set` function can throw a `new Error` to display a message
3. You can set the `error` prop to display a message or a JSX element
4. You can set HTML5 validation attributes such as `required` or `pattern`, or use a `type` that has built-in validation behavior provided by the browser (e.g. `<TextBox type="email">`)

If the Holder Forms component is text-based (TextBox or TextArea), it will notify the element that it is invalid using the `setCustomValidity` API, and then you can style it with a selector like `input[type="text"]:invalid` or `.user-invalid`. The `user-invalid` class will appear on elements that have a validation error after the user has interacted with them. Typically it is applied when the element loses focus (see the documentation of `showErrorEarly` in `TextAttributesBase` for exceptions to this rule).

Since validation support sucks ass in most browsers, the component produces extra HTML for validation errors. For example, consider this humble component:

~~~tsx
   <TextBox p label="Name:"  required value={m.name} autoComplete="name" placeholder="First Last"/>
~~~

It is marked as `required`, so if you tab out of the component without filling it in, an error will appear. Here's the HTML it produces:

~~~html
<p>
  <label>
    <span class="labelspan">Name:</span>
    <span class="inputspan">
      <input required="" autocomplete="name" placeholder="First Last" type="text" value="" class="user-invalid">
      <span class="errorspan">Please fill out this field.</span>
    </span>
  </label>
</p>
~~~

These elements can then be styled, as demoed in the demo. If you need `TextBox` to produce different markup, there are various things you can do. For example, the `noErrorSpan` prop will suppress the error, the `errorFirst` prop will put the error before the `<input>`, and you can replace the entire layout by installing a custom function for `composeElementWithLabel`.

Documentation
-------------

Full doc comments are provided in the source code for ['holders/holders'](https://github.com/qwertie/holders/blob/master/holders.ts) and ['holders/basic-forms'](https://github.com/qwertie/holders/blob/master/basic-forms.tsx).

To run the demo
---------------

    npm install --global parcel
    npm run demo
    
When it succeeds, visit http://localhost:1234 in a browser.

Features
--------

- CommonJS modules targeting ES5 (old browsers supported)
- Minified size: 2.3K for holders.min.js, 9.3K for basic-forms.min.js
- Includes d.ts files (this package is written in TypeScript)
- Elements are expected to be compatible with Preact as well as React

Version history
---------------

### v4.0.0 ###

- Remove deprecated `holdState` function
- Add new `holdState` helper function. `holdState(useState(...))` converts a React
  state tuple to `Holder<T>`.
- Switch module format from "umd" to "CommonJS". This improves compatibility with
  webpack and parcel, but reduces compatibility with the less popular AMD module system.

### v3.1.3 ###

- Bug fix: Avoid accidentally adding class called `undefined` to invalid input elements

### v3.1.1 ###

- define `HolderGet<T>` (a holder with optional setter).
  Form elements will recognize a holder without a setter as read-only.
- Rename `elements` module to `basic-forms` (`elements` still exists and exports both `basic-forms` and `holders`)
- `holders/basic-forms` module:
  - Enhance the hell out of the validation support
    - Add props `keepBadText`, `showErrorEarly`, `noErrorSpan`
    - `TextBox` is designed to hide the validation error message until it gains and loses focus
  - Export `options` object with new `FormOptions` type
  - Wrap most input elements in `<span class="inputspan">` to make css styling easier.
    The `inputspan` wraps both the `<input>` element and the `<span class="errorspan">`
    element which displays validation errors. The `inputspan` span can be suppressed
    with the `noInputSpan` prop.
  - Add `ColorPicker` component (alternative to `<TextBox type="color">`)
  - Add `DateTimeBox` component
  - Add `InputSpan` component
  - Add `ErrorSpan` component, plus new props on other form elements to support  
    displaying errors: `LabelProps.error`, `LabelProps.errorFirst`
  - Add `options.composeElementWithLabel` function that allows you to control how basic 
    form elements (such as `<input type="text">`) are combined with a label and error 
    string. The default composer function is called `defaultComposer`.
  - Add `refInput` in `InputAttributesBase` for advanced customization
  - When your `parse` prop is called, `this` now refers to the `TextBox` or `TextArea` 
    that the user is changing

### v3.0.0 ###

There are almost no users, so some breaking changes should be okay...

TypeScript version is 3.6.5 to avoid breaking clients that use TypeScript 3.5 or earlier.

- Change signature of all `onChanging` handlers. The new signature is
  the same for value holders and prop holders; the attribute name is
  the third parameter rather than the first.
- Rename `hold()` to `holdProp()`
- `holdProps` and `holdStates` are now optimized to lower memory use of
  groups of holders, but `holdProp` and `holdState` use more memory than
  before (assumption: people usually make multiple holders at once.)
- Add `holdStates()` which uses new code specialized for the React state
  holders it creates. This package still does not require React.
- Add `delayedWrite` parameter to all holders. The old behavior was as
  if `delayedWrite` was always true, but now the default value of
  `delayedWrite` is false.
- Elements no longer throw _initially_ if `value` prop is missing
- Add `RadioAttributesWorkaround<T>`. This is used as a workaround for
  the mysterious difficulty TypeScript has handling
  `RadioAttributes<string>`. You see, `<Radio value={h} is="X"/>` works
  fine if `h` is a `Holder<"X"|"Y">`, but if `h` is `Holder<string>`, it
  says without further explanation that the props of Radio are
  "not assignable" to it. The workaround is to mark `is` optional, even
  though it is required when T is not boolean.
- Bug fix: in FireFox the user can change an <input type="number">
  without giving it focus, which could cause it to fail to be updated
  when `value.get` is changed.
- Improve css styling of the demo

To Learn More
-------------

This library is part of the [TypeScript-React Primer](http://typescript-react-primer.loyc.net); see [part 5, example 5](http://typescript-react-primer.loyc.net/tutorial-5.html#example-5-simple-forms) to learn more about how to use *holders*.
