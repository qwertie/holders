import {createElement, Component, HTMLAttributes, ComponentElement} from "react";
import {Holder} from './hold';
export * from './hold';

/* @jsx h */
var h = createElement;

/** Labeling properties that can be attached to labelable elements such as
 *  Label, TextBox, TextArea, CheckBox, Radio, Button, and Slider. */
export interface LabelProps {
  /** If true, the label element is wrapped in a `<p>` element to add a line break. */
  p?: boolean;
  /** The label text string or element that is placed in a span, just inside the label. */
  label?: React.ReactNode;
  /** The className of the span that holds the label text (the default is labelspan). */
  labelClass?: string;
  /** Styles of the label text (not the label element, but the text inside, which is a span.) */
  labelStyle?: React.CSSProperties;
  /** If true, the label text comes after the (child) element instead of before 
   *  (and the default class/style, if any, is not applied) */
  labelAfter?: boolean;
}

/** Default class and style of LabelSpan (Label's text span) when 
 *  labelClass, labelStyle and labelAfter props are not specified. */
export var DefaultLabelSpan = { class: "labelspan", style: undefined };

/** Wraps elements or components in a `<label>` element (and optional `<p>` element),
 *  for example, `<Label label="Hello"><TextBox value={x}/></Label>` becomes
 *  
 *      <label>
 *        <span style={DefaultLabel.style} class={DefaultLabel.class}>Hello</span>
 *        <TextBox value={x}/>
 *      </label>
 */
export function Label(p: LabelProps & HTMLAttributes<HTMLElement>)
{
  var label = h("label", omit(p, LabelAttrs), 
    ...(p.labelAfter ? [p.children, LabelSpan(p)] : [LabelSpan(p), p.children]));
  return p.p ? <p>{label}</p> : label;
}

/** Subcomponent for the `<span>` of label text within a Label. */
export function LabelSpan(p: LabelProps)
{
  var auto = !(p.labelStyle || p.labelClass || p.labelAfter);
  return <span className={auto ? DefaultLabelSpan.class : p.labelClass} 
                   style={auto ? DefaultLabelSpan.style : p.labelStyle}>{p.label}</span>;
}

function LabelOrP(p: LabelProps & React.HTMLAttributes<HTMLElement>)
{
  return p.p && p.label === undefined ? <p>{p.children}</p> : Label(p);
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
  /** Prevents the user from interacting with the input. */
  disabled?: boolean;
  /** Specifies that the input should have focus when the page loads. */
  autoFocus?: boolean;
  /** The form element that the input element is associated with (its form owner). The value of the attribute must be an id of a <form> element in the same document. If this attribute isn't used, the <input> element is associated with its nearest ancestor <form> element, if any. */
  form?: string;
  /** The position of the element in the tabbing navigation order for the current document. */
  tabIndex?: number;
  /** Specifies that the user must fill in a value before submitting a form. The :optional and :required CSS pseudo-classes will be applied to the field as appropriate. */
  required?: boolean;
}

/** Attributes that apply to `<input>` buttons */
export interface ButtonAttributes extends InputAttributesBase {
  type?: "button"|"submit"|"reset"|"file";
}

export interface ModelRef<T, Prop="value"> {
  /** An object that contains a value used in an editable component. This
   *  can either be a `Holder<T>` or an observable model from MobX. */
  value: Holder<T, Prop>;
  /** Name of a property to read within the model (the default is "value",
   *  which is the property that holds the value of a `Holder<T>`) */
  prop?: Prop;
}

/** Attributes that apply to all `input` elements except buttons */
export interface InputAttributes<T=string, Prop="value"> extends ModelRef<T, Prop>, InputAttributesBase {
  /** Prevents the user from modifying the value of the input (without changing the widget's appearance) */
  readOnly?: boolean;
  /** The name of the control, which is submitted with the control's value as part of the form data. */
  name?: string;
  /** CSS styles. */
  style?: React.CSSProperties;
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

/** Properties of a Radio component. Example: `<Radio value={model.fruit} is="apple"/>` */
export type RadioAttributes<T=string, Prop="value"> = 
    (T extends boolean ? {is?: T} : {is: T}) & Omit<InputAttributes<T, Prop>,"is">;

/** Attributes supported by Slider and its underlying `<input type="range">` element.
 *  Only horizontal sliders are supported in most browsers. */
export interface SliderAttributes<Prop="value"> extends InputAttributes<number, Prop> {
  /** The minimum (numeric or date/datetime) value for this input */
  min: number;
  /** The maximum (numeric or date/datetime) value for this input */
  max: number;
  /** Works with the min and max attributes to limit the increments at which a numeric or date-time value can be set. If this attribute is not set to any, the control accepts only values at multiples of the step value greater than the minimum. */
  step?: number;
  /** Indicates the kind of text field this is so that the field can be
   *  completed by the browser automatically. */
  autoComplete?: string;
  /** Points to a `<datalist>` which can specify the location of tick 
   *  marks on the slider (not supported by all browsers; may require
   *  styling datalist's display property to make it visible). */
  list?: string;
}

export type ConvertsToString<T=string> = T extends string ? {} : 
     {parse: Parse<T>} &
       (T extends {toString(): string} ? {} : {stringify(t:T): string});

type Parse<T> = (input:string, oldValue: T) => T|Error;

export interface TextAttributesBase<T=string,Prop="value"> extends InputAttributes<T,Prop> {
  /** A function that parses the input string into the internal format
   *  expected by the model. This function is called on every keypress. 
   *  If an error is returned, the error message is associated with the 
   *  element using the setCustomValidity() method of HTML5 elements.
   */
  parse?: Parse<T>;
  /** A function that converts the current T value to a string for 
   *  display in the TextBox or TextArea. */
  stringify?(t:T): string;
}

/** Attributes supported by TextBox and its underlying `<input>` element. */
export type TextInputAttributes<T=string,Prop="value"> = TextInputAttributes_<T,Prop> & ConvertsToString<T>;
interface TextInputAttributes_<T=string,Prop="value"> extends TextAttributesBase<T,Prop> {
  /** Type of textbox this is (this is the subset of HTML input types 
   *  that use a string value.) For certain types, the browser will
   *  validate the value and reject strings that do not conform to
   *  the expected syntax (by setting value to ""), and/or the browser
   *  will provide its own special editing interface. */
  type?: "text"|"url"|"tel"|"email"|"password"|"number"|"search"|"color"|
         "time"|"date"|"datetime"|"datetime-local"|"month"|"week"|"hidden";
  /** Points to a <datalist> of predefined options to suggest to the user. */
  list?: string;
  /** The initial size of the control (measured in character widths.) */
  size?: number;
  /** Maximum number of characters (in UTF-16 code units) that the user can enter. */
  maxLength?: number;
  /** indicates the kind of text field this is so that the field can be
   *  completed by the browser automatically, usually by remembering 
   *  previous values the user has entered. Common values: "off", "name",
   *  "username", "email", "tel", "address-line1", "country-name", "bday",
   *  "postal-code", "address-level2" (city), "address-level1" (province). */
  autoComplete?: string;
  /** The minimum (numeric or date/datetime) value for this input */
  min?: number|string;
  /** The maximum (numeric or date/datetime) value for this input */
  max?: number|string;
  /** Works with the min and max attributes to limit the increments at which a numeric or date-time value can be set. If this attribute is not set to any, the control accepts only values at multiples of the step value greater than the minimum. */
  step?: number|"any";
  /** indicates whether the user can enter more than one value. This attribute only applies when the type attribute is "email". */
  multiple?: boolean; 
  /** A regular expression that the control's value is checked against in HTML5 browsers. */
  pattern?: string;
  /** A hint to the user of what can be entered in the control */
  placeholder?: string; 
}

export interface DateInputAttributes<Prop="value"> extends TextInputAttributes_<Date|undefined,Prop>
{
  utc?: boolean;
}

export interface TimeInputAttributes<Prop="value"> extends DateInputAttributes<Prop>
{
  /** Day to associate with the time when the the user inputs a valid time 
   *  and the `value` property was undefined. (default: today's date) */
  day?: Date;
}

/** Attributes supported for TextArea and its underlying `<textarea>` element. */
export type TextAreaAttributes<T=string,Prop="value"> = TextAreaAttributes_<T,Prop> & ConvertsToString<T>;
interface TextAreaAttributes_<T=string,Prop="value"> extends TextAttributesBase<T,Prop> {
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

const LabelAttrs = ['label', 'labelStyle', 'labelClass', 'labelAfter', 'p'];
const LabelAttrsAndParse = LabelAttrs.concat('parse', 'stringify');
const LabelAttrsAndIs = LabelAttrs.concat('is');

function get<T>(p: ModelRef<T,any>)
{
  return (p as any)[p.prop || "value"] as T;
}
function set<T>(p: ModelRef<T,any>, val: T)
{
  return (p as any)[p.prop || "value"] = val;
}

// Base class of TextBox and TextArea
abstract class TextBase<Props extends TextAttributesBase<T,Prop>, T, Prop="value"> 
       extends Component<Props, {tempText?:string}>
{
  protected abstract chooseType(p2: any): string;
  state = {} as {tempText?:string};
  render()
  {
    var p = this.props;
    var p2 = omit(p, LabelAttrsAndParse) as any;
    p2.value = this.state.tempText != null ? this.state.tempText : asStr(get(p), p.stringify);
    p2.onBlur = (e: any) => { // lost focus
      this.setState({ tempText: undefined });
    };
    p2.onChange = (e: any) => {
      var value: string = e.target.value;
      if (p.parse) {
        this.setState({ tempText: value });
        try {
          var result = p.parse((e.target as any).value, get(p));
        } catch(e) {
          result = e;
        }
        var scv = e.target.setCustomValidity;
        if (result instanceof Error) {
          if (scv)
            scv.call(e.target, result.message);
        } else {
          set(p, result);
          if (scv)
            scv.call(e.target, ""); // no error
        }
      } else {
        // If user did not provide a parse function, assume T is string
        set(p, value as any as T);
      }
    };
    p2.onBlur = (e: any) => { // lost focus
      this.setState({ tempText: undefined });
    };
    var tag = this.chooseType(p2);
    return maybeWrapInLabel(p, h(tag, p2, p.children));

    function asStr(val: T, stringify?: (t:T) => string) {
      if (stringify)
        return stringify(val);
      else
        return val != null ? val.toString() : "";
    }
  }
}

function renderInput(p: any, defaultType: string|undefined, excludeAttrs: string[], preferLabelAfter: boolean, attributes?: object)
{
  var p2 = omit(p, excludeAttrs) as any;
  if (defaultType)
    p2.type || (p2.type = defaultType);
  assign(p2, attributes);
  return maybeWrapInLabel(p, h("input", p2, p.children), preferLabelAfter)
}

function maybeWrapInLabel(p: LabelProps, el: JSX.Element, preferAfter?: boolean)
{
  return p.label === undefined && !p.p ? el :
    <LabelOrP labelClass={p.labelClass}
              labelStyle={p.labelStyle}
              labelAfter={p.labelAfter !== undefined ? p.labelAfter : preferAfter}
              label={p.label} p={p.p}>{el}</LabelOrP>;
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
export class TextBox<T=string,Prop="value"> extends TextBase<TextInputAttributes<T, Prop>, T, Prop>
{
  protected chooseType(p2: any) {
    p2.type || (p2.type = "text");
    return "input";
  }
}

/** A wrapper for `<textarea>` based on `Holder<T>` that supports 
    parsing and possibly invalid input. If T is not `string` then 
    the `parse` property is required. Can have a label.
 */
export class TextArea<T=string,Prop="value"> extends TextBase<TextAreaAttributes<T, Prop>, T, Prop>
{
  protected chooseType(p2: any) { return "textarea"; } 
}

/** A Date editor based on `<input type="date">`, with `props.value.get`
 *  interpreted in the UTC or local time according to the utc property
 *  (default: local time). Its user interface will vary between browsers.
 *  When the date is modified, the time is left unchanged, so a DateBox
 *  and a TimeBox can be used together to edit a single `Holder<Date>`.
 *  Can have a label.
 **/
export function DateBox<Prop="value">(props: DateInputAttributes<Prop>) {
/*  The type system seems broken in TypeScript v2.9 in case you combine
    union types with conditional types. The following test case demos the
    issue, but it seems fixed in the Playground (v3.1?). 
    Workaround: use `any`. Example:

    type Parser<T> = ((input:string) => T|Error);
    function parse<T>(s: string, p: T extends string ? 
                      Parser<T> | undefined : Parser<T>): T
    {
      return p ? p(s) : s as any;
    }
    console.log(parse('123', s => parseInt(s)));
    console.log(parse<number|undefined>('abc', 
                s => (parseInt(s) ? parseInt(s) : undefined))); // ERROR

    Argument of type '(s: string) => number | undefined' is not assignable to parameter of type '((input: string) => Error | undefined) | ((input: string) => number | Error)'.
      ... Type 'undefined' is not assignable to type 'number | Error'.
*/
  var p2 = omit(props, ['utc']) as any;
  p2.type || (p2.type = "date");
  p2.parse = (s:string, oldVal:Date|undefined) => parseDate(s, props.utc, oldVal);
  p2.stringify = (d:Date|undefined) => dateToString(d, props.utc) || "";
     // new Date(d.valueOf() + d.getTimezoneOffset() * 60000).toISOString().substr(0,10)
  // return <TextBox<Date|undefined> {...p2}/>; (Avoid unnecessary __assign)
  return h(TextBox as any, p2);
}

/** Parses a date if it is in the form YYYY-MM-DD, as it will be
 *  if it was produced by `<input type="date"/>`. If a second Date is
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
export function TimeBox<Prop="value">(props: TimeInputAttributes<Prop>) {
  var p2 = omit(props, ['utc']) as any;
  p2.type || (p2.type = "time");
  p2.parse = (input:string, oldValue: Date|undefined) => 
             parse24hTime(input, oldValue || props.day, props.utc);
  p2.stringify = (d:Date|undefined) => timeTo24hString(d, props.utc);
  // return <TextBox<Date|undefined> {...p2}/>; (Avoid unnecessary __assign)
  return h(TextBox as any, p2);
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
  return undefined;
}

/** Wrapper for `<input type="checkbox">` based on `Holder<boolean>`.
 *  `props.value.get` is the current checkbox value and 
 *  `props.value.set()` is called when the checkbox changes. 
 *  Can have a label. Example: 
 * 
 *      <CheckBox value={booleanHolder} label="My Checkbox"/>
 */
export function CheckBox<Prop="value">(props: InputAttributes<boolean, Prop>)
{
  return renderInput(props, "checkbox", LabelAttrs, true, {
    checked: get(props),
    onChange: (e: any) => {set(props, e.target.checked);}
  });
}

/** Wrapper for `<input type="radio">` based on `Holder<T>`.
 *  Can have a label. Example: 
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
export function Radio<T,Prop="value">(props: RadioAttributes<T,Prop>)
{
  return renderInput(props, "radio", LabelAttrsAndIs, true, {
    checked: props.is !== undefined ? get(props) == props.is : !!get(props),
    onChange: (e: any) => {
      if (e.target.checked)
        set(props, props.is !== undefined ? props.is : true as any as T);
      else if (props.is === undefined)
        set(props, false as any as T);
    }
  });
}

/** Attributes that apply to `<input type="file">` elements. */
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

/** A simple wrapper for `<button>` that can have a label. 
 *  Does not use a Holder. */
export function Button(p: ButtonAttributes)
{
  var p2 = omit(p, LabelAttrs) as any;
  return maybeWrapInLabel(p, h(p.type ? "input" : "button", p2, p.children), false);
}

/** Wrapper for `<input type="file">`, the file selector element, that
 *  can have a label. Does not use a Holder. */
export function FileButton(p: FileButtonAttributes)
{
  return renderInput(p, "file", LabelAttrs, false);
}

/** Wrapper for `<input type="range">`, the horizontal slider element, 
 *  based on `Holder<T>`. Can have a label. Is an alias for Slider. */
export function Range<Prop="value">(p: SliderAttributes<Prop>) { return Slider(p); }

/** Wrapper for `<input type="range">`, the horizontal slider element,
 *  based on `Holder<T>`. Can have a label. Example:
 * 
 *      <Slider value={numberHolder} min={-10} max={10} step={1}/>
 **/
export function Slider<Prop="value">(p: SliderAttributes<Prop>)
{
  return renderInput(p, "range", LabelAttrs, false, {
    value: get(p),
    onChange: (e: any) => { set(p, parseFloat(e.target.value)); }
  });
}

/** Creates a new object that does not have the specified properties */
// The strongly-typed version doesn't work for some reason
//function omit<T, K extends keyof T>(o: T, names: K[]): Omit<T, K> {
function omit(o: any, names: string[]): any {
  var r: any = {};
  for (var k in o) {
    if (names.indexOf(k) >= 0)
      continue;
    r[k] = o[k];
  }
  return r;
}

/** Assigns all "own" properties from `obj` to `target`. */
const assign = (Object as any).assign || (
  (target: any, obj: any) => {
    for (var k in obj)
      if (Object.prototype.hasOwnProperty.call(obj, k))
        target[k] = obj[k];
    return target;
  });
