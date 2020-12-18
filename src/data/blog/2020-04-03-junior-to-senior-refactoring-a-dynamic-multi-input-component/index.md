---
category: 'blog'
title: Junior to Senior - Refactoring a dynamic multi-input component
slug: junior-to-senior-refactoring-a-dynamic-multi-input-component
date: 2020-04-03
tags: ["Junior to Senior", "Refactoring", "Inside a dev's mind"]
selfQualifierTags: ["pro-skills"]
selfQualifierSort: 60
published: true
---

> This post is part of a series about [refactoring React components](https://jkettmann.com/tag/refactoring/)

Building forms in React can be difficult. Especially, when you need to add inputs dynamically. So it's no wonder when inexperienced developers create a mess, the famous spaghetti code.

In this blog post, we refactor a dynamic multi-input component. The author asked why their code was not working. In the process of analyzing the issue, I found multiple flaws that you can commonly see in the code of inexperienced React developers.

Watching a professional dev doing their work can be a great learning experience. I know that it helped me a lot at the beginning of my career. So I'll walk you through this refactoring step by step while explaining the problems we uncover.

We'll see (among others) how mutating a state accidentally can cause interesting problems, how not to `useEffect` and how to separate responsibilities between components.

If you like you can follow along. You can use this [codesandbox](https://codesandbox.io/s/list-of-state-changers-issue-ebg16?fontsize=14&amp;hidenavigation=1&amp;theme=dark) as a starting point.

## The components

We are investigating a dynamic multi-input component. It renders a list of inputs and a button that adds inputs to that list. Here is how it looks like.

![1-broken-input-1](/content/images/2020/04/1-broken-input-1.png)

The inputs seem to work fine, you can enter a number and it's shown inside the input. But the output below the input fields doesn't reflect these values. So clearly something is wrong.

Let's have a look at the code first. Here is the `App` component:

    function App() {
      const [counters, setCounters] = useState([]);

      return (
        <div style={{ width: 500, padding: 50 }}>
          <div style={{ marginBottom: 50, display: 'flex', flexDirection: 'column' }}>
            <MultiCounterInput
              counters={counters}
              setCounters={setCounters}
            />
          </div>

          <div>
            {
              counters.map((counter) => (
                <div key={counter.name}>
                  {counter.name}: {counter.count}
                </div>
              ))
            }
          </div>
        </div>
      );
    }


The App component is responsible for rendering the multi-input as well as rendering its values. The values are stored in an array of objects inside the state. Each object contains a `name` and a `count` property.

The `MultiCounterInput` looks as follows.

    function MultiCounterInput({ counters, setCounters }) {
      return (
        <>
          <button
            onClick={() => setCounters([...counters, { name: `Counter ${counters.length + 1}`, count: 0 }])}
          >
            Add Counter
          </button>

          {counters.map((count, index) => (
            <CounterInput
              key={index}
              index={index}
              count={count}
              setCounters={setCounters}
              counters={counters}
            />
          ))}
        </>
      );
    }


The MultiCounterInput renders a button at the top. When it's clicked the `setCounters` function coming from the App component is used to add another counter object to the state.

Below the button, a list of `CounterInput` components is rendered. This component looks like follows.

    function CounterInput({ count, index, counters, setCounters }) {
      const [localCount, setLocalCount] = useState();
      const firstRender = useRef(true);

      useEffect(() => {
        if (!firstRender) {
          setCounters([
            ...counters.splice(index, 1, { ...count, count: localCount })
          ]);
        } else {
          firstRender.current = false;
        }
      }, [localCount]);

      return (
        <input
          onChange={event => setLocalCount(event.target.value)}
          type="number"
        />
      );
    };


Okay, this looks a bit messy at first glance already. We have a state `localCount` that is used in the `useEffect` and updated when changing the input value.

The `useEffect` seems to run on every change of `localCount` except for the first render. That's what the `useRef` is used for. `firstRender` is probably a `ref` and not a `state` so that we don't trigger another render when updating it.

The effect updates the counters array when the `localCount` changes by calling the App component's `setCounters` function. It's not immediately clear what `counters.splice` is doing, but we can assume that it's supposed to update the value of a specific input inside the App's state.

## The problems

First of all, we seem to have a problem with the connection of the inputs to the App component's state. That was clear when we tested the app. Here is the screenshot again as a reminder.

![1-broken-input-1](/content/images/2020/04/1-broken-input-1.png)

We would expect to see "Counter 2: 3" instead of "Counter 2: 0".

Additionally, we already saw that the `CounterInput` component looks messy. Here is a list of things that don't seem right. Find the component one more time so you can follow it easier.

1. The `<input />` doesn't have a value prop.
2. The `localCount` state is not initialized.
3. Using splice on an array mutates it. Since `counters` is the state of the App component this is not good.
4. `useEffect` is basically used as a callback when `localCount` is updated.
5. The `localCount` state is a duplicate of the value in the `counters` state inside App.
6. The responsibilities of the components are not clearly separated. The CounterInput only renders one value but updates the complete list of counters.

    function CounterInput({ count, index, counters, setCounters }) {
      const [localCount, setLocalCount] = useState();
      const firstRender = useRef(true);

      useEffect(() => {
        if (!firstRender) {
          setCounters([
            ...counters.splice(index, 1, { ...count, count: localCount })
          ]);
        } else {
          firstRender.current = false;
        }
      }, [localCount]);

      return (
        <input
          onChange={event => setLocalCount(event.target.value)}
          type="number"
        />
      );
    };


Wow, that's a long list for such a small component. Let's try to tackle them one by one.

## 1. Setting the value prop to `<input />`

![1-broken-input-1](/content/images/2020/04/1-broken-input-1.png)

In the screenshot, we can see that the input value and the value rendered below are not in sync.

That makes sense: when we don't set the value of the input element we have an [uncontrolled input](https://reactjs.org/docs/forms.html#controlled-components). The input will thus always show the entered value.

What happens when we change that?

    function CounterInput({ count, index, counters, setCounters }) {
      ...

      return (
        <input
          type="number"
          value={localCount}
          onChange={event => setLocalCount(event.target.value)}
        />
      );
    };


Here is a screenshot of the app. The input still shows the correct value, but we get a new warning.

![2-set-input-value-1](/content/images/2020/04/2-set-input-value-1.png)

The input is changing from an uncontrolled to a controlled input. That leads us to the next problem.

## 2. Initializing the state

The warning above means that the input's value was not defined at first. During a later render the value was set. This makes sense since the `localCount` state is not initialized. Let's initialize it with `0`.

    function CounterInput({ count, index, counters, setCounters }) {
      const [localCount, setLocalCount] = useState(0);

      ...
    };


Here is how the app looks now.

![3-set-initial-value-1](/content/images/2020/04/3-set-initial-value-1.png)

Great! The App state is still not updated but we at least see an initial value in all inputs and can change them.

## 3. Fixing the splice update logic

First of all, we have to realize that there is another problem. `setCounters` inside `useEffect` is never called.

    useEffect(() => {
      if (!firstRender) {
        setCounters(...);
      } else {
        firstRender.current = false;
      }
    }, [localCount]);


If you're thinking that the dependencies are not complete, you're totally right. But the actual problem is the `if` condition is always true. We need to check `firstRender.current` instead of `firstRender`.

    if (!firstRender.current) {


When we look at the app we now see this after updating an input.

![4-update-state](/content/images/2020/04/4-update-state.png)

No matter how many inputs we had before, after changing one value we only see a single input. But at least the output below changes. Even if it's broken.

Obviously, the update logic inside the `useEffect` is not working correctly. We would expect that only the changed input's value is updated inside the `counters` state. But that's not what happens!

How does the update logic look like?

    setCounters([
      ...counters.splice(index, 1, { ...count, count: localCount })
    ]);


According to [the documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)`Array.splice` removes or replaces items inside the array and returns the deleted items. Let's have a look at what `splice` returns and what the counters array looks like after an input change.

    // initial counters
    [
      {
        "name": "Counter 1",
        "count": 0
      },
      {
        "name": "Counter 2",
        "count": 0
      },
      {
        "name": "Counter 3",
        "count": 0
      }
    ]

    // console.log(counters.splice(1, 1, { ...count, count: 3 }))
    {
      "name": "Counter 2",
      "count": 0
    }

    // updated counters
    [
      {
        "name": "Counter 2",
        "count": "3"
      }
    ]


Interesting! I would have expected the new state to equal the return value of the `counters.splice`. But it looks like it's the first element of the `counters` array after `splice` was applied.

I'm not 100% sure why that is but it has probably to do with us first mutating the counters array (which is the App's state) and then updating that state. [Another reason not to mutate state directly!](https://jkettmann.com/how-to-accidentally-mutate-state-and-why-not-to/)

Anyways, sorry for the detour. Let's get back on track.

We need to change the logic for updating the counters. Instead of `splice` let's use [slice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) since that is not mutating the original array.

    setCounters([
      ...counters.slice(0, index),
      { ...count, count: localCount },
      ...counters.slice(index + 1),
    ]);


Great! It honestly looks a bit more complicated, but this is just replacing the `counter` object at the given index. You could also use an immutability library like [Immer](https://github.com/immerjs/immer) that makes updating arrays and nested objects easier.

One last thing to mention and a common mistake when working with a combination of `useState` and `useEffect` is the way we use the `counters` state to update itself via `setCounters`.

In this case, we were lucky since we didn't add all the required dependencies to our `useEffect` hook. But if you replace the current dependencies with

    [localCount, counters, setCounters, count, index]


you will quickly see that we're ending up with an infinite loop when changing an input's value. Try it for yourself.

To prevent the infinite loop we should use a function as a parameter for `setCounter`.

    useEffect(() => {
      if (!firstRender) {
        setCounters((previousCounters) => [
          ...previousCounters.slice(0, index),
          { ...previousCounters[index], count: localCount },
          ...previousCounters.slice(index + 1),
        ]);
      } else {
        firstRender.current = false;
      }
    }, [localCount, index, setCounters]);


We are able to remove some of the dependencies and don't end up in an infinite loop anymore.

And by the way, updating the App's state works now!

![5-fixed-state-update](/content/images/2020/04/5-fixed-state-update.png)

## 4. Don't `useEffect` as callback

We might say that we're done now. After all, the component seems to work.

But we already mentioned that the `useEffect` looks a bit complicated and seems like it's basically a callback.

    const firstRender = useRef(true);

    useEffect(() => {
      if (!firstRender.current) {
        setCounters([
          ...counters.splice(index, 1, { ...count, count: localCount })
        ]);
      } else {
        firstRender.current = false;
      }
    }, [localCount]);


During the first render we don't want to update the `counters` state. But since `useEffect` is already executed, we need to check for `firstRender`. Ok, understood. But it still feels ugly.

Let's take a step back. When is this supposed to run? Whenever `localCount` changes. And that's whenever the input's `onChange` handler is called. So why don't we just call `setCounters` inside the `onChange` handler?

This is a mistake that I often see with beginners to React. So always keep in mind that there might be a possibility to replace your `useEffect` with a callback.

How does the refactored version look like?

    function CounterInput({ index, setCounters }) {
      const [localCount, setLocalCount] = useState(0);

      const onChange = (event) => {
        const { value } = event.target;
       setLocalCount(value);
       setCounters((previousCounters) => [
         ...previousCounters.slice(0, index),
         { ...previousCounters[index], count: value },
         ...previousCounters.slice(index + 1),
       ]);
      };

      return (
        <input
          type="number"
          value={localCount}
          onChange={onChange}
        />
      );
    };


Great! That's already so much simpler. We got rid of the strange `firstRender` ref and the `useEffect`.

## 5. Single source of truth

Let's have a look at the App component's state and the CounterInput's state.

    // App state -> [{ name: 'Counter 1', count: 3 }]
    const [counters, setCounters] = useState([]);

    // CounterInput state -> 3
    const [localCount, setLocalCount] = useState(0);


When the `count` value inside App is `3` then the corresponding CounterInput state should be `3` as well. So the `localCount` value is just a duplicate of the `count` value in the App component.

Duplicating values is often problematic because you need to synchronize them. If `count` and `localCount` don't match, you have a bug. It's also much easier to keep track of the data flow without duplicated values. That's why we use the [Flux architecture](https://facebook.github.io/flux/) after all.

So let's refactor the code to have a single source of truth. That's surprisingly easy since we already have the `count` object inside our props.

    function CounterInput({ count, index, counters, setCounters }) {
      const onChange = (event) => setCounters((previousCounters) => [
        ...previousCounters.slice(0, index),
        { ...previousCounters[index], count: event.target.value },
        ...previousCounters.slice(index + 1),
      ]);

      return (
        <input
          type="number"
          value={count.count}
          onChange={onChange}
        />
      );
    };


We simply removed the line

    const [localCount, setLocalCount] = useState(0);


and replaced all occurrences of `localCount` with `count.count`. We can now see that the naming of the `count` prop is not optimal. It should be called `counter` in fact. But we can deal with that later.

We also simplified our `onChange` handler a bit. The CounterInput component looks very clean now.

## 6. Cleaning up responsibilities

There is still one last issue that's bugging me. The `counters` prop is luckily not used anymore, but we still update the complete `counters` array inside the CounterInput component.

But the CounterInput shouldn't care about the array. It should only be responsible for a single value. The component that should update the `counters` array is `MultiCounterInput`. This component is rendering the list of inputs, after all.

This is how the component looks currently.

    function MultiCounterInput({ counters, setCounters }) {
      return (
        <>
          <button
            onClick={() => setCounters([...counters, { name: `Counter ${counters.length + 1}`, count: 0 }])}
          >
            Add Counter
          </button>

          {counters.map((count, index) => (
            <CounterInput
              key={index}
              index={index}
              count={count}
              setCounters={setCounters}
              counters={counters}
            />
          ))}
        </>
      );
    }


Now we move the `onChange` from CounterInput. The refactored MultiCounterInput component looks like this.

    function MultiCounterInput({ counters, setCounters }) {
      const addCounter = () => setCounters((previousCounters) => previousCounters.concat({
        name: `Counter ${previousCounters.length + 1}`,
        count: 0,
      }));

      const onChangeCount = (count, index) => setCounters((previousCounters) => [
        ...previousCounters.slice(0, index),
        { ...previousCounters[index], count },
        ...previousCounters.slice(index + 1),
      ]);

      return (
        <>
          <button onClick={addCounter}>
            Add Counter
          </button>

          {counters.map((counter, index) => (
            <CounterInput
              key={counter.name}
              index={index}
              count={counter.count}
              onChange={onChangeCount}
            />
          ))}
        </>
      );
    }


We had to adjust the `onChangeCount` callback slightly.

The handling of the event should be done by the CounterInput component. For the MultiCounterInput component, it doesn't matter where the count comes from, it just needs to be there. The rest is an implementation detail.

We also need the index of the updated counter.

Our new handler thus expects two parameters, `count` and `index`.

We also moved the button's click handler up to be consistent. Additionally, we adjusted the naming of the previous `count` object to `counter` and only pass down the actual `count` value to CounterInput.

Finally, we need to adjust the `CounterInput` a bit.

    function CounterInput({ count, index, onChange }) {
      return (
        <input
          type="number"
          value={count}
          onChange={(event) => onChange(event.target.value, index)}
        />
      );
    };


Nice! CounterInput is so simple now.

You can find the final code here on [codesandbox.io](https://codesandbox.io/s/list-of-state-changers-issue-si4cv?fontsize=14&amp;hidenavigation=1&amp;theme=dark).

## Wrapping it up

That was it for this refactoring session. I hope you liked it and gained some insights.

I'm planning to write more refactoring blog posts. If you want to get updates [subscribe to my list](https://jkettmann.com/subscribe/) or signup for my **free email course** below.

import Newsletter from 'components/Newsletter'

<Newsletter formId="1499362:x4g7a4"/>