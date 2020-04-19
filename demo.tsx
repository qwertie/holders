import * as React from 'react';
import * as ReactDOM from 'react-dom';

// *** When using the npm package, import 'holders' or 'holders/elements' instead! ***
import {holdValue, holdProp, holdState, holdProps, holdAllProps, Holder, Holders,
        TextBox, TextArea, ColorPicker, Label, LabelSpan, InputSpan, CheckBox,
        Radio, Button, Slider, DateBox, DateTimeBox, options} from './elements';

/* @jsx h */
var h = React.createElement;
var createElement = React.createElement; // the code hasn't changed, but now TypeScript is calling createElement
var useState = React.useState;

//////////////////////////////////////////////////////////////////////////
// Demo 1: Form with separate model (App class connects the two together)
//////////////////////////////////////////////////////////////////////////

// Note: When using holdAllProps(model), unspecified values must be 
//       explicitly set to undefined so the function knows they exist.
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
  return <form>
    <TextBox p label="Name:"  required value={m.name} autoComplete="name" placeholder="First Last"/>
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

//////////////////////////////////////////////////////////////////////////
// Demo 2: A form that connects its own state to form controls
//////////////////////////////////////////////////////////////////////////

interface FormState {
  checkbox1: boolean;
  checkbox2: boolean;
  fruit?: string;
  happiness: number;
  code: string;
  date?: Date;
  ready?: boolean;
}

class StatefulForm extends React.Component<{}, FormState>
{
  constructor(props: {}) {
    super(props);
    this.state = {
      checkbox1: false,
      checkbox2: true,
      fruit: undefined,
      happiness: 1,
      date: undefined,
      code: '.class Foo extends Base {\n  prefix := ""\n  constructor(@public bar: int) => {}\n  toString() => prefix + bar.toString()\n}',
    };
  }
  render() {
    var hs = holdState(this), date = hs('date');
    return (<form>
      <fieldset>
        <legend>Additional input fields:</legend>
        <CheckBox value={hs('checkbox1')} label="I am prepared to see various form elements"/>
        { !this.state.checkbox1 ? undefined : <div>
          <DateTimeBox p label="Date/time (UTC):" value={date} utc={true}/>
          <DateTimeBox p label="Date/time (local):" value={date}/>
          <CheckBox p value={hs('checkbox2')} label="Checkbox:" labelAfter={false} />
          <Label p label="Happiness level:">
            <Slider value={hs('happiness')} min={-10} max={10} step={1}
                    list="ticks" style={ {width:"12em"} }/>
            <TextBox type="number" value={hs('happiness')} style={ {minWidth:"4em", width:"4em"} }
                     parse={s => parseInt(s)}/>
            <datalist id="ticks">
              <option value="-10"/><option value="-5"/>
              <option value="0"/>
              <option value="5"/><option value="10"/>
            </datalist>
          </Label>
          <p>
            <LabelSpan label="Select fruit:"/>
            <InputSpan>
              <Radio value={hs('fruit')} is="apple"  label="Apple "/>{" "}
              <Radio value={hs('fruit')} is="banana" label="Banana "/>{" "}
              <Radio value={hs('fruit')} is="cherry" label="Cherry "/>
            </InputSpan>
          </p>
          <TextBox p label="Selected fruit:" value={hs("fruit")}/>
          <p>
            <Label label={<CheckBox label="Ready to order" value={hs("ready")}/>}>
              <Button onClick={e => this.deliverClicked(e)} style={{maxWidth:200}}>Deliver fruit</Button>
            </Label>
          </p>
          <p>
            <LabelSpan><a href="http://loyc.net/les">LES</a> <a href="http://loyc.net/2017/lesv3-update.html">v3</a> code<br/></LabelSpan>
            <TextArea<string> value={hs('code')} cols={50} rows={5}/>
          </p>
        </div>}
      </fieldset>
    </form>);
  }
  deliverClicked(e: React.MouseEvent) {
    e.preventDefault(); // prevent form submit
    let fruit = this.state.fruit;
    this.setState({ ready: !!fruit });
    setTimeout(() => alert(fruit ? `Your ${fruit} is coming.` : "Pick a fruit first."));
  }
}

//////////////////////////////////////////////////////////////////////////
// Top-level App
//////////////////////////////////////////////////////////////////////////

class App extends React.Component<{model:Model}, Holders<Model> & {model:Holder<Model>}>
{
  constructor(props: {model:Model}) {
    super(props);
    var h: Holders<Model> = 
      holdAllProps(props.model, () => { this.forceUpdate(); });
    this.state = {
      ...h, 
      model: holdProp(props, "model", function(newModel) {
        // Model was changed via TextArea. Update the model.
        Object.assign(props.model, newModel);
        this.forceUpdate();
        return props.model; // prevent the Holder from assigning a read-only prop
      }, true, this)
    };
  }
  render() {
    return <div>
      <PersonForm {...this.state}/>
      <TextArea label="JSON version (editable)"
                value={this.state.model} rows={11} cols={40}
                stringify={m => JSON.stringify(m,undefined,"  ")} 
                parse={ (input, oldVal) => ({...oldVal, ...JSON.parse(input)}) }/>
      <StatefulForm/>
    </div>;
  }
}

ReactDOM.render(<App model={new Model()}/>, document.getElementById('app'));
