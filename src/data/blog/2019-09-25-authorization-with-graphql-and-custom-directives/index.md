---
category: 'blog'
title: Authorization with GraphQL and custom directives
slug: authorization-with-graphql-and-custom-directives
date: 2019-09-25
tags: ["Authorization", "Authentication"]
published: true
---

Authorization is a crucial part of most applications. Still, access-control is not part of the GraphQL spec. This leaves developers with different options. Since authorization touches a lot of different areas of your typical app selecting one of these options can be a tough choice to make.

In this article, we will have a closer look at how to implement authorization with a custom directive. Directives are a great way to execute a piece of logic before or after a field resolves. All fields that should use a directive need to be annotated in the schema. Even though there are some great examples for how to use directives in the Apollo documentation it still can be confusing to implement one yourself.

If you want to follow along you can find the initial code in [this commit](https://github.com/jkettmann/authorization-with-graphql-and-custom-directives/tree/faef9f5b2ec161aad1380149751cd45336de1059).

## Defining the directive inside the schema

Our initial schema contains a `User` which has a couple of fields including a role and a message field. The Query's `currentUser` field represents the currently logged in user.

    enum Role {
      ADMIN
      OWNER
      USER
    }

    type Message {
      id: ID
      receiverId: ID
      senderId: ID
      text: String
    }

    type User {
      id: ID
      firstName: String
      lastName: String
      email: String
      role: Role
      message(id: ID!): Message
    }

    type Query {
      currentUser: User
    }


Defining a directive inside the GraphQL schema is very straightforward.

    directive @auth(
      requires: Role!,
    ) on FIELD_DEFINITION


We define a directive with the name `auth` which can be used on single fields. The directive expects a parameter `requires` of type Role. This is the role a user needs to access the field's data.

Now we can use the directive inside the schema to restrict access to the `currentUser` and the `role` fields. Let's say only logged in user's should have access to `currentUser` and the `role` field should be restricted to admins.

    type User {
      id: ID
      firstName: String
      lastName: String
      email: String
      role: String @auth(requires: ADMIN)
      message(id: ID!): Message
    }

    type Query {
      currentUser: User @auth(requires: USER)
    }


That's it. As you can see adding an authentication directive on the schema side is fairly simple. But how about the implementation of the directive?

## The authentication directive

To implement a directive with Apollo server we need to extend the `SchemaDirectiveVisitor` class. This might look complicated at first. But in the end, we simply extend the resolver of annotated fields with some custom authentication logic.

    import { AuthenticationError, SchemaDirectiveVisitor } from 'apollo-server-express';
    import { defaultFieldResolver } from 'graphql';

    class AuthDirective extends SchemaDirectiveVisitor {
      visitFieldDefinition(field) {
        const requiredRole = this.args.requires;
        const originalResolve = field.resolve || defaultFieldResolver;

        field.resolve = function(...args) {
          const context = args[2];
          const user = context.getUser() || {};
          const isAuthorized = user.role === requiredRole;

          if (!isAuthorized) {
            throw new AuthenticationError(`You need following role: ${requiredRole}`);
          }

          return originalResolve.apply(this, args);
        }
      }
    }

    export default AuthDirective;


Let me explain in more detail: Our goal here is to restrict access to single fields in the schema like `currentUser` or `role`. We, therefore, need to implement the `visitFieldDefinition` method.

First, we get the required role from the directive's arguments. The arguments name `requires` is the same as we used in the schema.

Usually, we don't write a resolver for every field. Thus we use the `defaultFieldResolver` provided by the `graphql` package as default. `defaultFieldResolver` is simply returning the value for the given field from its parent object (here for example `user.role`).

Next, we overwrite the field's resolve function. In the new resolver, we get the currently logged in user from the GraphQL context. We will see how the user gets into the context in the next chapter.

Now we simply check if the user's role and the role required by the field match. If the user is not authorized to read the field we throw an `AuthenticationError`. Otherwise, we call the field's original resolve function and return the value.

## Setting up Apollo Server

At this point, we implemented the authentication directive and used in our schema. Finally, set up the Apollo server to make use of the directive.

    import { ApolloServer } from 'apollo-server';
    import User from './User';
    import Message from './Message';
    import typeDefs from './typeDefs';
    import resolvers from './resolvers';
    import AuhtDirective from './AuthDirective';

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      schemaDirectives: {
        auth: AuhtDirective,
      },
      context: ({ req }) => {
        const token = req.headers.authorization;
        const currentUser = User.getUserByToken(token);
        return { user: currentUser, User, Message }
      },
    });

    server.listen().then(({ url }) => console.log(`🚀 Server ready at ${url}`));


We set the Apollo server's `schemaDirectives` option to make use of our directive. The key `auth` is the name of the directive we want to use inside the schema, `AuthDirective` is the class that we defined above. Note that we don't instantiate the class.

We added a very simple authorization when creating the context. We read the `authorization` header from the incoming request and get the corresponding user. This user is now set to the context. Thus, the currently logged in user is available in our directive for the role comparison. If you are wondering about a more complex and production-suitable approach to authorization with GraphQL you can check the article about [Authorization with GraphQL and Passport](https://jkettmann.com/authentication-and-authorization-with-graphql-and-passport/).

We don't use a real database in this tutorial to focus on the authentication. The `User` model looks as follows:

    const users = [
      {
        id: '1',
        token: 'token-for-maurice-moss',
        firstName: 'Maurice',
        lastName: 'Moss',
        email: 'maurice@moss.com',
        password: 'abcdefg',
        role: 'USER',
      },
      {
        id: '2',
        token: 'token-for-roy-trenneman',
        firstName: 'Roy',
        lastName: 'Trenneman',
        email: 'roy@trenneman.com',
        password: 'imroy',
        role: 'ADMIN',
      },
      {
        id: '3',
        token: 'token-for-jen-barber',
        firstName: 'Jen',
        lastName: 'Barber',
        email: 'jen@barber.com',
        password: 'qwerty',
        role: 'USER',
      }
    ];

    export default {
      getUserByToken: (token) => users.find((user) => user.token === token),
    };


And this is the `Message` model which is used in the resolvers.

    const messages = [
      {
        id: '1',
        senderId: '2',
        receiverId: '3',
        text: 'Hey Jen, how are you doing?',
      },
      {
        id: '2',
        senderId: '3',
        receiverId: '2',
        text: 'Hi Roy, I\'m doing great! How are you?',
      },
    ];

    export default {
      getById: (id) => messages.find((message) => message.id === id),
    };


The resolvers look like following. The `currentUser` field is resolved from the context. If this unclear see how we created the context when setting up the server above. The user's `message` has its own resolver. It uses our `Message` model to get a message according to a given ID.

    const resolvers = {
      User: {
        message: (user, args, context) => context.Message.getById(args.id)
      },
      Query: {
        currentUser: (parent, args, context) => context.user
      },
    };

    export default resolvers;


Now run the server via `npm start` and open the GraphQL playground at [localhost:4000/graphql](http://localhost:4000/graphql). If you try to get the current user without an `authorization` header set the API will return an error. The same is true if you use a wrong token.

    {
      currentUser {
        id
        firstName
        lastName
      }
    }


Now set the following inside the `HTTP headers` tab on the bottom of the playground.

    {
      "authorization": "token-for-maurice-moss"
    }


Depending on the role of the user that you logged in with you will be able to fetch the `role` field or receive an error.

    {
      currentUser {
        id
        firstName
        lastName
        role
      }
    }


If you also add the `role` field to the query you will again get an error since this user doesn't have the admin role. Only the user with the token `token-for-roy-trenneman` can read the `role` field.

Awesome! We successfully implemented an authentication directive. This works great when we have static access control meaning that a certain role always has access to certain fields.

But what about the message field? Try to run following query with the authorization header set to `token-for-maurice-moss`.

    {
      currentUser {
        id
        message(id: "2") {
          senderId
          receiverId
          text
        }
      }
    }


The current user is clearly neither the sender nor the receiver of this message. But still, he has access. This shouldn't be. How can we fix this?

## Dynamic access control

Let's say we only want to expose the message data when the currently logged in user is the receiver of that message. The difference to the previous example is that we can't base our decision whether or not to expose the data on a certain role. We first need to get the message data and only then can decide if the current user is authorized.

Before we adjust the directive we first add a new role `OWNER` and annotate the user's `message` field with the auth directive.

    enum Role {
      ADMIN
      OWNER
      USER
    }

    type User {
      id: ID
      firstName: String
      lastName: String
      email: String
      role: Role @auth(requires: ADMIN)
      message(id: ID!): Message @auth(requires: OWNER)
    }


Now we need to adjust the `AuthDirective`.

    class AuthDirective extends SchemaDirectiveVisitor {
      visitFieldDefinition(field) {
        const requiredRole = this.args.requires;
        const originalResolve = field.resolve || defaultFieldResolver;

        field.resolve = async function(...args) {
          const context = args[2];
          const user = context.user || {};
          const requiresOwner = requiredRole === 'OWNER';
          const isUnauthorized = !requiresOwner && user.role !== requiredRole;

          if (isUnauthorized) {
            throw new AuthenticationError(`You need following role: ${requiredRole}`);
          }

          const data = await originalResolve.apply(this, args);

          if (requiresOwner) {
            assertOwner(field.type.name, user, data);
          }

          return data;
        }
      }
    }


There are basically two changes that we need to add:

- Line 10: We only throw the general authentication error when the `OWNER` role is not required
- Line 16-22: We resolve the field. In case the owner role is required, we assert that the current user is the owner of the data.

The `assertOwner` function looks like this

    const assertOwner = (typename, user, data) => {
      if (typename === 'Message' && user.id !== data.receiverId) {
        throw new AuthenticationError('You need to be the receiver of the message');
      }
    }


We check if the current field type is `Message` and throw an error if the current user's id does not match the message's receiver ID.

Again try to run the query from the last chapter with the authorization header set to `token-for-maurice-moss`. This time you should receive an error and the message field should be `null`.

    {
      currentUser {
        id
        message(id: "2") {
          senderId
          receiverId
          text
        }
      }
    }


Great job! We successfully restricted access to the private `message` field to its receiver.

## Final thoughts

Directives are great when it comes to generic use-cases like the static `USER` and `ADMIN` roles in the first chapter. They also work for more dynamic situations like authorizing access to a message using the `OWNER` role.

However, there is also a downside: For controlling access to the message we already introduced very specific logic. We found a somewhat generic way which is suitable to fit more use-cases by introducing the `assertOwner` function. But still, we would end up with a lot of conditionals inside that function for different data types when we have complex apps. We also might need to introduce more dynamic roles which would further complicate the directive.

Another approach might be to introduce separate directives: one for role-based access, another one for resource owners and so on. This would allow us to have very specific directives. At the same time, we might end up needing a combination of those.

Apart from this, some developers claim that directives decrease the readability of the schema. This is certainly true to a certain degree. At the same time seeing what fields require which roles directly in the schema is very descriptive. How much these arguments influence your decision for or against directives is more a matter of personal taste.

## Summary

In this article, we had a look at how to implement access-control with GraphQL directives for different use-cases. We found that they are a great way to implement role-based authorization. More complex situations can still be handled with directives but the implementation of a maintainable solution might get trickier.

If you want to have a look at the complete code you can find the repository [here on GitHub](https://github.com/jkettmann/authorization-with-graphql-and-custom-directives). It also includes an example of authorizing a mutation in case you were wondering.

I hope this article was helpful and you enjoyed reading it. I'm always happy about further questions or feedback.
