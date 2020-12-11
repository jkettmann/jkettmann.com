---
category: 'blog'
title: Common mistakes when initializing Apollo's local state with default data
slug: common-mistakes-when-initializing-apollos-local-state-with-default-data
date: 2019-06-25
tags: ["@client directive", "local state"]
published: true
---

Handling local state with Apollo can be quite verbose. You might think you did everything correctly but still, your query returns an empty object without any warning or error.

The first problems can already occur when you initialize the Apollo cache with default data. If you get it right immediately this is fairly easy. But there are a few obstacles that you may encounter.

Let's start with a working example. We use `create-react-app` to set up our project and install some additional dependencies.

    npx create-react-app initializing-local-apollo-state
    cd ./initializing-local-apollo-state
    npm install apollo-boost react-apollo graphql


Open `src/App.js` and replace the content by the following code.

    import React from 'react';
    import ApolloClient, { gql } from 'apollo-boost';
    import { ApolloProvider, Query } from 'react-apollo';

    const client = new ApolloClient({ resolvers: {} });

    const BOOK_QUERY = gql`
      {
        book @client {
          id
          title
          author
        }
      }
    `;

    function App() {
      return (
        <ApolloProvider client={client}>
          <Query query={BOOK_QUERY}>
            {({ data, loading, error }) => {
              if (loading) {
                return <div>Loading</div>
              }
              if (error) {
                return <div>{error}</div>
              }

              return (
                <div>
                  Book: {JSON.stringify(data.book)}
                </div>
              )
            }}
          </Query>
        </ApolloProvider>
      );
    }

    export default App;


We have a simple React application that attempts to fetch a book. Since we want to get the data from the local Apollo state we need to annotate the `book` field inside the `BOOK_QUERY` with the `@client` directive. This tells Apollo not to send a request to a server but to rather look for the data inside the client side cache.

We don't add type definitions or resolvers to the Apollo client since it's not necessary for this example.

When you run the app you won't see any book data yet because we still need to initialize the Apollo store when the app is loaded. See for yourself by running

    npm start


To initialize the client-side cache with a default data set we can call the Apollo client's `writeData` function. The data object should contain everything we want to query plus an additional `__typename` field which corresponds to the type of the object. Add the following code to `src/App.js`.

    client.writeData({
      data: {
        book: {
          __typename: 'Book',
          id: '1',
          title: 'A book title',
          author: 'A book author',
        }
      }
    });


When you refresh the page you should now see the data we defined above. See this [codesandbox](https://codesandbox.io/embed/bold-galileo-kb53u) for the complete code.

## What could possibly go wrong?

This seems fairly simple, right? But if you make a mistake here you might end up in a situation where you get a warning, or worse, the data you're expecting is just not there at all. Following are common mistakes when writing data to the Apollo cache.

### Forgetting the typename

Try to comment out the typename field and just like this all the book data is suddenly gone.

    client.writeData({
      data: {
        book: {
          // __typename: 'Book',
          id: '1',
          title: 'A book title',
          author: 'A book author',
        }
      }
    });


When you have a look in the console output of your browser you will see a warning *Missing field __typename ...*. So at least we are pointed in the right direction. The next mistake can be much more confusing.

### Forgetting a field that is included in the query

Try to comment out one of the fields that are included in the query. Let's take the `id` field.

    client.writeData({
      data: {
        book: {
          __typename: 'Book',
          // id: '1',
          title: 'A book title',
          author: 'A book author',
        }
      }
    });


And again no data is being rendered. This time even without a warning. I guess you can imagine forgetting a single field or going crazy because of a small typo like `titel` instead of `title`.

As you saw above it's you can easily make a mistake when initializing client-side state with Apollo. I hope this post helps you to not end up desperately scratching your head. If you liked what you read don't forget to subscribe to my newsletter below. And if you find more problems like the ones above contact me and I'll add them to this list.

import Newsletter from 'components/Newsletter'

<Newsletter formId="1499362:x4g7a4"/>