import {createElement, Component, HTMLAttributes, ComponentElement, ChangeEvent} from "react";
import {HolderGet} from './holders';

/* @jsx h */
var h = createElement;

/** Labeling properties that can be attached to labelable elements such as
 *  Label, TextBox, TextArea, CheckBox, Radio, Button, and Slider. 
 *  Also includes props for displaying validation errors. */
export interface LabelProps {
  /** If true, the label element is wrapped in a `<p>` element to add a line break. */
  p?: boolean;
  /** The label text string or element that is placed just inside the label, in a span. */
  label?: React.ReactNode;
  /** The className of the span that holds the label text (the default is labelspan). */
  labelClass?: string;
  /** Styles of the label text (not the label element, but the text inside, which is a span.) */
  labelStyle?: React.CSSProperties;
  /** If true, the label text comes after the (child) element instead of before 
   *  (and the default class/style, if any, is not applied) */
  labelAfter?: boolean;
  /** If a label is attached to an input elements, the input element is normally wrapped
   *  in a `<span class="inputspan">` element. Adding `noInputSpan` will remove
   *  that span element. */
  noInputSpan?: boolean;
  /** If true, an error span is not produced alongside the input element even when there
   *  is a validation error. */
  noErrorSpan?: boolean;
  /** An optional message displayed after (or before) the element. User-defined CSS
   *  is required to make this look good; by default it'll have className="errorspan".
   *  If you provide a parse function for a TextBox/TextArea and it fails, its error 
   *  message overrides this property.
   *
   *  By default, an error also causes the element to be marked invalid using the HTML5
   *  `setCustomValidity` API, but this doesn't happen if error is an element (that API 
   *  does not support anything but plain text).
   * 
   *  The elements in this library also watch for the HTML5 `validationMessage` associated
   *  with the element. If the error property `== null` (or if it is a `Holder` with 
   *  `.get == null`), the HTML5 validation message will be shown instead. If this
   *  property is a Holder and it has a setter, the input element will call the `.set()`
   *  function when an HTML5 validation error event occurs.
   */
  error?: string | JSX.Element | HolderGet<string | JSX.Element>;
  /** Whether the error property is displayed before the element itself. */
  errorFirst?: boolean;
}

/** This is the type of the global `options` variable.
 *  TODO: use React Context for options instead. Pull request welcome...
*/
export interface FormOptions
{
  /** Any elements in this module that have a label will use these settings when you have
   *  not provided labelClass, labelStyle or labelAfter props. If any of these props are
   *  specified, the class and style specified here are not used. This is also the default 
   *  class and style of the LabelSpan component in this module (again, these settings will 
   *  not be used if labelClass, labelStyle or labelAfter props are used.)
   */
  labelSpan: { class: string, style: React.CSSProperties|undefined };

  /** When you are using an element in this module and you provide a "label" setting,
   *  the input element (or textarea element, or whatever) will be wrapped in a <span>
   *  with the class and style specified here. For example, if you just write
   *  
   *      <TextBox value={m.name} autoComplete="name"/>
   *  
   *  it produces HTML like
   *  
   *      <input type="text" value="" autocomplete="name"> (with events attached)
   * 
   *  but if you add a label like
   *  
   *      <TextBox label="Name:" value={m.name} autoComplete="name"/>
   * 
   *  then in addition to a label element, new spans appear based on the settings in
   *  `options.labelSpan` and `options.inputSpan`:
   * 
   *      <label>
   *        <span class="labelspan">Name:</span>
   *        <span class="inputspan"><input type="text" value="" autocomplete="name"></span>
   *      </label>
   *  
   *  If you add a `p` property, the above HTML is also wrapped in a `<p>` element. 
   *  This works well with CSS such as the following, which displays the input elements 
   *  either on the same line or the next line after the labelspan, depending on the
   *  width available:
   * 
   *  form p, form p > label:only-child {
   *    display: flex;
   *    flex-flow: row wrap;
   *    align-items: center;
   *    width: 100%;
   *  }
   *  .labelspan {
   *    flex: 1 0;
   *    min-width: 10em;
   *  }
   *  .labelspan ~ .inputspan {
   *    flex: 2 0;
   *    min-width: 15em;
   *  }
   *  textarea, input[type="text"] {
   *    width: 100%;
   *  }
   * 
   *  If the described arrangement of elements is not what you need, it is at least possible 
   *  to globally override the way the input element, the label, and the error are combined:
   *  override the value of `options.composeElementWithLabel`.
   */
  inputSpan: { class: string, style: React.CSSProperties|undefined };
  
  /** Default settings (class and style) for the optional message displayed inside the 
   *  inputspan, after (or before) an input element from this library. To disable error 
   *  span production, set both the class and the style to undefined.
   * 
   *  Normally, the so-called error span is added to the DOM only if an error is shown (when
   *  the `error` prop is set, or if the `parse` function of a TextBox/TextArea fails, or
   *  if there is a validation error). For text-based controls, the `forceEmitForText` option
   *  forces empty error spans to be emitted unless error display is disabled entirely
   *  (this is used, for example, to make animation work in the demo when an error appears 
   *  or disappears)
   **/
  errorSpan: {
    class: string, style: React.CSSProperties|undefined, 
    emitEmptyForText: boolean
  };

  /** Default values of the keepBadText and showErrorEarly props (see `TextAttributesBase`) */
  validation: { keepBadText: boolean, showErrorEarly: boolean }

  /** This function's job is to combine an element (such as <input>, <button> or <textarea>) 
   *  with <p>, <Label>, <LabelSpan>, <InputSpan> and/or <ErrorSpan> depending on its props.
   * 
   * @param el A virtual element such as an `<input>`, `<button>` or `<textarea>`.
   * @param type The `type` attribute of an `<input>` element, or the tag ("textarea", "button") 
   *        if it is not an input element.
   * @param p  At minimum, this contains options for labeling and error display
   * @param error Validation error, if any. This function should ignore `p.error`.
   */
  composeElementWithLabel: (el: JSX.Element, type: string|undefined, p: LabelProps, error?: string | JSX.Element) => JSX.Element
}

/** See FormOptions for documentation. */
export var options: FormOptions = {
  labelSpan: { class: "labelspan", style: undefined },
  inputSpan: { class: "inputspan", style: undefined },
  errorSpan: { class: "errorspan", style: undefined, emitEmptyForText: false },
  validation: { keepBadText: false, showErrorEarly: false },
  composeElementWithLabel: defaultComposer
};

/** Wraps elements or components in a `<label>` element (and optional `<p>` element),
 *  for example, `<Label label="Hello"><TextBox value={x}/></Label>` is rendered like
 *  
 *      <label>
 *        <span style={options.labelSpan.style} class={options.labelSpan.class}>Hello</span>
 *        <span style={options.inputSpan.style} class={options.inputSpan.class}>
 *          <TextBox value={x}/>
 *        </span>
 *      </label>
 *  
 *  It is possible to suppress the second `<span>` (leaving a bare TextBox) with a
 *  `labelspan={false}` property. It can be suppressed globally by setting both 
 *  `options.inputSpan.class = undefined` and `options.inputSpan.style = undefined`.
 */
export function Label(p: LabelProps & HTMLAttributes<HTMLElement>) {
  let ois = options.inputSpan;
  var children = p.children;
  if (!p.noInputSpan && (ois.class || ois.style))
    children = <InputSpan>{children}</InputSpan>;
  var label = createElement("label", omit(p, LabelAttrs), 
    ...(p.labelAfter ? [children, LabelSpan(p)] : [LabelSpan(p), children]));
  return p.p ? <p>{label}</p> : label;
}

/** Subcomponent for the `<span>` of label text within a Label. */
export function LabelSpan(p: LabelProps & { children?: React.ReactNode }) {
  var auto = !(p.labelStyle || p.labelClass || p.labelAfter);
  return <span className={auto ? options.labelSpan.class : p.labelClass} 
                   style={auto ? options.labelSpan.style : p.labelStyle}>{p.label || p.children}</span>;
}

export function InputSpan(p: { children: React.ReactNode }): JSX.Element {
  let ois = options.inputSpan;
  return <span className={ois.class} style={ois.style}>{p.children}</span>;
}

export function ErrorSpan(p: { children: React.ReactNode }): JSX.Element {
  let oes = options.errorSpan;
  return <span className={oes.class} style={oes.style}>{p.children}</span>;
}

/** Attributes that apply to all `input` elements including simple buttons */
export interface InputAttributesBase extends React.HTMLAttributes<HTMLElement>, LabelProps {
  /** If true, the label element is wrapped in a `<p>` element to add a line break. */
  p?: boolean;
  /** If this property is present, the form element will be wrapped in a <label> */
  label?: string;
  /** Class name of the label element, if the label property is used. */
  labelClass?: string;
  /** Styles of the label text (not the label element, but the text inside, which is a span.)
   *  If there is no labelClass and no labelStyle then DefaultLabelStyle is used. */
  labelStyle?: React.CSSProperties;
  /** A callback that is called by React when the TextBox or TextArea is mounted */
  refInput?: (el: HTMLElement|null) => void;
  
  // Standard HTML attributes
  /** Prevents the user from interacting with the input. */
  disabled?: boolean;
  /** Specifies that the input should have focus when the page loads. */
  autoFocus?: boolean;
  /** The form element that the input element is associated with (its form owner). The value of the 
   *  attribute must be an id of a <form> element in the same document. If this attribute isn't used,
   *  the <input> element is associated with its nearest ancestor <form> element, if any. */
  form?: string;
  /** The position of the element in the tabbing navigation order for the current document. */
  tabIndex?: number;
  /** Specifies that the user must fill in a value before submitting a form. The :optional and 
   *  :required CSS pseudo-classes will be applied to the field as appropriate. */
  required?: boolean;
}

/** Attributes that apply to `<input>` buttons */
export interface ButtonAttributes extends InputAttributesBase {
  type?: "button"|"submit"|"reset"|"file";
}

/** Attributes that apply to all `input` elements except buttons */
export interface InputAttributes<T> extends InputAttributesBase {
  /** Current value associated with the form element. */
  value: HolderGet<T>;
  /** Prevents the user from modifying the value of the input. This does not change 
   *  the widget's appearance; to gray it out, set disabled instead. */
  readOnly?: boolean;
  /** The name of the control, which is submitted with the control's value as part of the form data. */
  name?: string;
  /** CSS styles. */
  style?: React.CSSProperties;
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

/** Properties of a Radio component. Example: `<Radio value={model.fruit} is="apple"/>` */
export type RadioAttributes<T> = (T extends boolean ? {is?: T} : {is: T}) & Omit<InputAttributes<T>,"is">;

/** Properties of a Radio component. Example: `<Radio value={model.fruit} is="apple"/>`.
 *  This is used as a workaround for the mysterious difficulty TypeScript has handling
 *  `RadioAttributes<string>`. You see, `<Radio value={h} is="X"/>` works fine if `h` is a
 *  `Holder<"X"|"Y">`, but if `h` is `Holder<string>`, it says without further explanation
 *  that the props of Radio are "not assignable" to it. The workaround is to mark `is` 
 *  optional, even though it is required when T is not boolean.
 */
export type RadioAttributesWorkaround<T> = {is?: T} & Omit<InputAttributes<T>,"is">;

/** Attributes supported by Slider and its underlying `<input type="range">` element.
 *  Only horizontal sliders are supported in most browsers. */
export interface SliderAttributes extends InputAttributes<number> {
  /** The minimum (numeric or date/datetime) value for this input */
  min: number;
  /** The maximum (numeric or date/datetime) value for this input */
  max: number;
  /** Works with the min and max attributes to limit the increments at which a numeric or 
   *  date-time value can be set. If this attribute is not set to any, the control accepts 
   *  only values at multiples of the step value greater than the minimum. */
  step?: number;
  /** Indicates the kind of text field this is so that the field can be
   *  completed by the browser automatically. */
  autoComplete?: string;
  /** Points to a `<datalist>` which can specify the location of tick 
   *  marks on the slider (not supported by all browsers; may require
   *  styling datalist's display property to make it visible). */
  list?: string;
}

/** Attributes supported by ColorPicker and its underlying `<input type="color">` element. */
export interface ColorPickerAttributes extends InputAttributes<string> {}

interface BaseInterface<T> {}
interface DerivedInterface_<T> extends BaseInterface<T> {
  type?: "text"|"url"|"tel"|"email"|"password"|"number"|"search"|"color"|
         "time"|"date"|"datetime"|"datetime-local"|"month"|"week"|"hidden";
  /* ... other props */
}

export interface TextAttributesBase<T> extends InputAttributes<T> {
  /** A function that parses the input string into the internal format
   *  expected by the model. This function is called on every keypress. 
   *  If an error is returned, the error message is associated with the 
   *  element using the setCustomValidity() method of HTML5 elements.
   */
  parse?: Parse<T>;
  /** A function that converts the current T value to a string for 
   *  display in the TextBox or TextArea. */
  stringify?(t:T): string;
  /** By default, if a parse error occurs, the parse error message will be cleared when the
   *  TextBox/TextArea loses focus, and the invalid text will removed and replaced with 
   *  presumably-valid text produced by `stringify`. This prop prevents this behavior, 
   *  allowing both the text and error message to persist after focus is lost.
   * 
   *  Note: for `<input type="number">`, if the underlying model does not contain a number,
   *  the browser itself will ignore `value` and show whatever text the user typed, even if 
   *  `keepBadText` is false.
   **/
  keepBadText?: boolean;
  /** By default, showing a validation error is deferred until the `TextBox/TextArea` loses
   *  focus, unless the element previously lost focus while containing an error. This option
   *  causes the error to appear as early as possible.
   * 
   *  However, if `keepBadText` is false and a parse error occurs, `TextBox` always behaves as
   *  though `showErrorEarly` is true. This is because the bad text and error message will 
   *  be discarded when the element loses focus, so the user won't see the error at all 
   *  unless it is shown early.
   */
  showErrorEarly?: boolean;
}

type Parse<T> = (this: TextBase<T, TextAttributesBase<T>>, input:string, oldValue: T) => T|Error;

/** TypeScript 3.x can no longer infer T when TextInputAttributes<T> is used. Using this instead. */
export type TextInputAttributesWorkaround<T> = TextInputAttributes_<T> & {parse?: Parse<T>, stringify?: (t:T) => string};

/** Attributes supported by TextBox and its underlying `<input>` element. */
export type TextInputAttributes<T> = TextInputAttributes_<T> & ConvertsToString<T>;
interface TextInputAttributes_<T> extends TextAttributesBase<T> {
  /** Type of textbox this is (this is the subset of HTML input types 
   *  that use a string value.) For certain types, the browser will
   *  validate the value and reject strings that do not conform to
   *  the expected syntax (by setting value to ""), and/or the browser
   *  will provide its own special editing interface. */
  type?: "text"|"url"|"tel"|"email"|"password"|"number"|"search"|"color"|
         "time"|"date"|"datetime"|"datetime-local"|"month"|"week"|"hidden";
  /** Points to a <datalist> of predefined options to suggest to the user. */
  list?: string;
  /** The initial size of the control (measured in character widths.) CSS properties 
   *  may override this. */
  size?: number;
  /** Maximum number of characters (in UTF-16 code units) that the user can enter. */
  maxLength?: number;
  /** indicates the kind of text field this is so that the field can be completed by
   *  the browser automatically, usually by remembering previous values the user has 
   *  entered. Common values: "off", "name", "username", "email", "tel", "address-line1", 
   *  "country-name", "bday", "postal-code", "address-level2" (city), 
   *  "address-level1" (province). */
  autoComplete?: string;
  /** The minimum (numeric or date/datetime) value for this input */
  min?: number|string;
  /** The maximum (numeric or date/datetime) value for this input */
  max?: number|string;
  /** Works with the min and max attributes to limit the increments at which a numeric 
   *  or date-time value can be set. If this attribute is not set to any, the control 
   *  accepts only values at multiples of the step value greater than the minimum. */
  step?: number|"any";
  /** indicates whether the user can enter more than one value, separated by commas.
   *  This attribute only applies when the type attribute is "email". */
  multiple?: boolean; 
  /** A regular expression that the control's value is checked against in HTML5 
   *  browsers. A validation error occurs if the user types something that doesn't
   *  match, so `error.set()` is called if you provided it. */
  pattern?: string;
  /** A hint to the user of what can be entered in the control. The message is shown,
   *  usually in gray, inside a TextBox when it is empty. */
  placeholder?: string;
}

export type ConvertsToString<T> = T extends string ? {} : 
     {parse: Parse<T>} &
       (T extends {toString(): string} ? {} : {stringify(t:T): string});

export interface DateInputAttributes extends TextInputAttributes_<Date|undefined>
{
  utc?: boolean;
}

export interface TimeInputAttributes extends DateInputAttributes
{
  /** Day to associate with the time when the the user inputs a valid time 
   *  and the `value` property was undefined. (default: today's date) */
  day?: Date;
}

/** Attributes of DateTimeBox are the same as DateBox */
export interface DateTimeInputAttributes extends DateInputAttributes {}

/** TypeScript 3.x can no longer infer T when TextAreaAttributes<T> is used. 
 *  The workaround is flawed: it can't require `parse` when T is not a string. */
export type TextAreaAttributesWorkaround<T> = TextAreaAttributes_<T> & { parse?: Parse<T>, stringify?: (t:T) => string };

/** Attributes supported for TextArea and its underlying `<textarea>` element. */
export type TextAreaAttributes<T> = TextAreaAttributes_<T> & ConvertsToString<T>;
interface TextAreaAttributes_<T> extends TextAttributesBase<T> {
  /** The visible width of the text control, in average character widths. 
   *  If it is specified, it must be a positive integer. If it is not 
   *  specified, the default value is 20. You can also set the width
   *  using the CSS `width` style. */
  cols?: number;
  /** The number of visible text lines for the control. */
  rows?: number;
  /** Whether the <textarea> is subject to spell checking by the underlying browser. */
  spellcheck?: boolean|"default";
  /** Text wrapping mode. */
  wrap?: "hard"|"soft"|"off";
};

/** Attributes that apply to `<FileButton>` (`<input type="file">` elements). */
export interface FileButtonAttributes extends ButtonAttributes {
  /** Indicates the types of files that the server accepts as a
   *  comma separated list of MIME types and extensions, e.g. 
   *  ".doc,.docx,.xml,application/msword". This provides a hint 
   *  for browsers to guide users towards selecting the correct 
   *  file types. */
  accept?: string;
  /** Indicates whether the user can select more than one file. */
  multiple?: boolean;
  /** Specifies that the user must fill in a value before submitting a form. The :optional and :required CSS pseudo-classes will be applied to the field as appropriate. */
  required?: boolean;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
//////////////////////////////////////////////////////////////////////////////////////////////
// Some of these just guard against mistakes by not crashing if `value` is missing
function getValue<T>(props: { value: HolderGet<T> }): T {
  return typeof props.value === 'object' ? props.value.get : "(invalid)" as any as T;
}
function isDisabled<T>(props: { disabled?: boolean, value?: HolderGet<T> }): boolean {
  return props.disabled || !(props.value && props.value.set);
}
function trySet<T>(props: { value: HolderGet<T> }, newValue: T): Error|void {
  if (props.value && props.value.set)
    try {
      props.value.set(newValue);
    } catch(e) {
      return e;
    }
}
function getError(p: { error?: any }): string | JSX.Element | undefined {
  return p.error && (p.error.set || p.error.get) ? p.error.get : p.error;
}
function trySetError<T>(props: { error?: string | JSX.Element | HolderGet<string | JSX.Element> }, msg: string) {
  let error = props.error;
  if (error && typeof (error as any).set === 'function')
    (error as HolderGet<string|JSX.Element>).set!(msg);
}
function getEither<A, B, K extends (keyof A & keyof B)>(a: A, b: B, name: K): A[K] | B[K] {
  return a && a[name] !== undefined ? a[name] : b[name];
}

const T = true;
// These lists are used to remove all props that are invalid on underlying HTML elements.
const LabelAttrs = { label:T, labelStyle:T, labelClass:T, labelAfter:T, p:T, 
                     noInputSpan:T, noErrorSpan:T, error:T, errorFirst:T, refInput:T };
const LabelAttrsAndParse = { ...LabelAttrs, parse:T, stringify:T, keepBadText:T, showErrorEarly:T };
const LabelAttrsAndIs = { ...LabelAttrs, is:T };

interface TextBaseState { tempText?: string, hasFocus?: boolean, hadError?: boolean, parseError?: string }

// Base class of TextBox and TextArea. Also used by DateBox and TimeBox.
abstract class TextBase<T extends {}, Props extends TextAttributesBase<T>> 
       extends Component<Props, TextBaseState>
{
  protected abstract chooseTag(p2: any): string;
  
  state: TextBaseState = {}
  inputElement?: HTMLInputElement|HTMLTextAreaElement|null;
  keepBadText()    { return getEither(this.props, options.validation, "keepBadText"); }
  showErrorEarly() { return getEither(this.props, options.validation, "showErrorEarly"); }
  
  render() {
    let props = this.props, state = this.state, el = this.inputElement;
    let inputProps = omit(props, LabelAttrsAndParse) as React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    inputProps.value = state.tempText != null ? state.tempText : this.asStr(getValue(props), props.stringify);
    inputProps.disabled = isDisabled(props);

    this.addHandlers(inputProps);

    let tag = this.chooseTag(inputProps);
    let error = this.getVisibleError();
    if (error)
      inputProps.className = (inputProps.className ? inputProps.className + " " : "") + "user-invalid";
    if (el)
      el.setCustomValidity(typeof error === 'string' ? error : "");

    let type = tag === 'text' ? inputProps.type : tag;
    return composeWithLabel(createElement(tag, inputProps, props.children), type, props, error || "");
  }
  asStr(val: T, stringify?: (t:T) => string) {
    if (stringify)
      return stringify(val);
    return val != null ? val.toString() : "";
  }
  addHandlers(inputProps: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
    inputProps.onBlur = () => { // lost focus
      let change: TextBaseState = { hasFocus: false, hadError: !!this.getError() };
      if (!this.keepBadText())
        change.tempText = undefined, change.parseError = "";
      this.setState(change);
    };
    inputProps.onFocus = () => {
      this.setState({ hasFocus: true });
    };
    inputProps.ref = el => {
      let props = this.props;
      if ((this.inputElement = el) && (this.state.hadError || getError(props)))
        trySetError(props, el.validationMessage);
      if (props.refInput)
        props.refInput(el);
    }
    inputProps.onChange = (e: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
      let props = this.props, el = this.inputElement;
      let value = e.target.value;
      let changed = false;
      let errorMsg: string | undefined;
      if (props.parse) {
        try {
          var result = props.parse.call(this, (e.target as any).value, getValue(props));
          if (!(result instanceof Error))
            result = trySet(props, result) || result;
        } catch(e) {
          result = e;
        }
        
        // Bug fix: in FireFox the user can change an <input type="number"> without giving 
        // it focus. Avoid setting tempText without focus because it blocks external updates.
        if (this.state.hasFocus || result instanceof Error)
          this.setState({ tempText: value });
      } else {
        // If user did not provide a parse function, assume T is string
        result = trySet(props, value as any as T) || value as any as T;
      }
      errorMsg = result instanceof Error ? result.message : undefined;

      // Save the parse error. If there's no parse error, check for HTML5 error instead
      this.setState({ parseError: errorMsg });
      if (!errorMsg && props.error && (props.error as any).set && !el!.checkValidity())
        errorMsg = el!.validationMessage;
      trySetError(props, errorMsg || "");
    };
  }
  getError() {
    /* Sources of truth for error message:
       - Priority 1: props.error
       - Priority 2: state.parseError
       - Priority 3: validation message from browser
    */
    let el = this.inputElement;
    if (el)
      el.setCustomValidity(""); // we only want the browser's built-in message here
    return getError(this.props) || this.state.parseError || el && el.validationMessage;
  }
  getVisibleError() {
    // Avoid bothering the user with an error message until TextBox loses focus.
    let state = this.state;
    if (this.showErrorEarly() || state.hadError || (state.parseError && !this.keepBadText())) {
      return this.getError();
    } else {
      return "";
    }
  }
}

// Render function for a non-text input element with associated <p>, <LabelSpan>, 
// <InputSpan> and/or <ErrorSpan>, if applicable.
function renderInput(p: InputAttributesBase, defaultType: string|undefined, excludeAttrs: object, attributes?: object)
{
  var inputProps = omit(p, excludeAttrs) as React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  if (defaultType)
    inputProps.type || (inputProps.type = defaultType);
  inputProps.disabled = isDisabled(p);
  inputProps.ref = p.refInput;
  assign(inputProps, attributes);
  return composeWithLabel(createElement("input", inputProps, p.children), inputProps.type, p, getError(p));
}

// Combine an element with <p>, <Label>, <InputSpan> and/or <ErrorSpan> depending on its props.
export function composeWithLabel(el: JSX.Element, type: string|undefined, p: LabelProps, error?: string | JSX.Element) {
  return (options.composeElementWithLabel || defaultComposer)(el, type, p, error);
}
function defaultComposer(el: JSX.Element, type: string|undefined, p: LabelProps, error?: string | JSX.Element) {
  let preferLabelAfter = type === "checkbox" || type === "radio";
  let isTextBox = !preferLabelAfter && type !== "range" && type !== "button" && type !== "color";
  let labelAfter = p.labelAfter !== undefined ? p.labelAfter : preferLabelAfter;
  let label = p.label;
  let noInputSpan = p.noInputSpan;
  let oes = options.errorSpan;
  if (!p.noErrorSpan && (error || oes.emitEmptyForText && isTextBox) && (oes.class || oes.style)) {
    if (error == null || typeof error === 'string')
      error = <ErrorSpan>{error}</ErrorSpan>;

    if (labelAfter && label !== undefined) { // Special case: place InputSpan outside Label
      el = <Label labelClass={p.labelClass} labelStyle={p.labelStyle}
                  labelAfter={true} label={label} p={p.p} noInputSpan>
             {el}
           </Label>;
      label = undefined;
    }
    el = p.errorFirst ? <InputSpan>{error}{el}</InputSpan> : <InputSpan>{el}{error}</InputSpan>;
    noInputSpan = true;
  }
  if (label === undefined)
    return p.p ? <p>{el}</p> : el;
  return (
    <Label labelClass={p.labelClass} labelStyle={p.labelStyle}
            labelAfter={labelAfter}
            label={label} p={p.p}
            noInputSpan={noInputSpan}>
      {el}
    </Label>);
}

/** A React version of `<input type="text">` based on `Holder<T>`
    that supports parsing and possibly invalid input. If T is
    not `string` then the `parse` property is required, and if
    T does not have a `toString` method then a `toString` property 
    is required. TextBox allows a `type` property and defaults to
    `type="text"` if no `type` property is provided. Examples:
    
        <TextBox label="Please input a string:" value={stringHolder}/>
        <TextBox label="Integer:" type="number" value={numberHolder} 
                 parse={s => parseInt(s) || new Error("Not an int")}/>
*/
export class TextBox<T> extends TextBase<T, TextInputAttributesWorkaround<T>>
{
  protected chooseTag(p2: any) {
    p2.type || (p2.type = "text");
    return "input";
  }
}

/** A wrapper for `<textarea>` based on `Holder<T>` that supports 
    parsing and possibly invalid input. If T is not `string` then 
    the `parse` property is required. Can have a label.
 */
export class TextArea<T> extends TextBase<T, TextAreaAttributesWorkaround<T>>
{
  protected chooseTag(p2: any) { return "textarea"; } 
}

/** A Date editor based on `<input type="date">`, with `props.value.get`
 *  interpreted in the UTC or local time according to the utc property
 *  (default: local time). Its user interface will vary between browsers.
 *  When the date is modified, the time is left unchanged, so a DateBox
 *  and a TimeBox can be used together to edit a single `Holder<Date>`.
 *  Can have a label.
 * 
 *  Note: Don't use this if you need solid support for Internet Explorer,
 *  because IE requires the user to actually type a Date.
 **/
export function DateBox(props: DateInputAttributes) {
  var p2 = omit(props, { utc:T });
  p2.type || (p2.type = "date");
  p2.placeholder || (p2.placeholder = "YYYY-MM-DD"); // for IE
  p2.parse = (s:string, oldVal:Date|undefined) => parseDate(s, props.utc, oldVal);
  p2.stringify = (d:Date|undefined) => dateToString(d, props.utc) || "";
     // new Date(d.valueOf() + d.getTimezoneOffset() * 60000).toISOString().substr(0,10)
  // return <TextBox<Date|undefined> {...p2}/>; (Avoid unnecessary __assign)
  return createElement(TextBox, p2);
}

/** Combines DateBox and TimeBox into a composite component. Although there
 *  is an HTML element for this purpose (`<input type="datetime-local">`), it
 *  is not supported by FireFox, Safari or Internet Explorer (as of 2020/04).
 */
export function DateTimeBox(props: DateTimeInputAttributes) {
  let p1 = {...props, noInputSpan: true};
  let p2 = omit(props, LabelAttrs);
  p2.noErrorSpan = true;
  return composeWithLabel(
    <InputSpan>
      {createElement(DateBox, p2)}
      {createElement(TimeBox, p2)}
    </InputSpan>,
    'datetime-local', // not really, but maybe it will be someday
    p1, getError(p1));
}

/** Parses a date if it is in the form YYYY-MM-DD or YYYY-MM-DD hh:mm,
 *  as it will be if it was produced by `<input type="date"/>`. If a second Date is
 *  provided, the time from that date is preserved in the return
 *  value; otherwise the time is set to noon UTC so that the date
 *  stays the same in all time zones. */
export function parseDate(s: string, utc?: boolean, time?: Date): Date|undefined {
  if (s && s[4] == '-' && s[7] == '-') {
    var y = parseInt(s.slice(0,4)), 
        m = parseInt(s.slice(5,7)),
        d = parseInt(s.slice(8,10));
    if (y == y || m == m || d == d) {
      var r = time ? new Date(time.valueOf()) : new Date();
      if (!time) r.setUTCHours(12,0,0,0);
      r.setFullYear(y, m-1, d);
      return r;
    }
  }
  return undefined;
}

function twoDigit(n: number) { return ('0' + n).slice(-2); }

/** Gets the date portion of a date object in the form YYYY-MM-DD, or undefined if the Date was undefined */
export function dateToString(d: Date|undefined, utc?: boolean): string|undefined {
  if (!d) return undefined;
  if (utc) return d.toISOString().substr(0,10);
  return d.getFullYear() + '-' + twoDigit(d.getMonth()+1) + '-' + twoDigit(d.getDate());
}

/** A time editor for Date values based on `<input type="time">`, with 
 *  the `props.value.get` interpreted in the UTC or local time zone 
 *  according to the value of the `utc` property (default: local time).
 *  Its user interface will vary between browsers. The date (non-time) 
 *  component is left unchanged, so TimeBox can be used together with 
 *  DateBox to edit a single instance of `Holder<Date>`. If `value.get`
 *  is `undefined`, the value of the `day` property is used as the 
 *  default day when the user selects a time; if `day` is undefined then
 *  the current date is used as the default. Can have a label.
 */
export function TimeBox(props: TimeInputAttributes) {
  var p2 = omit(props, { utc:T }) as any;
  p2.type || (p2.type = "time");
  p2.placeholder || (p2.placeholder = "hh:mm"); // for IE
  p2.parse = (input:string, oldValue: Date|undefined) => 
             parse24hTime(input, oldValue || props.day, props.utc);
  p2.stringify = (d:Date|undefined) => timeTo24hString(d, props.utc);
  // return <TextBox<Date|undefined> {...p2}/>; (Avoid unnecessary __assign)
  return createElement(TextBox as any, p2);
}

/** Gets a 24-hour time string suitable for use in `<input type="time"/>` */
export function timeTo24hString(time: Date|undefined, utc?: boolean) {
  if (!time) return "";
  var [h,m] = utc ? [time.getUTCHours(), time.getUTCMinutes()]
                  : [time.getHours(), time.getMinutes()];
  return time ? twoDigit(h) + ":" + twoDigit(m) : "";
}

/** Parses a 24-hour time string like those produced by `<input type="time"/>` */
export function parse24hTime(value: string|undefined, day?: Date, utc?: boolean): Date|undefined {
  if (value && value[2] === ':') {
    var h = parseInt(value.slice(0,2));
    var m = parseInt(value.slice(3));
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      var clone = day ? new Date(day.valueOf()) : new Date();
      if (utc)
        clone.setUTCHours(h, m, 0, 0);
      else
        clone.setHours(h, m, 0, 0);
      return clone;
    }
  }
  return day;
}

/** Wrapper for `<input type="checkbox">` based on `Holder<boolean>`.
 *  `props.value.get` is the current checkbox value and 
 *  `props.value.set()` is called when the checkbox changes. 
 *  Can have a label. Example: 
 * 
 *      <CheckBox value={booleanHolder} label="My Checkbox"/>
 */
export function CheckBox(props: InputAttributes<boolean>)
{
  return renderInput(props, "checkbox", LabelAttrs, {
    checked: getValue(props),
    onChange: (e: any) => {trySet(props, e.target.checked);}
  });
}

/** Wrapper for `<input type="radio">` based on `Holder<T>`.
 *  Can have a label and/or error. Example: 
 * 
 *      <Radio value={holder} is={true} label="Yes"/>
 *      <Radio value={holder} is={false} label="No"/>
 *      <Radio value={holder} is={null} label="Maybe"/>
 * 
 *  Normally, props.value is a value that indicates which radio button
 *  in a group should be checked, and props.is specifies which value
 *  causes the current Radio to be checked. When a Radio is clicked, 
 *  it calls `props.value.set(props.is)`. An exception to this is if
 *  `props.is === undefined`; in that case the Radio treats props.value 
 *  as a boolean, and it calls `props.value.set(true)` when it is 
 *  checked and `props.value.set(false)` when it is unchecked.
 */
export function Radio<T>(props: RadioAttributesWorkaround<T>)
{
  return renderInput(props, "radio", LabelAttrsAndIs, {
    checked: props.is !== undefined ? getValue(props) == props.is : !!getValue(props),
    onChange: (e: any) => {
      if (e.target.checked)
        trySet(props, props.is !== undefined ? props.is : true as any as T);
      else if (props.is === undefined)
        trySet(props, false as any as T);
    }
  });
}

/** A simple wrapper for `<button>` that can have a label and/or error.
 *  Does not use a Holder. */
export function Button(p: ButtonAttributes)
{
  let p2 = omit(p, LabelAttrs) as any;
  let type = p.type ? "input" : "button";
  return composeWithLabel(createElement(type, p2, p.children), type, p, getError(p));
}

/** Wrapper for `<input type="file">`, the file selector element, that
 *  can have a label and/or error. Does not use a Holder. */
export function FileButton(p: FileButtonAttributes)
{
  return renderInput(p, "file", LabelAttrs);
}

/** Wrapper for `<input type="range">`, the horizontal slider element, 
 *  based on `Holder<T>`. Can have a label. Is an alias for Slider. */
export function Range(p: SliderAttributes) { return Slider(p); }

/** Wrapper for `<input type="range">`, the horizontal slider element,
 *  based on `Holder<T>`. Can have a label and/or error. Example:
 * 
 *      <Slider value={numberHolder} min={-10} max={10} step={1}/>
 **/
export function Slider(p: SliderAttributes)
{
  return renderInput(p, "range", LabelAttrs, {
    value: getValue(p),
    onChange: (e: any) => { trySet(p, parseFloat(e.target.value)); }
  });
}

/** Wrapper for `<input type="color">`, the color picker element,
 *  based on `Holder<T>`. Can have a label and/or error. Example:
 * 
 *      <Slider value={numberHolder} min={-10} max={10} step={1}/>
 **/
export function ColorPicker(p: ColorPickerAttributes)
{
  return renderInput(p, "color", LabelAttrs, {
    value: getValue(p),
    onChange: (e: any) => { trySet(p, e.target.value); }
  });
}

/** Creates a new object that does not have the properties that `names` has */
// The strongly-typed version doesn't work for some reason
//function omit<T, K extends Extract<keyof T,string>>(o: T, names: K[]): Omit<T, K> {
function omit(o: any, props: object): any {
  var r: any = {};
  for (var k in o) {
    if ((props as any)[k] !== undefined)
      continue;
    r[k] = o[k];
  }
  return r;
}

/** Assigns all "own" properties from `obj` to `target`. */
var assign = (Object as any).assign || (
  (target: any, obj: any) => {
    for (var k in obj)
      if (Object.prototype.hasOwnProperty.call(obj, k))
        target[k] = obj[k];
    return target;
  });
