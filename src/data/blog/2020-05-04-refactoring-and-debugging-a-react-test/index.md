---
category: 'blog'
title: Inside a dev's mind - Refactoring and debugging a React test
slug: refactoring-and-debugging-a-react-test
date: 2020-05-04
tags: ["Inside a dev's mind", "Refactoring", "Debugging"]
selfQualifierTags: ["pro-skills"]
selfQualifierSort: 50
published: true
---

You may know this already: testing is an integral part of the skillset of every professional developer. Many job listings require at least basic testing skills from applicants.

But testing a frontend can be particularly tough. You don't know whether you should focus on unit, integration, or e2e tests. You may have a hard time deciding what to test. And once you start writing tests it may take hours to turn the dreaded red into nicely passing green tests.

With time testing becomes easier though. You develop strategies for debugging and a growing intuition.

This blog post may help accelerate this journey. We will step through a situation as it happens daily in companies around the world. We will debug and refactor a test that looks simple at first glance but buries a surprising number of obstacles.

Here is an overview of the techniques used in this post:

- [Investigating the DOM](#investigatingthedom)
- [Waiting for an element to disappear](#waitingforanelementtodisappear)
- [Debugging with VSCode](#debuggingwithvscode)
- [How to make sure the mocks are working](#howtomakesurethemocksareworking)
- [Investigate a single element with the debug function](#investigateasingleelementwiththedebugfunction)
- [Using testing-library's within](#usingtestinglibraryswithin)
- [A short word on mocks](#ashortwordonmocks)
- [Get a free cheatsheet with all techniques](#post-subscribe)

## The situation

One of our team-mates tries to write a test for a feature he implemented. But he isn't that experienced with testing so he is stuck for a couple of hours.

We have some time and decide to give it a shot. Let's help our frustrated colleague with this test!

## The repository

First of all, we need the code. [You can find the repository here](https://github.com/jkettmann/debugging-and-refactoring-a-react-test). If you like, clone it to your local machine, install the dependencies, and follow along. It may be a great chance to learn some things :-)

After you run the app with `yarn start` you can see this in your browser:

![1-app-in-browser](/content/images/2020/05/1-app-in-browser.png)

The app fetches the top 100 posts in the `reactjs` subreddit for the last year. When you select a weekday it displays all the posts created on that particular weekday in the table.

## The test

Let's have a look at the test. You can find it inside `App.test.js` inside the repository.

```jsx
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import App from "./App";
import mockPosts from "./__mocks__/mockPosts.json";

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getPostDay({ createdAt }) {
  return new Date(createdAt).getDay();
}

// sort posts by weekday (Sunday to Saturday)
mockPosts.sort((a, b) => getPostDay(a) - getPostDay(b));

test.each(weekdays)(
  "shows table containing correct posts for %s",
  async (weekday) => {
    const { getByText, getByRole, getAllByRole } = render(<App />);

    const weekdayButton = getByText(weekday);
    fireEvent.click(weekdayButton);

    const day = weekdays.indexOf(weekday);
    const postIndex = mockPosts.findIndex((post) => getPostDay(post) === day);

    getByRole("table");
    const rows = getAllByRole("row");

    for (let i = 0; i < rows.length; i += 1) {
      const post = mockPosts[postIndex + i];
      getByText(post.author);
      getByText(post.title);
      getByText(post.score.toString());
    }
  }
);
```

Our colleague explains to us what he's trying to do:

For each weekday we test if the correct posts are displayed in the table. We render the app and select a weekday in the select input.

We first sort the mock posts by weekday and get the index of the first post for the current weekday. This index is later used to compare each table row with the expected post data.

Next, we wait for the table to appear and get all its rows. Since we need to check if these rows contain the correct post data we loop over each row. Then we get the corresponding post data and check if it's rendered. The `get*` function will throw an error if the data is not there.

The `toString` in the last assertion is necessary since `post.score` is a number and `getByText` doesn't like numbers.

## The problem

Okay, fair enough. The usage of `test.each` to loop over a set of weekdays is neat. Didn't know that before!

But what's the problem? Let's run the tests with `yarn test`.

![2-failing-tests](/content/images/2020/05/2-failing-tests.png)

Okay, the tests take forever (33s) and each of them fails.

I guess before we start investigating the test we should have a clear picture of the application.

> This blog post was inspired by a debugging session with a student during [a new course about becoming job-ready for working in professional dev teams](https://ooloo.io). Check it out if you're interested, I'll launch it soon.

## The application

As a reminder: This is how the application looks like in the browser.

![1-app-in-browser](/content/images/2020/05/1-app-in-browser.png)

Let's have a look at the code. We have three components: App, WeekdaySelect, and PostsTable.

```jsx
import React, { useState, useEffect } from "react";
import WeekdaySelect from "./WeekdaySelect";
import PostsTable from "./PostsTable";
import api from "./api";

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function groupPostsByWeekday(posts) {
  return posts.reduce((postsByWeekday, post) => {
    const day = new Date(post.createdAt).getDay();
    const weekday = weekdays[day];
    return {
      ...postsByWeekday,
      [weekday]: (postsByWeekday[weekday] || []).concat(post),
    };
  }, {});
}

function App() {
  const [postsByWeekday, setPostsByWeekday] = useState([]);
  const [selectedWeekday, setSelectedWeekday] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getPosts().then((posts) => {
      const groupedPosts = groupPostsByWeekday(posts);
      setPostsByWeekday(groupedPosts);
      setIsLoading(false);
    });
  }, []);

  return (
    <div>
      <h1>Posts in /r/reactjs per weekday</h1>

      <WeekdaySelect
        weekdays={weekdays}
        selectedWeekday={selectedWeekday}
        setSelectedWeekday={setSelectedWeekday}
      />

      {isLoading && <div>Loading...</div>}

      {selectedWeekday && (
        <PostsTable posts={postsByWeekday[selectedWeekday]} />
      )}
    </div>
  );
}
```

The App component renders the weekday select input. The table is only shown if a weekday has been selected. While the posts are loaded from the API a loading state is shown. After the component did mount it fetches a list of posts in the `useEffect`.

To understand the structure of the data and the state we set a breakpoint in our browser's dev tools inside `useEffect` at the line `const groupedPosts = groupPostsByWeekday(posts)`.

![1-1-breakpoint-browser-1](/content/images/2020/05/1-1-breakpoint-browser-1.png)

Each post inside the array returned from `api.getPosts()` looks like this:

```json
{
  "id": "du50op",
  "author": "albaneso",
  "createdAt": 1573349501000,
  "title": "react-interactive-paycard",
  "score": 2062
}
```

After the posts are fetched they are grouped by weekday and stored in a state variable. The state then looks like this.

```json
{
  "Sunday": [
    {
      "id": "du50op",
      "author": "albaneso",
      "createdAt": 1573349501000,
      "title": "react-interactive-paycard",
      "score": 2062
    },
    ...
  ],
  "Monday: [...],
  ...
}
```

Okay, this component is not super-simple but nothing too complicated as well.

How about the WeekdaySelect component?

```jsx
import React from "react";
import styles from "./WeekdaySelect.module.css";

function WeekdaySelect({ weekdays, selectedWeekday, setSelectedWeekday }) {
  return (
    <label>
      Selected weekday:
      <select
        className={styles.select}
        value={selectedWeekday === null ? "" : selectedWeekday}
        onChange={(e) => setSelectedWeekday(e.target.value)}
      >
        <option value="" disabled>
          Select your option
        </option>
        {weekdays.map((weekday) => (
          <option key={weekday} value={weekday}>
            {weekday}
          </option>
        ))}
      </select>
    </label>
  );
}
```

This is fairly simple. WeekdaySelect just renders a select input and an option for each weekday.

The PostsTable is also a straightforward component that renders (as the name says) a table.

```jsx
import React from "react";
import classNames from "classnames";
import styles from "./PostsTable.module.css";

function PostsTable({ posts }) {
  return (
    <table border="1" className={styles.table}>
      <thead>
        <tr>
          <th className={styles.cell}>Title</th>
          <th className={styles.cell}>Author</th>
          <th className={styles.cell}>Score</th>
        </tr>
      </thead>

      <tbody>
        {posts.map(({ id, title, author, score }) => (
          <tr key={id}>
            <td className={classNames(styles.cell, styles.title)}>{title}</td>
            <td className={styles.cell}>{author}</td>
            <td className={styles.cell}>{score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

We have a header row with the titles of the columns and one row for each post.

## Why isn't the table found?

To recall our problem: the table element can't be found.

![2-failing-tests](/content/images/2020/05/2-failing-tests.png)

This either means that the call `getByRole` is not working or that the table is not rendered (see below).

But first of all, let's reduce the number of tests we run so we don't have to wait half a minute every time. Usually, we could run a single test with `test.only`. But since we use `test.each` to run a test per weekday we simply comment out all but one weekday.

```jsx
const weekdays = [
  "Sunday",
  // "Monday",
  // "Tuesday",
  // "Wednesday",
  // "Thursday",
  // "Friday",
  // "Saturday",
];
```

## Investigating the DOM

Next let's see what is rendered. The `render` function of `@testing-library/react` returns a nice little function called `debug`. This allows us to investigate the rendered DOM structure. Let's add it before we try to get the table.

```jsx
test.each(weekdays)(
  "shows table containing correct posts for %s",
  async (weekday) => {
    const { getByText, getByRole, getAllByRole, debug } = render(<App />);

    const weekdayButton = getByText(weekday);
    fireEvent.click(weekdayButton);

    const day = weekdays.indexOf(weekday);
    const postIndex = mockPosts.findIndex((post) => getPostDay(post) === day);

    debug();

    getByRole("table");
    ...
  }
);
```

The output of the `debug` function is this.

![3-debug-table](/content/images/2020/05/3-debug-table.png)

No table! But we can see the loading state instead.

## Waiting for an element to disappear

What if we wait until the data has loaded? We can use the function `waitForElementToBeRemoved` to wait until the loading text disappears.

```jsx
test.each(weekdays)(
  "shows table containing correct posts for %s",
  async (weekday) => {
    const { getByText, getByRole, getAllByRole, debug } = render(<App />);

    const weekdayButton = getByText(weekday);
    fireEvent.click(weekdayButton);

    const day = weekdays.indexOf(weekday);
    const postIndex = mockPosts.findIndex((post) => getPostDay(post) === day);

    await waitForElementToBeRemoved(() => getByText(/Loading/));
    debug();

    getByRole("table");
    ...
  }
);
```

This is the `debug` function's output.

![4-debug-after-loading](/content/images/2020/05/4-debug-after-loading.png)

Ok, so we don't see the loading state anymore. But neither the table.

When we take another look at the App component we can see that the table is only rendered when a day was selected.

```jsx
{selectedWeekday && (
  <PostsTable posts={postsByWeekday[selectedWeekday]} />
)}
```

So maybe selecting a weekday doesn't work. Since it works in the browser something in our test might be broken.

The lines in our test that are responsible for selecting the weekday seem to be these.

```jsx
const weekdayButton = getByText(weekday); // weekday = "Sunday"
fireEvent.click(weekdayButton);
```

Now it would be great to have a proper debugger for our test. Then we could simply add breakpoints to the code and see where the problem lies.

## Debugging with VSCode

Good news: With VSCode that's very easy. I found this launch configuration somewhere online and copy-paste it to all my projects.

(I hope you use VSCode otherwise you'll need to find your own configuration)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Test",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/react-scripts",
      "args": [
        "test",
        "${file}",
        "--runInBand",
        "--no-cache",
        "--watch"
      ],
      "cwd": "${workspaceRoot}",
      "protocol": "inspector",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

With this configuration, VSCode will run the tests in the currently opened file. So make sure that `App.test.js` is open and hit the `Run` button in the debugging panel on the left.

![4-1-vscode-debugger-run](/content/images/2020/05/4-1-vscode-debugger-run.png)

We set a breakpoint in the `onChange` handler in the `WeekdaySelect` component.

![5-breakpoint-in-weekday](/content/images/2020/05/5-breakpoint-in-weekday.png)

> Note: If you set the breakpoint first and then run the test the breakpoint might jump to another place. Just remove it and set it again. The same may happen when you restart the debugger.

To re-run the tests we can simply save the WeekdaySelect file with ⌘ + S or Ctrl + S.

The breakpoint is not hit! Just to be sure let's add a `console.log` statement. Maybe the debugger doesn't work properly...

```jsx
onChange={(e) => console.log('onChange') || setSelectedWeekday(e.target.value)}
```

Hmm... the console also doesn't output anything.

> Note: using the `||` operator is a nice way to add a log statement without adding curly brackets to the function call.

What does a good developer do? Ask Google!

![6-google-search](/content/images/2020/05/6-google-search.png)

[This nice blog post](https://www.polvara.me/posts/testing-a-custom-select-with-react-testing-library/) gives us the solution: We shouldn't use a click event but a **change event** 🤦

Ok, next try. We change out the click with a change event.

```jsx
test.each(weekdays)(
  "shows table containing correct posts for %s",
  async (weekday) => {
    const { getByText, getByRole, getAllByRole, getByLabelText, debug } = render(<App />);

    // const weekdayButton = getByText(weekday);
    // fireEvent.click(weekdayButton);

    const select = getByLabelText(/Selected weekday/);
    fireEvent.change(select, { target: { value: weekday }});

    ...
  }
);
```

The test runs again and voila! Our breakpoint is hit.

![7-breakpoint-in-weekday-is-hit](/content/images/2020/05/7-breakpoint-in-weekday-is-hit.png)

## Using the debugger's variables panel to catch a bug

One problem is solved but the next is already knocking on our door.

![8-failing-test-map-of-undefined](/content/images/2020/05/8-failing-test-map-of-undefined.png)

This means that the `posts` prop in the `PostsTable` component is `undefined` for some reason. Let's set another breakpoint in `App.js` to investigate this issue.

![9-breakpoint-in-app](/content/images/2020/05/9-breakpoint-in-app.png)

We re-run the tests, the breakpoint is hit. The variables panel tells us that `selectedWeekday` is `null` and `isLoading` is `true`. That's expected for the first render.

We continue with the code execution. The breakpoint is hit again. Now the variables look like this.

![10-variable-for-breakpoint-in-app](/content/images/2020/05/10-variable-for-breakpoint-in-app.png)

`isLoading` is still `true`, but `selectedWeekday` is `Sunday`. That's what we want after selecting that option in the input, of course.

But when you have a look at the code above you can see that the PostsTable will be rendered now. The `postsByWeekday` variable is empty though.

```jsx
{selectedWeekday && (
  <PostsTable posts={postsByWeekday[selectedWeekday]} />
)}
```

We found a bug in our code! We shouldn't render the table when the data is still loading. That's easy to fix:

```jsx
{!isLoading && selectedWeekday && (
  <PostsTable posts={postsByWeekday[selectedWeekday]} />
)}
```

Nice, we didn't catch that with our manual tests!

The tests are running again. And finally, we see the table in the output of the `debug` function.

![11-table-is-rendered](/content/images/2020/05/11-table-is-rendered.png)

## How to make sure the mocks are working

Time to celebrate! But wait a second. The tests are still failing.

![12-failing-not-finding-author](/content/images/2020/05/12-failing-not-finding-author.png)

Interesting. The output shows us that the data is in fact rendered. At least some data.

![13-rendered-table-data](/content/images/2020/05/13-rendered-table-data.png)

**Dan Abramov deactivates Twitter account.** For real??

Our team-mate is intrigued: "That's news to me. Apart from that, I didn't see that post inside the mock data I prepared!"

We remember the API call in the App component.

```jsx
useEffect(() => {
  api.getPosts().then((posts) => {
    const groupedPosts = groupPostsByWeekday(posts);
    setPostsByWeekday(groupedPosts);
    setIsLoading(false);
  });
}, []);
```

We're not running end-to-end tests here. So this should be mocked. But is it?

We see two files. The first is the real `api.js` file, the other the mock `__mocks__/api.js`.

To check which file is used we can add log statements to each file below the imports.

```jsx
import axios from "axios";

console.log('import real api');

async function getPosts() {
  const url = "https://www.reddit.com/r/reactjs/top.json?t=year&limit=100";
  const response = await axios.get(url);
  return response.data.data.children.map(({ data }) => ({
    id: data.id,
    author: data.author,
    createdAt: data.created_utc * 1000,
    title: data.title,
    score: data.score,
  }));
}

export default {
  getPosts,
};


import mockPosts from './mockPosts.json';

console.log('import mock api');

export default {
  getPosts: () => Promise.resolve(mockPosts),
};
```

> Note: we could have used breakpoints here as well. But why not use a different technique? Might come handy from time to time.

The tests run again and the console output says...

![14-1-mock-import-not-working](/content/images/2020/05/14-1-mock-import-not-working.png)

Damn!

We check the [Jest docs about mocking](https://jestjs.io/docs/en/manual-mocks#mocking-user-modules) and see that we need to manually mock user modules.

```jsx
import React from "react";
import { render, fireEvent, waitForElementToBeRemoved } from "@testing-library/react";
import App from "./App";
import mockPosts from "./__mocks__/mockPosts.json";

jest.mock('./api');

const weekdays = [
...
```


Now we see the output: "import api mock". And wow, the tests run so fast! We did real API calls all the time. Another facepalm 🤦

## Off by one

Anyway, the output is slightly different but the tests are still failing.

![14-use-mock-data](/content/images/2020/05/14-use-mock-data.png)

Since we saw already that some posts are rendered in the table let's see what's going on inside the loop.

```jsx
test.each(weekdays)(
  "shows table containing correct posts for %s",
  async (weekday) => {
    const { getByText, getByRole, getAllByRole, getByLabelText, debug } = render(<App />);

    const select = getByLabelText(/Selected weekday/);
    fireEvent.change(select, { target: { value: weekday }});

    const day = weekdays.indexOf(weekday);
    const postIndex = mockPosts.findIndex((post) => getPostDay(post) === day);

    await waitForElementToBeRemoved(() => getByText(/Loading/));

    getByRole("table");
    const rows = getAllByRole("row");

    for (let i = 0; i < rows.length; i += 1) {
      const post = mockPosts[postIndex + i];
      console.log(post)
      getByText(post.author);
      getByText(post.title);
      getByText(post.score.toString());
    }
  }
);
```


The last logged post is the one causing the error.

![15-console-log-posts](/content/images/2020/05/15-console-log-posts.png)

The console also shows us the rendered DOM. This is the last post inside the table.

![16-last-post-rendered](/content/images/2020/05/16-last-post-rendered.png)

Looks a lot like a classic off-by-one problem!

Why is that? Let's log the weekday the post was created at as well.

```jsx
console.log(post, getPostDay(post));
```

Now the output looks like this

![17-console-log-posts-with-day](/content/images/2020/05/17-console-log-posts-with-day.png)

Ok, we're overshooting by one day! The post with author `magenta_placenta` belongs to Monday, but we're only testing Sunday here.

## Investigate a single element with the debug function

Let's have a look at the test again.

```jsx
const rows = getAllByRole("row");

for (let i = 0; i < rows.length; i += 1) {
  const post = mockPosts[postIndex + i];
  console.log(post, getPostDay(post));
  getByText(post.author);
  getByText(post.title);
  getByText(post.score.toString());
}
```

We get all rows and use them to loop over the posts. We can use the fantastic `debug` function one more time. **When we pass an element as parameter only that element is shown in the console.**

```jsx
const rows = getAllByRole("row");
debug(rows);
```

This is the output

![18-debug-rows](/content/images/2020/05/18-debug-rows.png)

That makes a lot of sense now. The first row is the header row! Since we use the length of the rows array we're overshooting the posts array!

There is a simple fix. We stop the loop one step earlier.

```jsx
for (let i = 0; i < rows.length - 1; i += 1) {
  ...
}
```

This works. The test for Sunday passes!

![18-1-test-for-sunday-passes](/content/images/2020/05/18-1-test-for-sunday-passes.png)

## Rethinking the test

But if we think about it the test doesn't make sense. Here is the current version:

```jsx
// sort posts by weekday (Sunday to Saturday)
mockPosts.sort((a, b) => getPostDay(a) - getPostDay(b));

test.each(weekdays)(
  "shows table containing correct posts for %s",
  async (weekday) => {
    const { getByText, getByRole, getAllByRole, getByLabelText, debug } = render(<App />);

    const select = getByLabelText(/Selected weekday/);
    fireEvent.change(select, { target: { value: weekday }});

    const day = weekdays.indexOf(weekday);
    const postIndex = mockPosts.findIndex((post) => getPostDay(post) === day);

    await waitForElementToBeRemoved(() => getByText(/Loading/));

    getByRole("table");
    const rows = getAllByRole("row");

    for (let i = 0; i < rows.length - 1; i += 1) {
      const post = mockPosts[postIndex + i];
      getByText(post.author);
      getByText(post.title);
      getByText(post.score.toString());
    }
  }
);
```

We get all the rows in the table and check if they are present in the data array. **We should test the opposite though**: are all the posts in the data array shown in the table?

So let's change the approach.

```jsx
test.each(weekdays)(
  "shows table containing correct posts for %s",
  async (weekday) => {
    const { getByText, findByRole, getByLabelText, debug } = render(<App />);

    const select = getByLabelText(/Selected weekday/);
    fireEvent.change(select, { target: { value: weekday }});

    await waitForElementToBeRemoved(() => getByText(/Loading/));
    getByRole("table");

    const day = weekdays.indexOf(weekday);
    const postsForWeekday = mockPosts.filter((post) => getPostDay(post) === day);

    postsForWeekday.forEach((post) => {
      getByText(post.author);
      getByText(post.title);
      getByText(post.score.toString());
    });
  }
);
```


Now we find all posts created at the corresponding weekday. Then we step through these posts and check if the data is rendered in the table.

Makes more sense. At the same time, we can remove the sorting of the mock posts. That felt weird anyway!

The console shows us that the test for Sunday is still passing. But what about the others?

## Using testing-library's within

Let's uncomment the other weekdays and run the tests again.

![19-failing-multiple-posts](/content/images/2020/05/19-failing-multiple-posts.png)

Oh common! Really?

Deep breath! What does it say?

```
Found multiple elements with the text: pmz
```

We seem to have multiple occurrences for an author called pmz. That's possible, of course, if an author has multiple posts on a weekday in the list.

With `getByText` we look for the text globally. If it's appearing twice in the table the test fails.

Instead, we should test if the post data is shown in that specific row. That's where react-testing-library's `within` function comes in!

Using `within` we can restrict the `getByText` to the current row.

```jsx
import { render, fireEvent, waitForElementToBeRemoved, within } from "@testing-library/react";

...

test.each(weekdays)(
  "shows table containing correct posts for %s",
  async (weekday) => {
    const { getByText, getByRole, getByLabelText, getAllByRole } = render(<App />);

    const select = getByLabelText(/Selected weekday/);
    fireEvent.change(select, { target: { value: weekday }});

    const day = weekdays.indexOf(weekday);
    await waitForElementToBeRemoved(() => getByText(/Loading/));

    getByRole("table");
    const rows = getAllByRole('row');
    const postsForWeekday = mockPosts.filter((post) => getPostDay(post) === day);

    postsForWeekday.forEach((post, index) => {
      const row = rows[index + 1];
      within(row).getByText(post.author);
      within(row).getByText(post.title);
      within(row).getByText(post.score.toString());
    });
  }
);
```

Now we run the tests again... and tada, all tests pass!

![20-all-tests-pass](/content/images/2020/05/20-all-tests-pass.png)

## A short word on mocks

Our team-mate mocked out the `api.js` file. This is not optimal since it contains logic that should be tested as well.

Instead of mocking that file we can go one level deeper and mock the Axios request directly. Then we test the app almost as it works in production.

This post became a bit lengthy already so we will leave this as a future refactoring.

## Wrapping it up

If you made it until here congratulations. We walked through a complete debugging and refactoring session for a test that turned out to have more problems than expected.

import Newsletter from 'components/Newsletter'

<Newsletter formId="2046086:i1x4o6"/>