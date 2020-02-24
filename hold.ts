
/** A wrapper around a value. */
export type Holder<T> = {
  readonly get: T;
  set: (newValue: T) => void;
}

/** Maps an interface to a collection of Holders. For example,
 *  `Holders<{ foo: number, bar: string }>` means 
 *  `{ foo: Holder<number>, bar: Holder<string> }`. */
export type Holders<Model> = {
  // "-?" avoids the default behavior that `foo?:T` maps to 
  // `foo?:Holder<T|undefined>` instead of `foo:Holder<T|undefined>`
  [P in keyof Model]-?: Holder<Model[P]>;
}

/** A wrapper around a value, implementing Holder<T> and providing change notification. */
export class ValueHolder<T> implements Holder<T> {
  /** Initializes the ValueHolder. The onChanging handler is called before the change is
   *  actually made. It can return `undefined` to allow the proposed value to be stored,
   *  or it can return something else to cause that to be stored. */
  constructor(public value: T, public onChanging?: (newValue: T, holder: Holder<T>) => T|undefined) {}
  get get() {
    return this.value;
  }
  set(newValue: T) {
    if (this.onChanging) {
      let result = this.onChanging(newValue, this);
      if (result !== undefined) {
        this.value = result;
        return;
      }
    }
    this.value = newValue;
  }
}

/** A helper function that bundles a getter and setter into a Holder object.
 *  For example, `hold(model, "foo").get` returns the value of `model.foo`, 
 *  and `hold(model, "foo").set("newVal")` changes the value of `model.foo`
 *  to "newVal". If a third argument `onChange` is provided, it is called 
 *  before (or instead of) updating the model. For example, the following 
 *  code creates a reference called `foo` so that if you write 
 *  `foo.set("YES")`, the callback executes `this.setState({ foo: "YES" })`:
 *  
 *      var onChange = (attr:any, newVal:any) => {
 *        this.setState({ [attr]: newVal });
 *      };
 *      var foo = hold(this.state, "foo", onChange);
 * 
 *  @param model An object that contains a property you want to bind.
 *  @param attr  The name of a property of `model` that you want to bind.
 *  @param onChanging A function that will be called later, when the return
 *         value's `val` property is changed. The first argument is the
 *         value of `attr` (usually a string), and the second argument is
 *         the value assigned to the Holder's val. `onChanging` can change
 *         the value to be assigned by returning the desired value, or it
 *         can return `undefined` to cause default change behavior, which 
 *         is `model[attr] = newValue`.
 */
export function hold<T, Attr extends keyof T>(model: T, attr: Attr, 
  onChanging: ((attr: Attr, newValue: T[Attr], holder: Holder<T[Attr]>) => T[Attr]|void) | undefined): Holder<T[Attr]>
{
  return new PropHolder(model, attr, onChanging);
}

/** A reference to a property of an object (see hold(), which returns this type). */
export class PropHolder<T, Attr extends keyof T> implements Holder<T[Attr]>
{
  constructor(public model: T, public attr: Attr, 
    public onChanging?: (attr:Attr, newValue:T[Attr], holder: Holder<T[Attr]>)=>T[Attr]|void) {}
  get get() {
    return this.model[this.attr];
  }
  set(newValue: any) {
    if (this.onChanging) {
      let result = this.onChanging(this.attr, newValue, this);
      if (result !== undefined) {
        if (this.model[this.attr] !== result)
          this.model[this.attr] = result;
        return;
      }
    }
    this.model[this.attr] = newValue;
  }
}

/**
 * A helper function for using `hold()` a component's state in React. 
 * If you write 
 * 
 *     var hstate = holdState(this as MyClass); // cast as its own type
 *     var foo = hstate("foo");
 *     var bar = hstate("bar");
 * 
 * where ThisClass is the type of this (TypeScript fails to infer it),
 * it is equivalent to
 * 
 *     var onChange = (attr:any, newVal:any) => {
 *       this.setState({ [attr]: newVal });
 *     };
 *     var foo = hold(this.state, "foo", onChange);
 *     var bar = hold(this.state, "bar", onChange);
 */
export function holdState<This extends {state: State, setState: (s:any/*Readonly<Partial<State>>*/)=>any}, State=This["state"]>
  (component: This): <Attr extends keyof State>(attr: Attr) => Holder<State[Attr]>
{
  return function<Attr extends keyof State>(attr: Attr) {
    return hold(component.state, attr, (a: Attr, newValue: State[Attr]) => {
      component.setState({ [a]: newValue });
    });
  };
}

/** Given an object and a list of property names, constructs a new 
 *  object with a Holder wrapping each property of the object. */
export function holdProps<T, Props extends keyof T>
  (model: T, propNames: Props[], onChange?: ((attr: Props, newValue: T[Props], holder: Holder<T[Props]>) => T[Props]|void)):
  { [P in Props]-?: Holder<T[P]> }
{
  return propNames.reduce((out,k) => (out[k] = hold(model, k, onChange), out),
    {} as { [P in Props]-?: Holder<T[P]> });
}

/** Given an object, constructs a new object with a Holder wrapping each 
 *  enumerable property of the original object. */
export function holdAllProps<T extends {}>(model: T,
  onChange?: (<A extends keyof T>(attr: A, newValue: T[A], holder: Holder<T[A]>) => T[A]|void)): Holders<T>
{
  return holdProps(model, Object.keys(model) as (keyof T)[], onChange);
}
