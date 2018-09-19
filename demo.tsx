import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {holdState, holdAllProps, Holder, Holders, TextBox, TextArea, Label, LabelSpan,
        CheckBox, Radio, Button, Slider, TimeBox, DateBox} from './elements';
import { hold } from './hold';

/* @jsx h */
var h = React.createElement;

//////////////////////////////////////////////////////////////////////////
// Demo 1: A form that connects its own state to form controls
//////////////////////////////////////////////////////////////////////////

interface FormState {
  checkbox1: boolean;
  checkbox2: boolean;
  fruit: "apple"|"banana"|"cherry"|undefined;
  happiness: number;
  code: string;
  date?: Date;
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
      code: '.class Foo extends Base {\n  prefix := ""\n  .constructor(@public bar: int) {}\n  .fn toString() => prefix + bar.toString()\n}'
    };
  }
  render() {
    var hs = holdState(this as StatefulForm), date = hs('date');
    var tmp = <TextBox p value={this.state} prop="code"/>;
    return (
      <fieldset>
        <legend>Additional input fields:</legend>
        <CheckBox p value={hs('checkbox1')} label="I am prepared to see various form elements"/>
        { ...(!this.state.checkbox1 ? [] : [
          <Label p label="Date/time (UTC):">
            <DateBox value={date} utc={true}/>
            <TimeBox value={date} utc={true}/>
          </Label>,
          <Label p label="Date/time (local):">
            <DateBox value={date}/>
            <TimeBox value={date}/>
          </Label>,
          <CheckBox p value={hs('checkbox2')} label="Checkbox:" labelAfter={false} />,
          <Label p label="Happiness level:">
            <Slider value={hs('happiness')} min={-10} max={10} step={1}
                    list="ticks" style={ {width:"12em"} }/>
            <TextBox type="number" value={hs('happiness')} style={ {width:"4em"} }
                     parse={s => parseInt(s)}/>
            <datalist id="ticks">
              <option value="-10"/><option value="-5"/>
              <option value="0"/>
              <option value="5"/><option value="10"/>
            </datalist>
          </Label>,
          <Label p label="Select fruit:">
            <Radio value={hs('fruit')} is="apple"  label="Apple "/>
            <Radio value={hs('fruit')} is="banana" label="Banana "/>
            <Radio value={hs('fruit')} is="cherry" label="Cherry "/>
          </Label>,
          <p><LabelSpan/>
            <Button onClick={() => alert(`Your ${this.state.fruit} is coming.`)}>
              Deliver fruit
            </Button>
          </p>,
          <p><a href="http://loyc.net/les">LES</a> <a href="http://loyc.net/2017/lesv3-update.html">v3</a> code<br/>
            <TextArea value={hs('code')} cols={50} rows={5}/>
          </p>
        ]) }
      </fieldset>);
  }
}

//////////////////////////////////////////////////////////////////////////
// Demo 2: Form with separate model (App class connects the two together)
//////////////////////////////////////////////////////////////////////////

// Note: When using holdAllProps(model), unspecified values must be 
//       explicitly set to undefined so the function knows they exist.
class Model {
  name:    string = "";
  age?:    number = undefined;
  date?:   Date = undefined;
  address:  string = "";
  city:     string = "";
  province: string = "";
  country:  string = "";
  postCode: string = "";
  color:   string = "#bbff44";
  married: boolean = false;
}

// A simple form
function PersonForm(m: Holders<Model>) {
  return <form>
    <TextBox p label="Name:"     value={m.name} autoComplete="name"/>
    <TextBox p label="Age:"      value={m.age}  type="number"
             parse={s => parseFloat(s) || new Error("Invalid age")}/>
    <TextBox p label="Address:"  value={m.address}  autoComplete="address-line1"/>
    <TextBox p label="City:"     value={m.city}     autoComplete="address-level1"/>
    <TextBox p label="Province:" value={m.province} autoComplete="address-level1"/>
    <TextBox p label="Country:"  value={m.country}  autoComplete="country-name"/>
    <TextBox p label="Favorite color:" value={m.color} type="color"/>
    <CheckBox p label="Married"  value={m.married}/>
  </form>;
}

// Two possibilities:
// 1. State is normal variables - internal state
// 2. State is holders          - external state

class App extends React.Component<{model:Model}, Holders<Model> & {model:Holder<Model>}>
{
  constructor(props: {model:Model}) {
    super(props);
    
    var onChange = (name: string, newValue: any) => {
      // Set this.state[name] to a clone of itself. The purpose of 
      // doing this is to allow shallow comparisons to detect the 
      // change in state, in case the user is using something like 
      // Pure Components which only update when the state changes.
      var prop = (this.state as any)[name];
      this.setState({ [name]: prop.clone ? prop.clone() : prop } as any);
      // Ask holder to change the underlying model
      return true;
    }
    this.state = {
      model: hold(props, "model", (_, newModel) => {
        // Model was changed via TextArea. Update the model.
        Object.assign(props.model, newModel);
        this.forceUpdate();
      }),
      ... Object.keys(props.model).map(k =>
        ({ k: hold(this.state, k as any, onChange) }))
    } as any;

    // 1. Send holders to PersonForm
    // 2. So we need a group of holders as the state, I guess...
    // 3. But the state should _actually_ be modified
  }
  render() {
    return <div>
      <PersonForm {...this.state}/>
      <p>JSON version (editable)</p>
      <TextArea value={this.state.model} rows={10} cols={50}
                stringify={m => JSON.stringify(m,undefined,"  ")} 
                parse={ (input, oldVal) => ({...oldVal, ...JSON.parse(input)}) }/>
      <StatefulForm/>
    </div>;
  }
}

ReactDOM.render(<App model={new Model()}/>, document.getElementById('app'));
