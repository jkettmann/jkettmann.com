---
category: 'blog'
title: 'Apollo hooks: Why and how to use'
slug: apollo-hooks-why-and-how-to-use
date: 2019-08-14
published: true
---

Apollo's `Query` and `Mutation` components are easy to use. But since they use the render prop pattern they often decrease readability. This is especially true when you need to nest them, for example when a component needs to both query and mutate data.

Another problem is that you often end up with a container component responsible for fetching data which wraps a component that includes business logic. One example is when you want to use a hook that depends on the fetched data like below.

    <Query query={SOME_QUERY}>
      {({ data }) => {
        const transformedData = useMemo(() => transform(data));

        return <div>...</div>;
      }}
    </Query>

Using a hook here is not possible, so we need to extract the inner component. Now we have one component which only renders the `Query` and a second one that renders the data coming from the query. This demolishes one of the great benefits of GraphQL and Apollo: defining the data requirements next to the rendering of that data.

But finally, we have a better way to solve this kind of problems. With the new release of Apollo's version, 3 hooks are supported! This is a great step forward. The Apollo team obviously is also excited since they rewrote their documentation with hooks.

Since I ran into a couple of small problems when first using them I'd like to provide others a small guide on how to migrate to Apollo hooks.

Of course, it's best to see them in action. So let's start with a simple React application that contains a `Query` and a `Mutation` component.

First, we simply initialize Apollo using `apollo-boost`.

    import React from "react";
    import ReactDOM from "react-dom";
    import ApolloClient from "apollo-boost";
    import { ApolloProvider } from "react-apollo";
    import "./index.css";
    import App from "./App";

    const client = new ApolloClient({
      uri: "http://localhost:4000/graphql"
    });

    ReactDOM.render(
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>,
      document.getElementById("root")
    );

Next, we define the App component. It contains a `BOOKS_QUERY` which asks for a list of books and an `ADD_BOOK_MUTATION` which adds a book to that list.

The books are then rendered. The mutation is called when a button is clicked. It will add Stephen Kings' "The Shining" to the list of books and refetch the `BOOKS_QUERY`.

    import React from "react";
    import { Query, Mutation } from "react-apollo";
    import gql from "graphql-tag";

    const BOOKS_QUERY = gql`
      query books {
        books {
          id
          title
          author
        }
      }
    `;

    const ADD_BOOK_MUTATION = gql`
      mutation addBook($title: String!, $author: String!) {
        addBook(title: $title, author: $author) {
          id
          title
          author
        }
      }
    `;

    function App() {
      return (
        <Query query={BOOKS_QUERY}>
          {({ loading, error, data }) => {
            if (loading) return <div>Loading</div>;
            if (error) return <div>Error: {JSON.stringify(error)}</div>;

            return (
              <div>
                {data.books.map(({ id, title, author }) => (
                  <div key={id}>
                    "{title}" by "{author}"
                  </div>
                ))}

                <Mutation
                  mutation={ADD_BOOK_MUTATION}
                  variables={{
                    title: 'The Shining',
                    author: 'Steven King'
                  }}
                  refetchQueries={[{ query: BOOKS_QUERY }]}
                >
                  {addBook => <button onClick={addBook}>Add book</button>}
                </Mutation>
              </div>
            );
          }}
        </Query>
      );
    }

    export default App;

Now this doesn't look very beautiful, does it? For example, we have 11 indentations inside the button component. We could, of course, extract smaller components. At the same time, it doesn't feel like the component should appear this complicated.

So let's see how it will look like once we migrate to Apollo hooks.

With Apollo's version 3 three packages have been introduced to separate the higher-order components (`@apollo/react-hoc`), render prop components (`@apollo/react-components`) and hooks (`@apollo/react-hooks`). This allows us to have smaller bundle sizes. The hooks package is the smallest in size since the others depend on it.

The original `react-apollo` serves as an umbrella package which allows us to use all patterns in parallel.

As the first step of our migration, we need to install new dependencies. We will simulate a gradual migration to hooks like you would do with a bigger real-live application. This means we will only replace the `Query` component by the `useQuery` hook in the first step and still use the old `Mutation` component in parallel. Thus we need to upgrade the `react-apollo` package as well.

    npm i @apollo/react-hooks react-apollo@3

We can now replace the `Query` component by the `useQuery` hook. This way we can move all the query logic up before we return the JSX.

    import React from 'react';
    import { Mutation } from 'react-apollo';
    import { useQuery } from '@apollo/react-hooks';
    import gql from 'graphql-tag';

    const BOOKS_QUERY = ...;
    const ADD_BOOK_MUTATION = ...;

    function App() {
      const { loading, error, data } = useQuery(BOOKS_QUERY);

      if (loading) return <div>Loading</div>;
      if (error) return <div>Error: {JSON.stringify(error)}</div>;

      return (
        <div>
          {
            data.books.map(({ id, title, author }) => (
              <div key={id}>
                "{title}" by "{author}"
              </div>
            ))
          }

          <Mutation
            mutation={ADD_BOOK_MUTATION}
            variables={{
              title: 'The Shining',
              author: 'Steven King',
            }}
            refetchQueries={[{ query: BOOKS_QUERY }]}
          >
          {
            (addBook) => (
              <button onClick={addBook}>
                Add book
              </button>
            )
          }
          </Mutation>
        </div>
      );
    }

    export default App;

This looks already much nicer. We didn't need to change much but we already got rid of four indentations. Additionally, the ugly conditionals nested inside the JSX code are gone. Great improvement in readability! And good news: The app still works even though we only partially migrated to hooks.

Now we can also replace the `Mutation` component by the `useMutation` hook.

    import React from 'react';
    import { useQuery, useMutation } from '@apollo/react-hooks';
    import gql from 'graphql-tag';

    const BOOKS_QUERY = ...;
    const ADD_BOOK_MUTATION = ...;

    function App() {
      const { loading, error, data } = useQuery(BOOKS_QUERY);
      const [addBook] = useMutation(ADD_BOOK_MUTATION, {
        variables: {
          title: 'The Shining',
          author: 'Steven King',
        },
        refetchQueries: [{ query: BOOKS_QUERY }],
      });

      if (loading) return <div>Loading</div>;
      if (error) return <div>Error: {JSON.stringify(error)}</div>;

      return (
        <div>
          {
            data.books.map(({ id, title, author }) => (
              <div key={id}>
                "{title}" by "{author}"
              </div>
            ))
          }

          <button onClick={addBook}>
            Add book
          </button>
        </div>
      );
    }

    export default App;

This looks really clean! We have a component which looks simple but actually does a lot. It fetches data from a server, renders it and is also able to mutate that data.

What I like most is the clean separation of concerns within the component. In the upper part of the component, we handle the data. Next comes the conditional rendering of the loading and error state. Last we render the actual component.

Last but not least we can also improve our bundle size by removing the `react-apollo` package from the dependencies. Now we only need to import `ApolloProvider` from the hooks package in our entry file.

    import React from "react";
    import ReactDOM from "react-dom";
    import ApolloClient from "apollo-boost";
    import { ApolloProvider } from "@apollo/react-hooks";
    import "./index.css";
    import App from "./App";

    const client = new ApolloClient({
      uri: "http://localhost:4000/graphql"
    });

    ReactDOM.render(
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>,
      document.getElementById("root")
    );

import Newsletter from 'components/Newsletter'

<Newsletter formId="ZBGZ4J"/>
