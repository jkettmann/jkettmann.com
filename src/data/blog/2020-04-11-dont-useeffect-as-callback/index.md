---
category: 'blog'
title: Don't useEffect as callback!
slug: dont-useeffect-as-callback
date: 2020-04-11
published: true
---

The `useEffect` hook in React is sometimes not easy to understand. It can be hard to get it working properly. You might have missing dependencies, cause a stale closure or an infinite loop.

In this blog post, we'll have a look at a common misuse of the `useEffect` hook. It doesn't cause an error, but it causes unnecessary re-renders and code complexity. We'll see two examples where `useEffect` is basically a callback and how you can simplify code like that.

## 1. State update triggering a callback

This is a simple example component where a state update is supposed to trigger a callback. This is, of course, a broken-down component. But I saw this pattern often enough in more complex components in real code.

    function Form({ onUpdate }) {
      const [email, setEmail] = useState('');
      const firstRender = useRef(true);

      useEffect(() => {
        if (firstRender.current) {
          firstRender.current = false;
          return;
        }
        onUpdate(email);
      }, [onUpdate, email]);

      return (
        <form>
          <input
            value={email}
            onChange={(e) => setEmail(() => e.target.value)}
            name="email"
          />
        </form>
      );
    }


We have an input inside a form. The component keeps track of the `email` value in a state variable. We want the `onUpdate` prop to be called whenever the `email` changes.

One option is to `useEffect` with `email` as a dependency like in the example above. There are two problems with this approach:

1. It obfuscates the connection between the `onChange` handler of the input component and the `onUpdate` prop passed to this component by its parent.
2. We need the workaround with the `useRef` to prevent a call of `onUpdate` on the first render.

> **Note: There is a very valid use-case** though that I missed in my first version. In some cases, you might want the `onUpdate` function only to be called **after** the state has been set, similar to using the second parameter of a class component's `this.setState(state, callback)`. In this case, `useEffect` is the way to go, in fact.

The alternative approach is very simple: We use a function instead.

    function Form({ onUpdate }) {
      const [email, setEmail] = useState('');

      const onChange = (e) => {
        const { value } = e.target;
        setEmail(value);
        onUpdate(value);
      };

      return (
        <form>
          <input
            value={email}
            onChange={onChange}
            name="email"
          />
        </form>
      );
    }


Now it's immediately clear that `setEmail` and `onUpdate` are coupled together. We also got rid of the `useRef`.

In my opinion that's much cleaner and easier to comprehend.

## 2. Transforming data

Another common example of an unnecessary case of `useEffect` is again related to a state update. This time it's used to transform data though.

Have a look at the following example.

> I took this example from a [new course about becoming job-ready for working in professional dev teams](https://ooloo.io). Check it out if you're interested, I'll launch it soon.

    function RedditPosts() {
      const [data, setData] = useState(null);
      const [posts, setPosts] = useState([]);

      useEffect(() => {
        fetch('https://www.reddit.com/r/javascript/top.json?t=day&limit=10')
          .then(response => response.json())
          .then(({ data }) => setData(data));
      }, []);

      useEffect(() => {
        if (!data) {
          return;
        }

        const mappedPosts = data.children.map(post => post.data);
        setPosts(mappedPosts);
      }, [data]);

      return (
        <div>
          {
            posts.map(post => (
              <div key={post.id}>{post.title}</div>
            ))
          }
        </div>
      );
    }


So what's happening here? We have two `useEffect`. The first one is triggered when the component did mount. It fetches data from an API and stores it inside a state variable.

And what about the second `useEffect`? That one is triggered when the `data` state has updated. It transforms the data object into an array of posts to prepare it for rendering. And again, we need a workaround to not run the effect on the first render: the check for `!data`.

How does an alternative approach look like? We can completely get rid of the `data` state and handle the transformation after the API request.

This is how it looks like.

    function RedditPosts() {
      const [posts, setPosts] = useState([]);

      useEffect(() => {
        fetch('https://www.reddit.com/r/javascript/top.json?t=day&limit=10')
          .then(response => response.json())
          .then(({ data }) => data.children.map(post => post.data))
          .then((mappedPosts) => setPosts(mappedPosts));
      }, []);

      return (
        <div>
          {
            posts.map(post => (
              <div key={post.id}>{post.title}</div>
            ))
          }
        </div>
      );
    }


We got rid of the second `useEffect` and handle the transformation in the first one together with the API request.

Much simpler!

## Wrapping it up

There are, of course, lots of valid use-cases for `useEffect`, but those two are not among them. If you recognized yourself using `useEffect` in one of the above ways, try to stop for a moment and think about possible alternative approaches the next time.

If you liked this blog post and want to get updates [subscribe to my list](https://jkettmann.com/subscribe/) or signup for my **free email course** below.

import Newsletter from 'components/Newsletter'

<Newsletter formId="2162732:m6v5k9"/>