---
category: 'blog'
title: 'Authentication with GraphQL and Passport.js: The frontend'
slug: authentication-with-graphql-and-passport-js-the-frontend
date: 2019-08-11
tags: ['Authentication', 'Passport']
published: true
---

In the [previous articles of this series](https://jkettmann.com/authentication-and-authorization-with-graphql-and-passport/) we implemented a GraphQL API that allows users to sign up and log in with their email and password as well as their Facebook account. We focused on the API and executed the mutations and queries via the Apollo-server playground.

In this article, we will write a simple React application that connects to that GraphQL API. You can find the initial code for this tutorial [here on GitHub](https://github.com/jkettmann/frontend-for-authentication-with-graphql-and-passport). This can be used to follow along while reading this post. For comparison, you can find the final code [on this branch](https://github.com/jkettmann/frontend-for-authentication-with-graphql-and-passport/tree/final-code).

## The CORS policy

Before we touch client-side code we need to adjust our GraphQL server a bit.

We will run the development server for the app on a different port than the GraphQL API. This is similar to common production setups where the API might be hosted on a subdomain of the application.

In this situation, the express server used in the GraphQL API implementation will reject requests from the frontend with a CORS error by default for security reasons. Thankfully there is a great package called `cors` to help us set the CORS policy on the server correctly.

    npm install cors

We now simply whitelist the frontend's domain inside `api/index.js` by adding it to the allowed `origin`. Additionally, we set the `credentials` options. This way the `Access-Control-Allow-Credentials` header is set which tells the browser to include cookies in its requests. This is required since we save the user's session ID inside a cookie.

    import express from 'express';
    import cors from 'cors';

    ...

    const app = express();

    const corsOptions = {
      origin: 'http://localhost:3000',
      credentials: true,
    };
    app.use(cors(corsOptions));

    ...

_Important_: By default, apollo-server-express overwrites the CORS settings defined by the middleware above. This can lead to a lot of confusion and left me scratching my head for a couple of hours. To see an effect by the cors middleware you have to set the `cors` option to `false` when calling `applyMiddleware`.

    const server = new ApolloServer({ ... });

    server.applyMiddleware({ app, cors: false });

## Setting up the React app

In the [first introductory article](https://jkettmann.com/authentication-and-authorization-with-graphql-and-passport/) we initialized the project using `create-react-app`. Now we need some additional packages. To connect to our existing GraphQL API we install the Apollo client.

    npm install apollo-boost @apollo/react-hooks

Next, we need to initialize the client and wrap our application component in the `ApolloProvider`.

    import React from 'react';
    import ReactDOM from 'react-dom';
    import ApolloClient from 'apollo-boost';
    import { ApolloProvider } from '@apollo/react-hooks';
    import './index.css';
    import App from './App';

    const client = new ApolloClient({
      uri: 'http://localhost:4000/graphql',
      credentials: 'include',
    });

    ReactDOM.render(
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>,
      document.getElementById('root')
    );

We set the `credentials` option above because the development server for the app runs on a different port than the GraphQL API. This is similar to common production setups where the API might run on a subdomain of the application. Without this option, the session cookie wouldn't be included in the request to the server.

## Rendering the current user's data

First, let's render the current user's data in the frontend. We define the query inside `src/queries.js`.

    import { gql } from 'apollo-boost';

    export const CURRENT_USER_QUERY = gql`
      query CurrentUserQuery {
        currentUser {
          id
          firstName
          lastName
          email
        }
      }
    `;

We now use Apollo's `useQuery` hook to execute the query in the `App` component. If the user is not logged in we just render a short info text for now. Otherwise, we display its data.

    import React from 'react';
    import { useQuery } from '@apollo/react-hooks';

    import { CURRENT_USER_QUERY } from './queries';

    const App = () => {
      const { loading, error, data } = useQuery(CURRENT_USER_QUERY);

      if (loading) return <div>Loading</div>;
      if (error) return <div>Error: {JSON.stringify(error)}</div>;

      const isLoggedIn = !!data.currentUser;

      if (isLoggedIn) {
        const {
          id,
          firstName,
          lastName,
          email,
        } = data.currentUser;

        return (
          <>
            {id}
            <br />
            {firstName} {lastName}
            <br />
            {email}
          </>
        );
      }

      // SIGNUP AND LOGIN GO HERE
      return <div>User is not logged in</div>;
    };

    export default App;

To start the GraphQL API and the frontend open two terminals and run each of the commands below.

    npm run start:api
    npm run start:app

Now open the app at [localhost:3000](http://localhost:3000). If you didn't implement the CORS policy correctly you will only see a strange error being rendered in the browser and CORS error in the console output.

## Facebook login

We implemented the Facebook login on the server in [this previous post](https://jkettmann.com/facebook-login-with-graphql-and-passport/). Implementing the login on the front-end is now as simple as adding a link to the `/auth/facebook` route on the server.

    import React from 'react';

    const LoginWithFacebook = () => (
      <a href="http://localhost:4000/auth/facebook">
        Login with Facebook
      </a>
    );

    export default LoginWithFacebook;

Let's render this inside the `App` when the user is not logged in.

    ...

    import LoginWithFacebook from './LoginWithFacebook';

    const App = () => {
      ...

      // SIGNUP AND LOGIN GO HERE
      return <LoginWithFacebook />;
    };

    export default App;

Last we need to touch the server-side code one more time. The redirects after the Facebook login are still pointing to the Apollo playground at `http://localhost:4000/graphql`. Since we have a frontend now we want to be redirected there instead. Open `api/index.js` and change the following lines.

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
      successRedirect: 'http://localhost:3000',
      failureRedirect: 'http://localhost:3000',
    }));

When you open the app in your browser now you should see the Facebook link. Clicking it should send you to a Facebook login screen. After login, you should be redirected back to the app and see your account's data being rendered.

Now that we have a working Facebook login implemented let's continue with signing up and logging in with a password. This will be a bit more effort since we will use GraphQL mutations to send the data to the API and update the client-side cache with their results.

## Signup with password

We start by defining the signup mutation. Create a new file `src/mutations.js`. This will contain all mutations that will be used by our app. If you followed the other articles the mutation definitions will be familiar to you. We might extract the fields `id`, `firstName`, `lastName` and `email` into a fragment and reuse it inside the `currentUser` query and the mutations. But for simplification, we rather duplicate them here.

    import { gql } from 'apollo-boost';

    export const SIGNUP_MUTATION = gql`
      mutation Signup(
        $firstName: String!,
        $lastName: String!,
        $email: String!,
        $password: String!
      ) {
        signup(
          firstName: $firstName,
          lastName: $lastName,
          email: $email,
          password: $password
        ) {
          user {
            id
            firstName
            lastName
            email
          }
        }
      }
    `;

Now we can implement the signup button using the above mutation. We use react-apollo's `useMutation` hook. For ease of implementation, we don't use a form to enter the user data but rather a hard-coded object. This is passed to the mutation as variables.

    import React from 'react';
    import { useMutation } from '@apollo/react-hooks';

    import { SIGNUP_MUTATION } from './mutations';

    const user = {
      firstName: 'Jen',
      lastName: 'Barber',
      email: 'jen@barber.com',
      password: 'qwerty'
    };

    const SignupWithCredentials = () => {
      const [signup] = useMutation(
        SIGNUP_MUTATION,
      )

      return (
        <button onClick={() => signup({ variables: user })}>
          Signup as Jen Barber
        </button>
      );
    };

    export default SignupWithCredentials;

This button is already able to send the mutation successfully to the API now. But we won't automatically see the authenticated user's data in the UI yet. We need to update the Apollo store with the mutation result first. We can achieve this by using the mutation hook's `update` option. This is a function that gets called after the mutation was successful and receives the cache and the mutation result as parameters.

    ...
    import { CURRENT_USER_QUERY } from './queries';

    const SignupWithCredentials = () => {
      const [signup] = useMutation(
        SIGNUP_MUTATION,
        {
          update: (cache, { data: { signup }}) => cache.writeQuery({
            query: CURRENT_USER_QUERY,
            data: { currentUser: signup.user },
          }),
        }
      );

      ...
    };

As with the Facebook login let's add this to the `App`.

    ...

    import SignupWithCredentials from './SignupWithCredentials';

    const App = () => {
      ...

      // SIGNUP AND LOGIN GO HERE
      return (
        <>
          <LoginWithFacebook />
          <SignupWithCredentials />
        </>
      );
    };

    export default App;

Now you can head again to your browser and try it out yourself.

_Exercise_: At this point, you can try and implement a logout button on your own. It should be fairly similar to the signup button. We will do this at the end of this post together as well.

## Login with password

The login button will basically be the same as the signup button only with fewer variables. Let's start again by defining the login mutation in `src/mutations.js`.

    export const LOGIN_MUTATION = gql`
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          user {
            id
            firstName
            lastName
            email
          }
        }
      }
    `;

Now implement the login button.

    import React from 'react';
    import { useMutation } from '@apollo/react-hooks';

    import { CURRENT_USER_QUERY } from './queries';
    import { LOGIN_MUTATION } from './mutations';

    const user = {
      email: 'maurice@moss.com',
      password: 'abcdefg',
    };

    const LoginWithCredentials = () => {
      const [login] = useMutation(
        LOGIN_MUTATION,
        {
          update: (cache, { data: { login }}) => cache.writeQuery({
            query: CURRENT_USER_QUERY,
            data: { currentUser: login.user },
          }),
        }
      )

      return (
        <button onClick={() => login({ variables: user })}>
          Login as Maurice Moss
        </button>
      );
    };

    export default LoginWithCredentials;

And finally, add it to the app again.

    ...

    import LoginWithCredentials from './LoginWithCredentials';

    const App = () => {
      ...

      // SIGNUP AND LOGIN GO HERE
      return (
        <>
          <LoginWithFacebook />
          <SignupWithCredentials />
          <LoginWithCredentials />
        </>
      );
    };

    export default App;

When you head back to the browser you should see the login button now. When clicking it the login mutation should be sent to the GraphQL API and the user's data rendered in the UI.

# Logout

As promised we will implement the logout button together. We again need to define the mutation in `src/mutations.js` first.

    export const LOGOUT_MUTATION = gql`
      mutation Logout {
        logout
      }
    `;

Now we implement the logout button. This sends the `logout` mutation and sets the current user inside the cache to `null` afterward.

    import React from 'react';
    import { useMutation } from '@apollo/react-hooks';

    import { CURRENT_USER_QUERY } from './queries';
    import { LOGOUT_MUTATION } from './mutations';

    const LogoutButton = () => {
      const [logout] = useMutation(
        LOGOUT_MUTATION,
        {
          update: (cache) => cache.writeQuery({
            query: CURRENT_USER_QUERY,
            data: { currentUser: null },
          }),
        },
      );

      return (
        <button onClick={logout}>
          Logout
        </button>
      );
    };

    export default LogoutButton;

Finally, we render it next to the authenticated user's data.

    ...

    import LogoutButton from './LogoutButton';

    const App = () => (
      <Query query={CURRENT_USER_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading</div>;
          if (error) return <div>Error: {JSON.stringify(error)}</div>;

          const isLoggedIn = !!data.currentUser;

          if (isLoggedIn) {
            ...

            return (
              <>
                {id}
                <br />
                {firstName} {lastName}
                <br />
                {email}
                <br />
                <LogoutButton />
              </>
            );
          }

          // SIGNUP AND LOGIN GO HERE
          return ...;
        }}
      </Query>
    );

    export default App;

    import React from 'react';
    import { useQuery } from '@apollo/react-hooks';

    import LoginWithFacebook from './LoginWithFacebook';
    import SignupWithCredentials from './SignupWithCredentials';
    import LoginWithCredentials from './LoginWithCredentials';
    import LogoutButton from './LogoutButton';

    import { CURRENT_USER_QUERY } from './queries';

    const App = () => {
      const { loading, error, data } = useQuery(CURRENT_USER_QUERY);

      if (loading) return <div>Loading</div>;
      if (error) return <div>Error: {JSON.stringify(error)}</div>;

      const isLoggedIn = !!data.currentUser;

      if (isLoggedIn) {
        const {
          id,
          firstName,
          lastName,
          email,
        } = data.currentUser;

        return (
          <>
            {id}
            <br />
            {firstName} {lastName}
            <br />
            {email}
            <br />
            <LogoutButton />
          </>
        );
      }

      // SIGNUP AND LOGIN GO HERE
      return (
        <>
          <LoginWithFacebook />
          <SignupWithCredentials />
          <LoginWithCredentials />
        </>
      );
    };

    export default App;

Now you should be able to switch between logged-in and logged-out state by clicking the corresponding buttons.

At this point, we have a React app that connects to our GraphQL API using the Apollo client. A user can signup and authenticate via the frontend using their password or Facebook account. The API and the app run on different ports which is similar to common production scenarios where both run on different subdomains and thus need a CORS policy.

The final code for this tutorial can be found [here](https://github.com/jkettmann/frontend-for-authentication-with-graphql-and-passport/tree/final-code).

import Newsletter from 'components/Newsletter'

<Newsletter formId="ZBGZ4J"/>
