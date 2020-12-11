---
category: 'blog'
title: Don't duplicate your data - Learnings from code reviews
slug: dont-duplicate-your-data
date: 2020-09-17
tags: ["Learnings from code reviews"]
published: true
---

Handling data properly can be difficult. We have to fetch it from APIs. We have to aggregate it with data from other sources. And we have to transform it efficiently to use in our UIs.

In the past months, I conducted many code reviews for junior developers during [this new course](https://ooloo.io). I was surprised to see one mistake over and over again. **A mistake that can lead to nasty bugs that are very hard to debug**.

This post is about **data duplication and its antidote: a single source of truth**.

Before I explain what that means let's have a look at a code example.

## Duplicated data

The following component renders a list of blog posts that it receives from its parent.

A user can select a filter to show only posts that were created on a particular day. The component filters and renders the provided posts accordingly.

    const PostList = ({ posts }) => {
      const [selectedDay, setSelectedDay] = useState(null);
      const [filteredPosts, setFilteredPosts] = useState(posts);

      const onChangeDay = (day) => {
        setSelectedDay(day);
        const postsForDay = posts.filter(
          (post) => isSameDay(post.createdAt, day)
        );
        setFilteredPosts(postsForDay);
      };

      return (
        <Wrapper>
          <Filter
            selectedDay={selectedDay}
            onChangeDay={onChangeDay}
          />
          {
            filteredPosts.map((post) => (
              <Post key={post.id} {...post} />
            ))
          }
        </Wrapper>
      );
    };


To implement the filtering the selected day is stored in a state variable. Next to the selected day, we find another state variable that holds the filtered posts.

This `filteredPosts` array is then rendered below. It is updated whenever the selected day changes inside the `onChangeDay` callback.

Maybe you realized the problem with this approach: the `filteredPosts` state is just a subset of the `posts` prop. **We duplicate part of the `posts` array and thus store the data in two different places.**

Ok, true.

## But what's the problem here?

**We have to keep the duplicates in sync with the originals.**

Imagine the following situation: The parent component allows the user to edit a post. The user decides to change the title of a post from "Data duplication rocks!" to "Data duplication sucks!".

What would happen now?

1. The parent component re-renders with the updated `posts` array.
2. The `PostList` component re-renders with the updated `posts` prop.

So far so good. But remember how the component looks like:

    const PostList = ({ posts }) => {
      const [selectedDay, setSelectedDay] = useState(null);
      const [filteredPosts, setFilteredPosts] = useState(posts);

      const onChangeDay = (day) => { ... };

      return (
        <Wrapper>
          <Filter ... />
          {
            filteredPosts.map((post) => (
              <Post key={post.id} {...post} />
            ))
          }
        </Wrapper>
      );
    };


The `PostList` actually displays the data from the `filteredPosts` array. And this a **subset of the old version** of the `posts` prop.

That means that the UI would still display the old post with its outdated title "Data duplication rocks!"

**The problem is that we only update one version of the post. Our `filteredPosts` array is out of sync.**

## A single source of truth

How would a better version of our component look like?

We wouldn't copy the data into another state variable. **We would try to use only one source: the `posts` prop.** A single source of truth.

    function PostList({ posts }) {
      const [selectedDay, setSelectedDay] = useState(null);
      const filteredPosts = posts.filter(
        (post) => isSameDay(post.createdAt, selectedDay)
      );

      return (
        <Wrapper>
          <Filter
            selectedDay={selectedDay}
            onChangeDay={setSelectedDay}
          />
          {
            filteredPosts.map((post) => (
              <Post key={post.id} {...post} />
            ))
          }
        </Wrapper>
      );
    }


See how we were able to get rid of the `filteredPosts` state and **replace it with a normal variable**?

This version is simpler and less likely to introduce a bug.

In case you're worried about performance implications you might be right. If the posts array is very long or the filtering complicated the app might be slow.

But in that case, we could simply make use of the [useMemo](https://reactjs.org/docs/hooks-reference.html#usememo) hook.

    const filteredPosts = useMemo(() => posts.filter(
      (post) => isSameDay(post.createdAt, selectedDay)
    ), [posts, selectedDay]);


The `useMemo` hook returns a [memoized](https://en.wikipedia.org/wiki/Memoization) value. The provided function is only run when the dependencies change.

This means that the filtering in the above example is only run when the `posts` array changes. If the component is re-rendered but the `posts` array stays the same `useMemo` simply returns the memoized value and doesn't need to execute the expensive filtering logic again.

## Exercise time

Here is another example that could benefit from some simplification.

    function Books() {
      const [data, setData] = useState(null);
      const [books, setBooks] = useState([]);

      useEffect(() => {
        fetchData().then((data) => setData(data));
      }, []);

      useEffect(() => {
        if (!data) {
          return;
        }

        const mappedBooks = mapBooks(data);
        setBooks(mappedBooks);
      }, [data]);

      return (
        <div>
          {
            books.map((post) => (
              <div key={post.id}>{post.title}</div>
            ))
          }
        </div>
      );
    }


I leave it to you as an exercise to find the problem and refactor this component to use a **single source of truth**. If you want to see my solution and an explanation of the component drop your email in the form below.

import Newsletter from 'components/Newsletter'

<Newsletter formId="1499362:x4g7a4"/>