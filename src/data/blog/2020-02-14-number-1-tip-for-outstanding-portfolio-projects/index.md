---
category: 'blog'
title: "Frustrating job search? My #1 tip for outstanding portfolio projects"
slug: number-1-tip-for-outstanding-portfolio-projects
date: 2020-02-14
tags: ["Career"]
popular: 20
published: true
---

Applying for jobs can be a frustrating experience. Especially if you don't have professional experience yet. You apply and apply but rarely even get replies. Every job posting requires experience. But how are you supposed to get it if nobody wants to hire you?

At the same time, you hear a lot of stories about new developers who got their first job. And it all seems so easy. But how did they do it??

The best way to show your skills to potential employers is by having great portfolio projects.

I have been in the position to review candidate's projects and I quickly understood that most of them are far from perfect.

Which gives you a great advantage! I have a couple of tips for you to greatly improve the quality of your portfolio projects. In this post we'll be talking about one of the most effective ones:

Writing tests

Before we start: **Also have a look at [my free course](https://jkettmann.com/your-first-tech-job-email-course/) where you learn many more tips like this about your portfolio projects, your resume, and the hiring process.**

Adding tests to your portfolio project is one of my favorite tips. It's not hard to do (once you get the hang of it) and it shows a great deal of maturity and professionalism. Especially self-taught developers often have no experience with testing. Great advantage for you: it can make you look so much better in contrast.

Admittedly, I was the same. I read that testing is useful but it didn't make sense in my own projects at first. After all, it takes time to learn testing. I was still able to click through my app manually so what was the point of automated tests? And it honestly just seemed like a daunting task. It took me a while and some major bugs in a production application to fully understand what testing is about.

## There are two major benefits to writing tests

First, whenever you need to change some code you can be sure that all features still work. And this is especially important in teams. When you're working in a team you often have to touch code that another person wrote. Sometimes the author even left the company. So there might be no one who really knows how the code works.

Changing code that is not covered by tests can be very stressful. You're never sure if you missed some edge case. And if you're busy or there is an upcoming deadline you'll easily forget to check some critical features. Sooner or later you break the signup or the checkout doesn't work anymore. Angry customers and bosses. Money lost.

Second, tests serve as documentation. Imagine you're new to a code-base. How do you understand what a certain feature is supposed to do? Well first, you open the app and click around. Great, that works in a lot of cases. But remember the edge cases I was talking about above? No way you will find all of them.

When I'm new to a code-base with well-written tests the second thing I do after clicking around in the app: I read the tests. Ideally, you will be able to follow exactly what the feature is about, see edge cases and what errors are expected and how they are handled.

But enough about the reasoning behind tests. You probably already knew that tests are important anyway...

## Testing is not hard

I remember the first times I had to write tests. It seemed so complicated. And like such a waste of time. I could be building stuff instead!!

But only a couple of tries later and it already felt much easier. It started making sense. It was fun! And the sense of security I felt was just amazing.

Are you convinced already? I hope so.

But there might be the next question popping up. What and how are you supposed to write tests?

The most important categories of tests for developers are **unit, integration and end-to-end tests**. Let's have a detailed look at each of them. If you want to see the code in action check [this repository](https://github.com/jkettmann/examples-for-frontend-testing).

### Unit tests

Unit tests are great to test business logic. Let's say you have a pure function that takes an input and returns a value like `sum(1, 2, 3)` or `multiply(3, 5)` or `cropImage(...)`. Here unit tests shine. Let's see a test for the `sum` function.

```jsx
function sum(...args) {
  return args.reduce((a, b) => a + b, 0);
}

describe('sum', () => {
  test('returns the sum of the arguments', () => {
    expect(sum(1, 4, 5, 7)).toBe(17);
  });
});
```

Doesn't look so hard, right?

A more real-world example of unit tests in an application built with React and Redux would be tests for the reducers.

### Integration tests

When you want to test the UI, unit tests don't make much sense in my opinion (and that of [Kent C. Dodds](https://kentcdodds.com/blog/write-tests)). Rather go one level higher: write integration tests. These are testing a whole page or a complex feature. It's like testing from a user's perspective.

We'll only cover a quick example here. **If you're interested in taking a deep dive into writing integration tests for React apps have a look at my [beginner's guide to testing](/beginners-guide-to-testing-react).**

Imagine a search page. An integration test could be like the following: Find the search field and enter a value. Then find the search button and click it. Check if the API request was sent and return a mock response. Finally, check if the search results have been rendered.

A library that is excellent for integration tests is [testing-library](https://testing-library.com). There are versions for all major frameworks available.

Let's have a look at the search page example in React:

```jsx
const SearchBar = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');

  const onSearchValueChange = (e) => setSearchValue(e.target.value);
  const onSearchButtonClick = () => onSearch(searchValue);

  return (
    <div>
      <input
        type="text"
        placeholder="Search value"
        value={searchValue}
        onChange={onSearchValueChange}
      />

      <button onClick={onSearchButtonClick}>
        Search
      </button>
    </div>
  )
};

const App = () => {
  const [searchResults, setSearchResult] = useState([]);
  const search = async (searchValue) => {
    try {
      const response = await axios.get(`https://some-api.com/${searchValue}`);
      setSearchResult(response);
    } catch (error) {
      console.error('Error fetching search result', error);
    }
  };
  return (
    <div className="App">
      <SearchBar onSearch={search} />

      <div>
        {
          searchResults.map((result) => (
            <div key={result.id}>
              {result.text}
            </div>
          ))
        }
      </div>
    </div>
  );
}
```

We have a SearchBar component that renders a text input field and a button. The search bar keeps track of the search value by storing it in a state. The search button passes this value to the parent component when it's clicked.

The App component renders the search bar and the search results which are stored in a state. Whenever the search button is clicked the App component sends a GET request to an API and saves the result in the state.

How do we write an integration test for these components? We won't check if the state is set correctly or if the callbacks are called. These are just implementation details. Rather we will pretend to be a user as described above. The only thing that we need to mock is the API call.

```jsx
import React from 'react';
import axios from 'axios';
import { render, fireEvent } from '@testing-library/react';
import App from './App';

jest.mock('axios');

describe('App', () => {
  test('renders search results', async () => {
    axios.get.mockResolvedValue([
      { id: 1, text: 'First search result' },
      { id: 2, text: 'Second search result' },
      { id: 3, text: 'Third search result' }
    ]);

    const { findByPlaceholderText, findByText, getByText } = render(<App />);

    const searchInput = await findByPlaceholderText('Search value');
    fireEvent.change(searchInput, { target: { value: 'search-string' } });

    const searchButton = getByText('Search');
    fireEvent.click(searchButton);

    expect(axios.get).toHaveBeenCalledWith('https://some-api.com/search-string');

    await findByText('First search result');
    await findByText('Second search result');
    await findByText('Third search result');
  });
});
```

In my opinion, this looks very explicit. We tell axios what to return (aka mock the API response). Then we render the app. We look for the search input and enter some text. Then we find the button and click it.

Finally, we have some assertions. We check if the API was called with the correct search value. And we check if the search results have been rendered. For the details of `findByText` etc. please check [the documentation](https://testing-library.com/docs/dom-testing-library/api-queries).

Doesn't seem too complicated, right? Admittedly, you'll probably be a bit frustrated from time to time when you run into a situation that you don't know how to test yet. But it gets easier and easier.

If you're just getting started with writing test [have a look at this detailled introduction to testing React apps with React Testing Library](/beginners-guide-to-testing-react).

### End-to-end tests

If you want to walk the extra mile you can add some end-to-end tests (or e2e-tests). e2e-tests are executed on a running application including the full stack like servers and databases. Thus, in contrast to integration tests, the API calls are not mocked. Since you mostly cannot trigger all possible errors on a running server (like letting the API crash) e2e-tests often focus on the happy path.

I won't show an example here but check out [Cypress](https://www.cypress.io/) if you're interested. It's the best end-to-end testing tool I've worked with.

A lot of companies don't have e2e-tests and many developers are not experienced with them either. This can be a huge advantage for you. There is a chance that you'll be turning from interviewee to consultant during an interview. Questions like "Oh I see that you used Cypress in one of your projects. How is your experience with it?" are not uncommon.

### Wrapping it up

In this post, we talked about the advantages of adding tests to your portfolio projects. We had a look at different kinds of testing and saw some examples of different situations.

For frontend developers, I would argue that integration tests have the biggest benefit. Having some unit tests for business logic is a good idea as well. Adding end-to-end tests can make you look like an expert.

One last tip: If you write tests, make sure to mention that in the Readme and the project summary in your CV. Make sure nobody misses it.

import Newsletter from 'components/Newsletter'

<Newsletter formId="2162732:m6v5k9"/>