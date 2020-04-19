/** A wrapper around a value. The holder is read-only if the set function is missing. */
export type Holder<T> = {
  readonly get: T;
  set?: (newValue: T) => void;
}

/** Maps an interface to a collection of Holders. For example,
 *  `Holders<{ foo: number, bar: string }>` means 
 *  `{ foo: Holder<number>, bar: Holder<string> }`. */
export type Holders<Model> = {
  // "-?" avoids the default behavior that `foo?:T` maps to 
  // `foo?:Holder<T|undefined>` instead of `foo:Holder<T|undefined>`
  [P in keyof Model]-?: Holder<Model[P]>;
}

/** This is the type of user-defined change handlers in this library. If your change handler
 *  returns something other than `undefined`, it is assigned to the underlying model instead of 
 *  `newValue`. However, the standard holders will not alter the value in the underlying model 
 *  if the change handler returns whatever value is the current value.
 * 
 *  @param attr The name of the attribute on the underlying model. If the holder came from
 *              holdValue then this parameter is always "value".
 * 
 *  Note: TypeScript does not require you to accept all four parameters.
 */
export type OnChanging<This, T, Name> = 
  (this: This, newValue: T, oldValue: T, attr: Name) => T|void;

// Save memory by storing the `delayedWrite` bit on the prototype, not each instance
let EagerValueHolder = NewValueHolderClass(false);
let DelayedValueHolder = NewValueHolderClass(true);

function NewValueHolderClass(delayedWrite: boolean)
  : { new(value: any, onChanging?: OnChanging<Holder<any>, any, "value">, onChangingThis?: any): Holder<any> }
{
  class ValueHolder<T> implements Holder<T>
  {
    onChangingThis?: any;
    /** Initializes the ValueHolder. */
    constructor(protected value: T, protected onChanging?: OnChanging<Holder<T>, T, "value">, onChangingThis?: any) {
      this.value = value;
      this.onChanging = onChanging;
      if (onChangingThis)
        this.onChangingThis = onChangingThis;
    }
    get get() {
      return this.value;
    }
    set(newValue: T) {
      let oldValue = this.value;
      if (this.onChanging) {
        if (!delayedWrite)
          this.value = newValue;
        let result = this.onChanging.call(this.onChangingThis || this, newValue, oldValue, "value");
        if (result !== undefined)
          newValue = result;
      }
      if (this.value !== newValue)
        this.value = newValue;
    }
  }
  return ValueHolder;
}

/** Returns a trivial read-only holder: `{ get: value }` */
export function hold<T>(value: T) {
  return { get: value };
}

/** Creates a wrapper around a value, implementing Holder<T> and providing change 
 *  notification. The change logic for a value-holder is the same as a prop-holder
 *  returned from holdProps(): the onChanging handler can change the value written,
 *  and it is called after or before the change is made, depending on whether the
 *  delayedWrite constructor parameter is truthy.
 * 
 *  @param initialValue Initial value of the `get` property of the returned Holder<T>.
 *  @param onChanging Change handler (see documentation of OnChanging)
 *  @param delayedWrite If true, changes are not written immediately but
 *         only after `onChanging` is called, and only if the new value is different (!==).
 *  @param onChangingThis The value of `this` inside `onChanging`; if this parameter
 *         is missing/undefined, `this` will be the Holder itself.
 */
export function holdValue<T>(initialValue: T, onChanging?: OnChanging<Holder<T>, T, "value">, delayedWrite?: boolean): Holder<T>
export function holdValue<T, This>(initialValue: T, onChanging?: OnChanging<Holder<T>, T, "value">, delayedWrite?: boolean, onChangingThis?: This): Holder<T>
export function holdValue<T, This>(initialValue: T, 
  onChanging?: OnChanging<Holder<T>, T, "value">,
  delayedWrite?: boolean,
  onChangingThis?: This): Holder<T>
{
  return (delayedWrite
    ? new DelayedValueHolder(initialValue, onChanging, onChangingThis) 
    : new EagerValueHolder(initialValue, onChanging, onChangingThis));
}

interface PropHolder_<M, P extends keyof M> {
  new(attr: P): Holder<M[P]>
}
function NewPropHolderClass<M, Props extends keyof M, This>(
  model: M,
  onChange: OnChanging<This, M[Props], Props>|undefined,
  delayedWrite: boolean|undefined,
  onChangeThis: This)
  : PropHolder_<M, Props>
{
  class PropHolder implements Holder<M[Props]>
  {
    model() { return model; } // to help users debug
    
    constructor(public attr: Props) { }
    
    get get() {
      return this.model()[this.attr];
    }
    set(newValue: M[Props]) {
      let oldValue = this.get;
      if (onChange) {
        if (!delayedWrite)
          model[this.attr] = newValue;
        let result = onChange.call(onChangeThis, newValue, oldValue, this.attr);
        if (result !== undefined)
          newValue = result;
        else if (!delayedWrite)
          return;
      }
      if (this.get !== newValue)
        model[this.attr] = newValue;
    }
  }
  return PropHolder;
}

/** A helper function that bundles a getter and setter into a Holder object.
 *  For example, `holdProp(model, "foo").get` returns the value of `model.foo`, 
 *  and `holdProp(model, "foo").set("newVal")` changes the value of `model.foo`
 *  to "newVal". If a third argument `onChange` is provided, it is called 
 *  before, after, or instead of updating the model. For example, the 
 *  following code creates a reference called `foo` so that if you write 
 *  `foo.set("YES")`, the callback prints a message describing the change:
 *  
 *      var onChange = (attr:any, newVal:any, oldVal:any) => {
 *        console.log(attr + " changed from " + oldVal + " to " + newVal);
 *      };
 *      var foo = hold(this.state, "foo", onChange, false);
 * 
 *  If you want holders for several properties, and the same change handler 
 *  can be used for all of them, call holdProps instead (it saves memory).
 * 
 *  @param model An object that contains a property you want to bind.
 *  @param attr  The name of a property of `model` that you want to bind.
 *  @param onChanging A function that will be called later, when `set()` is called on
 *         the returned holder. `onChanging` can change the value to be assigned by
 *         returning the desired value, or it can return `undefined` to accept the
 *         default change behavior, which is `model[attr] = newValue`.
 *         See the documentation of `OnChanging` for details.
 *  @param delayedWrite If true, changes are not written immediately but only after
 *         `onChanging` is called, and only if the new value is !== model[attr].
 *  @param onChangingThis The value of `this` inside `onChanging`; if this parameter
 *         is missing/undefined, `this` will be `model`.
 */
export function holdProp<M, Attr extends keyof M>      (model: M, attr: Attr, onChanging?: OnChanging<M, M[Attr], Attr> | undefined, delayedWrite?: boolean): Holder<M[Attr]>;
export function holdProp<M, Attr extends keyof M, This>(model: M, attr: Attr, onChanging?: OnChanging<This, M[Attr], Attr> | undefined, delayedWrite?: boolean, onChangingThis?: This): Holder<M[Attr]>;
export function holdProp<M, Attr extends keyof M, This>(model: M, attr: Attr, 
  onChanging?: OnChanging<This, M[Attr], Attr> | undefined,
  delayedWrite?: boolean,
  onChangingThis?: This
  ): Holder<M[Attr]>
{
  return new (NewPropHolderClass(model, onChanging, delayedWrite, onChangingThis || model as any))(attr);
}

/**
 * Deprecated (use holdStates instead). This is a helper function for using 
 * `hold()` for a component's state in React. If you write 
 * 
 *     var hstate = holdState(this);
 *     var foo = hstate("foo");
 *     var bar = hstate("bar");
 * 
 * it is equivalent to
 * 
 *     var onChange = (newVal:any, oldVal:any, attr:any) => {
 *       this.setState({ [attr]: newVal });
 *       return this.state[attr]; // tell the holder not to change state[attr]
 *     };
 *     var foo = hold(this.state, "foo", onChange, true);
 *     var bar = hold(this.state, "bar", onChange, true);
 */
export function holdState<This extends {state: State, setState: (s:any/*Readonly<Partial<State>>*/)=>any}, State=This["state"]>
  (component: This): <Attr extends keyof State>(attr: Attr) => Holder<State[Attr]>
{
  return function<Attr extends keyof State>(attr: Attr) {
    return holdProp(component.state, attr, (newValue: State[Attr], old: State[Attr], a: Attr) => {
      component.setState({ [a]: newValue });
      return component.state[a];
    }, true);
  };
}

interface Component<State> {
  state: State;
  setState: (s:any/*Readonly<Partial<State>>*/)=>any;
}
interface StateHolder_<C extends Component<State>, Attrs extends keyof State, State = C["state"]> {
  new(attr: Attrs): Holder<State[Attrs]>
}

function NewStateHolderClass<C extends Component<State>, Attrs extends keyof State, State = C["state"]>
  (component: C, onChange?: OnChanging<C, State[Attrs], Attrs>, delayedWrite?: boolean): StateHolder_<C, Attrs>
{
  class StateHolder implements Holder<State[Attrs]>
  {
    component() { return component; } // debugging helper
    
    constructor(public readonly attr: Attrs) { }
    
    get get() {
      return this.component().state[this.attr];
    }
    setState(newValue: State[Attrs]) {
      return this.component().setState({ [this.attr]: newValue });
    }
    set(newValue: State[Attrs]) {
      let oldValue = this.get;
      if (onChange) {
        if (!delayedWrite)
          this.setState(newValue);
        let result = onChange.call(component, newValue, oldValue, this.attr);
        if (result !== undefined)
          newValue = result;
        else if (!delayedWrite)
          return;
      }
      if (this.get !== newValue)
        this.setState(newValue);
    }
  }
  return StateHolder;
}

/**
 * A helper function for making holders representing React state. If you write 
 * 
 *     let held = holdStates(this as MyClass, ["foo", "bar"]); // cast as its own type
 * 
 * where MyClass is the type of this (TypeScript fails to infer it), it is equivalent to
 * 
 *     function onChange(attr:any, newVal:any) => {
 *       this.setState({ [attr]: newVal });
 *       return this.state[attr]; // tell the holder not to change state[attr]
 *     };
 *     let held = {
 *       foo: hold(this.state, "foo", onChange);
 *       bar: hold(this.state, "bar", onChange);
 *     }
 */
export function holdStates<C extends Component<State>, Attr extends keyof State, State=C["state"]>
  (component: C, stateNames: Attr[], onChange?: OnChanging<C, State[Attr], Attr>, delayedWrite?: boolean):
  { [A in Attr]-?: Holder<State[A]> }
{
  let HolderClass = NewStateHolderClass(component, onChange, delayedWrite);
  return stateNames.reduce((out, k) => (out[k] = new HolderClass(k), out), {} as { [A in Attr]-?: Holder<State[A]> });
}

/** Given an object and a list of property names, constructs a new 
 *  object with a Holder wrapping each property of the object.
 * 
 *  @param model An object that contains properties you want to wrap in holders.
 *  @param propNames Names of properties of `model` that you want holders for.
 *  @param onChanging A function that will be called later, when `set()` is called on
 *         any of the holders. `onChanging` can change the value to be assigned by
 *         returning the desired value, or it can return `undefined` to accept the
 *         default change behavior, which is `model[attr] = newValue` (where `attr` 
 *         is an element of `propNames` and is the third parameter to `onChanging`.)
 *         See the documentation of `OnChanging` for details.
 *  @param delayedWrite If true, changes are not written immediately but only after
 *         `onChanging` is called, and only if the new value is !== model[attr].
 *  @param onChangingThis The value of `this` inside `onChanging`; if this parameter
 *         is missing/undefined, `this` will be `model`.
 **/
export function holdProps<M, Props extends keyof M>      (model: M, propNames: Props[], onChange?: OnChanging<M, M[Props], Props>, delayedWrite?: boolean) : { [P in Props]-?: Holder<M[P]> };
export function holdProps<M, Props extends keyof M, This>(model: M, propNames: Props[], onChange?: OnChanging<This, M[Props], Props>, delayedWrite?: boolean, onChangeThis?: This) : { [P in Props]-?: Holder<M[P]> };
export function holdProps<M, Props extends keyof M, This>
  (model: M,
   propNames: Props[],
   onChange?: OnChanging<M, M[Props], Props>,
   delayedWrite?: boolean,
   onChangeThis?: This):
  { [P in Props]-?: Holder<M[P]> }
{
  let HolderClass = NewPropHolderClass(model, onChange, delayedWrite, onChangeThis || model as any);
  return propNames.reduce((out, k) => (out[k] = new HolderClass(k), out), {} as { [P in Props]-?: Holder<M[P]> });
}

/** Given an object, constructs a new object with a Holder wrapping each 
 *  enumerable property of the original object. This function is the same
 *  as `holdProps` except that the `propNames` parameter is left out. */
export function holdAllProps<M extends {}, This>(model: M, onChange?: (<A extends keyof M> (this: M, newValue: M[A], oldValue: M[A], attr: A) => M[A]|void), delayedWrite?: boolean): Holders<M>;
export function holdAllProps<M extends {}, This>(model: M, onChange?: (<A extends keyof M> (this: This, newValue: M[A], oldValue: M[A], attr: A) => M[A]|void), delayedWrite?: boolean, onChangeThis?: This): Holders<M>;
export function holdAllProps<M extends {}, This>
  (model: M,
   onChange?: (<A extends keyof M> (this: This, newValue: M[A], oldValue: M[A], attr: A) => M[A]|void),
   delayedWrite?: boolean,
   onChangeThis?: This
  ): Holders<M>
{
  return holdProps(model, Object.keys(model) as (keyof M)[], onChange, delayedWrite, onChangeThis || model as any);
}
