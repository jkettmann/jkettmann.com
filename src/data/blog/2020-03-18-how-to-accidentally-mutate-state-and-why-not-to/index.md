---
category: 'blog'
title: How to accidentally mutate state. And why not to
slug: how-to-accidentally-mutate-state-and-why-not-to
date: 2020-03-18
published: true
---

When you learn about React and state you will often read this: "Don't mutate the state". This means you shouldn't change an object or array directly without creating a new object/array.

Interestingly, when people request code reviews online one of the most common mistakes is exactly this: Direct changes of the state.

How come? Most beginner developers are not aware that they are mutating the state. That's why you can find a list of ways to accidentally mutate state directly here. You will see later why this may cause a lot of headache in the long run.

### Mutating the state object

Most developers are aware that they shouldn't mutate the state object directly. So you don't see the following that often anymore.

    class ColorBox extends Component {
      state = {
        color: 'green',
        size: 20,
      }

      handleClick = () => {
        const newState = this.state;
        newState.color = 'red';
        this.setState(newState);
      }

      ...
    }


Since objects are assigned by reference in JavaScript `newState` and `this.state` are references to the same object. The comparison `newState === this.state` returns `true`.

Setting `newState.color` to `red` thus also changes `state.color` before `setState` has been called.

### Nested objects

Much more common are direct state changes when nested state objects are used. Let's assume the above state grows and we want to nest the color and size in a config object.

    class ColorBox extends Component {
      state = {
        config: {
          color: 'green',
          size: 20,
        },
      }

      handleClick = () => {
        const newState = { ...this.state };
        newState.config.color = 'red';
        this.setState(newState);
      }

      ...
    }


Here we learned our first lesson: we copy the old state into a new state object using the spread operator. Now the comparison `newState === this.state` returns `false`.

But unfortunately, the comparison `newState.config === this.state.config` returns `true`. The nested config objects are still pointing to the same reference. So when setting `newState.config.color` to `red` we also change `this.state.config.color`.

### Arrays

Another way to accidentally mutate the state directly is when you use arrays. You need to be aware of which array functions are mutating and which are not. The popular `push` and `splice` functions, for example, are mutating. `concat`, `slice`, and `map` are not. This code is thus changing the state directly.

    const newState = { ...this.state };
    newState.options.push({ value: 'some-value' });
    this.setState(newState);


### Hold on, we're in 2020! What about functional components?

Changing the state without creating a new object won't work for functional components. This code simply won't trigger a re-render. `useState` expects a new object.

    function ColorBox() {
      const [state, setState] = useState({
        color: 'green',
        size: 20,
      });

      const onClick = () => {
        setState((previousState) => {
          const newState = previousState;
          newState.color = 'red';
          return newState;
        });
      };

      ...
    }


But with nested objects and hooks we can still manipulate the state directly. Here's the second example as a functional component.

    function ColorBox() {
      const [state, setState] = useState({
        config: {
          color: 'green',
          size: 20,
        },
      });

      const onClick = () => {
        setState((previousState) => {
          const newState = { ...previousState };
          newState.config.color = 'red';
          return newState;
        });
      };

      ...
    }


### But this code works! Why should I care?

Okay, I have to admit this code works. Otherwise nobody would use state this way, right? So what's wrong about it? Let's see an example.

We want to create a checkbox group component. We have different options for the user to select and want to show one checkbox for each option.

    class Checkbox extends Component {
      render() {
        const { name, option, onChange } = this.props;
        return (
          <label>
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={!!option.checked}
              onChange={onChange}
            />
            {option.text}
          </label>
        );
      }
    }

    class CheckboxGroup extends Component {
      state = {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' },
          { value: '3', text: 'Option 3' },
        ],
      }

      handleChange = (event) => {
        const newState = { ...this.state };
        const option = newState.options.find(option => option.value === event.target.value);
        option.checked = !option.checked;
        this.setState(newState);
      }

      render() {
        return (
          <div>
            {
              this.state.options.map((option) => (
                <Checkbox
                  key={option.value}
                  name="my-checkbox-group"
                  option={option}
                  onChange={this.handleChange}
                />
              ))
            }
          </div>
        );
      }
    }


Especially interesting here is the `handleChange` function. It toggles the option's checked value when a user clicks it.

But even though we create a copy of the state each `option` inside `newState` still points to the same object as in `this.state`.

Let's assume that our application is growing and we desperately need to improve its performance. What's a common way to improve performance? Right, using pure components. So what happens when we change `Checkbox` to a pure component?

    class Checkbox extends PureComponent {
      ...
    }


Oops, it doesn't work anymore! Why is that?

Each `Checkbox` gets an `option` prop which is taken from the `CheckboxGroup` state. Since we have a pure component now React will only re-render a checkbox when one of its props changed.

`key`, `name`, and `onChange` don't change between renders. But the options do when we call `handleChange`, don't they?

Since we set `option.checked` we don't create a new option object but rather change one of its attributes directly. So the `===` comparison between the old option and the updated one returns `true`. The pure component doesn't re-render.

This is how the broken functional component would look like. Instead of a `PureComponent` we used `React.memo` here.

    const Checkbox = React.memo(function({ name, option, onChange }) {
      return (
        <label>
          <input
            type="checkbox"
            name={name}
            value={option.value}
            checked={!!option.checked}
            onChange={onChange}
          />
          {option.text}
        </label>
      );
    }

    function CheckboxGroup() {
      const [state, setState] = useState({
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' },
          { value: '3', text: 'Option 3' },
        ],
      });

      const handleChange = useCallback((event) => {
        const selectedValue = event.target.value;

        setState((previousState) => {
          const newState = { ...previousState };
          const option = newState.options.find(option => option.value === selectedValue);
          option.checked = !option.checked;
          return newState;
        });
      }, []);

      return (
        <div>
          {
            state.options.map((option) => (
              <Checkbox
                key={option.value}
                name="my-checkbox-group"
                option={option}
                onChange={handleChange}
              />
            ))
          }
        </div>
      );
    }


### How can we improve the code?

The first impulse might be to refactor `handleChange` a bit. We can create a new options array with a new checked option inside.

    const handleChange = useCallback((event) => {
        const selectedValue = event.target.value;

      setState((previousState) => {
        const selectedIndex = previousState.options.findIndex(option => option.value === selectedValue)
        const { options } = previousState;
        return {
          ...previousState,
          options: [
            ...options.slice(0, selectedIndex),
            {
              ...options[selectedIndex],
              checked: !options[selectedIndex].checked,
            },
            ...options.slice(selectedIndex + 1),
          ],
        };
      });
    });


Ahem, this looks terrible!

We could use a library like [immutability-helper](https://github.com/kolodny/immutability-helper) or [Immer](https://github.com/immerjs/immer).

In most cases a refactoring is much more beneficial though. Using flat and separated state will help us in a lot of situations.

How does that look like for our example? First we have one state that only holds the options. We wouldn't even need a state for this and could simply use constant, but let's leave like before.

The checked values can be extracted into a separate state. For simple access we use an object as a map. We will save the option values as keys and the checked state as value.

    function CheckboxGroup() {
      const [options, setOptions] = useState([
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3' },
      ]);
      const [checkedValues, setCheckedValues] = useState({});

      const handleChange = useCallback((event) => {
        const checkedValue = event.target.value;

        setCheckedValues((previousState) => ({
          ...previousState,
          [checkedValue]: !previousState[checkedValue],
        }));
      }, []);

      return (
        <div>
          {
            options.map((option) => (
              <Checkbox
                key={option.value}
                name="my-checkbox-group"
                option={option}
                selected={!!checkedValues[option.value]}
                onChange={handleChange}
              />
            ))
          }
        </div>
      );
    }


Look at this. That's so much simpler!

### Wrapping it up

Don't mutate state directly! It's recommended against by the React team and might introduce problems in the future.

But more importantly: You might need to use performance optimizations at some point. Direcly changing state can lead to very ugly bugs that can take hours to solve.

You can find the complete code [here on codesandbox.io](https://codesandbox.io/s/github/jkettmann/how-to-mutate-state-accidentaly-and-why-not-to).

import Newsletter from 'components/Newsletter'

<Newsletter formId="1499362:x4g7a4"/>