---
category: 'blog'
title: Inside a dev's mind - How do you plan a UI feature?
slug: how-do-you-plan-a-ui-feature
date: 2020-04-18
tags: ["Inside a dev's mind"]
selfQualifierTags: ["pro-skills"]
selfQualifierSort: 10
published: true
---

When developing a new feature many of us developers tend to jump into it via programming instead of planning the architecture out first. It may seem easier to start programming. But this often ruins us. We take the wrong approach and don't realize it until we've wasted too much time trying to implement it.

So planning upfront it is! But how does that look like?

If you followed some of my posts you will know that I love to show how I work by giving an example. So in this post, we'll have a look at a feature as you could encounter it in a real work environment. We have acceptance criteria, a design and data to render.

I will explain step by step what I was looking at and what I was thinking. The process was much quicker than writing it down and I'd probably done a lot of this in my head. But here it's in a written form so you can follow along.

> Note: I'm mostly working with React. I think most of this post is framework-agnostic. But I'm not sure how much React-thinking went into this planning.

## Challenge

Before we start and have a look at the feature I'd like to invite you to a small challenge!

Think about how you would implement this feature. Write down bullet points of what you're looking at and what you're thinking about and share it in the comments below.

I think it can be a nice exercise and fun to compare our solutions.

Let's start!

## The feature

We want to build a heatmap that shows at what weekday and hour how many posts on a website like Reddit or dev.to have been created.

![heatmap](/content/images/2020/04/heatmap.png)

> I took this feature including the designs from a [new course about becoming job-ready for working in professional dev teams](https://ooloo.io). Check it out if you're interested.

We also have a list of acceptance criteria that the feature needs to fulfill:

1. The number in the heatmap cells represents the number of the posts at a given weekday and hour
2. When a cell is clicked the corresponding posts are displayed below the heatmap

We don't need to take responsiveness into account and we only support newer browsers.

We assume here that the API call has already been implemented and that it gives us data in this format.

    [
      {
        "id": "c8drjo",
        "timeCreated": 1561846192,
        "title": "V8 7.6 Release: \"In V8 v7.6, we’ve overhauled our JSON parser to be much faster at scanning and parsing JSON. This results in up to 2.7× faster parsing of data served by popular web pages.\"",
        "score": 407,
        "numComments": 27,
        "author": "OlanValesco",
        "url": "https://v8.dev/blog/v8-release-76"
      },
      {
        "id": "cbizuk",
        "timeCreated": 1581204235,
        "title": "Bouncing balls simulation using plain JavaScript (demo link and detailed description in the README)",
        "score": 146,
        "numComments": 29,
        "author": "mtrajk93",
        "url": "https://github.com/MTrajK/bouncing-balls"
      },
      {
        "id": "fjodsi",
        "timeCreated": 1577574509,
        "title": "[AskJS] How are you deploying your front-end + node apps?",
        "score": 120,
        "numComments": 83,
        "author": "hellohi315",
        "url": "https://www.reddit.com/r/javascript/comments/egxt0v/askjs_how_are_you_deploying_your_frontend_node/"
      },
      {
        "id": "fe9mke",
        "timeCreated": 1570321655,
        "title": "JS13k Results Are Out! (13k JavaScript Game Jam)",
        "score": 128,
        "numComments": 24,
        "author": "Slackluster",
        "url": "https://2019.js13kgames.com/#winners"
      },
      ...
    ]


---

**READ UNTIL HERE IF YOU WANT TO TAKE THE CHALLENGE**

---

## Getting an overview

So, first of all, let's understand the problem. I tend to have a look at the design first to get a better understanding of the feature.

![heatmap](/content/images/2020/04/heatmap.png)

There seem to be three parts: A row displaying the hours of a day at the top and a column displaying the weekdays on the left. Then there is one cell for each combination of weekday and hour that contains a number.

According to the acceptance criteria, the cells contain the number of posts for the corresponding day and hour.

How does the data relate to that?

    [
      {
        "id": "c8drjo",
        "timeCreated": 1561846192,
        "title": "V8 7.6 Release: \"In V8 v7.6, we’ve overhauled our JSON parser to be much faster at scanning and parsing JSON. This results in up to 2.7× faster parsing of data served by popular web pages.\"",
        "score": 407,
        "numComments": 27,
        "author": "OlanValesco",
        "url": "https://v8.dev/blog/v8-release-76"
      },
      {
        "id": "cbizuk",
        "timeCreated": 1581204235,
        "title": "Bouncing balls simulation using plain JavaScript (demo link and detailed description in the README)",
        "score": 146,
        "numComments": 29,
        "author": "mtrajk93",
        "url": "https://github.com/MTrajK/bouncing-balls"
      },
      {
        "id": "fjodsi",
        "timeCreated": 1577574509,
        "title": "[AskJS] How are you deploying your front-end + node apps?",
        "score": 120,
        "numComments": 83,
        "author": "hellohi315",
        "url": "https://www.reddit.com/r/javascript/comments/egxt0v/askjs_how_are_you_deploying_your_frontend_node/"
      },
      {
        "id": "fe9mke",
        "timeCreated": 1570321655,
        "title": "JS13k Results Are Out! (13k JavaScript Game Jam)",
        "score": 128,
        "numComments": 24,
        "author": "Slackluster",
        "url": "https://2019.js13kgames.com/#winners"
      },
      ...
    ]


We have an array of objects that seem to represent the posts since there are an author and a title field. Each post contains a number `timeCreatedUtc`.

That's a pretty big number and looks a lot like a timestamp. But somehow it feels a bit short. Maybe it's a timestamp in seconds?

To check that suspicion we can open our browser's console or run `node` in a terminal, take one of the `timeCreatedUtc` and enter `new Date(1561846192)`.

The result is `1970-01-19T01:50:46.192Z`, so most probably we're right. The same number times 1000 results in `2019-06-29T22:09:52.000Z`.

Prove enough.

> Mental note: We need to convert `timeCreatedUtc` to milliseconds if we want to display a date anywhere.

Let's have another look at the data to see if something strikes our eye: nothing in particular, only that the list doesn't seem to be ordered in any obvious way.

## Mapping the data

First, let's remember the task again: we need to render the number of posts for each combination of weekday and hour inside a heatmap cell.

Since we have one array of posts we somehow need to group the posts by day and hour. What options do we have?

**First option:** We could use an object with the weekday number 0 to 6 standing for Sunday to Saturday as keys. Inside that object we can nest other objects with the hours as key and the number of posts as value. That would look like following:

    {
      0: { // Sunday
        0: 5, // 12am: 5 posts
        1: 3, // 1am: 3 posts
        2: 14, // 2am: 14 posts
        ...
      },
      1: { // Monday
        0: 2, // 12am: 2 posts
        ...
      },
      ...
    }


This option doesn't make a lot of sense since we can use an array as well. Wouldn't make a difference for accessing the data but we could iterate through the values easier.

> I honestly have to admit that I jumped on this option the first time I looked at this feature. Ooopsie, fell in the no-planning-trap myself...

**Second option:** As mentioned we could use an array instead. This looks and behaves very similarly.

    [
      [ // Sunday
        5, // 12am: 5 posts
        3, // 1am: 3 posts
        14, // 2am: 14 posts
        ...
      ],
      [ // Monday
        2, // 12am: 2 posts
        ...
      ],
      ...
    ]


**Third option:** Instead of a nested object or 2D array, we could also use a flat object.

The only problem that we have is that we need to identify each combination of day and hour via a unique key. We could separate a key like `3-16` that would represent... counting on fingers... Wednesday at 4 pm.

We could also use a number like `316`. Seems easier.

How could we create this number? `100 * weekday + hour` would make sense. And to reverse the key into a weekday and hour we could use `Math.floor(key / 100)` for weekdays and `key % 100` for hours.

The flat object would look like this:

    {
      // Sunday
      1: 5, // 12am: 5 posts
      2: 3, // 1am: 3 posts
      3: 14, // 2am: 14 posts
      ...,
      /// Monday
      101: 2, // 12am: 2 posts
      ...
    }


Why not? A flat object is easier to handle. Although the calculations for creating and reversing the key are a bit annoying.

**Fourth option:** Since we're at it: we should be able to use a 1D array as well.

Same technique as with the flat object only that we need to use a different base. The indices `0 - 23` would belong to Sunday 12 am to 11 pm, `24 - 47` to Saturday and so on.

Calculating the index for a day and hour should be possible via `24 * weekday + hour`. Reversing an index can be done by `Math.floor(index / 24)` for the weekday and `index % 24` for the hour.

In this case our array would look really simple:

    [
      // Sunday
      5, // 12am: 5 posts
      3, // 1am: 3 posts
      14, // 2am: 14 posts
      ...,
      // Monday
      2, // 12am: 2 posts
      ...
    ]


I guess we can eliminate the flat object already in favor of the 1D array.

So, for now, we are left with two options: the 1D and 2D array.

    [5, 3, 14, ..., 2, ...]

    vs

    [
      [5, 3, 14, ...],
      [2, ...]
      ...
    ]


The former looks simpler but the index handling is a bit complicated. The latter is a nested array. Just doesn't feel so beautiful...

## Matching the data options with the design

Maybe we can make a final decision about how to construct our heatmap data by having another look at the design. What options do we have to split the design into different components?

The **first option** that comes to my mind is separating the heatmap into a top row for the hours, a left column for the weekdays and a row of heatmap cells for each weekday.

![heatmap-option-1](/content/images/2020/04/heatmap-option-1.png)

The **second option** would be similar except that we don't render the heatmap cells in rows but rather in one iteration.

![heatmap-option-2](/content/images/2020/04/heatmap-option-2.png)

We could achieve that by wrapping the cells into a flex container and using `flex-wrap`. Together with a fixed size of the container and the cells, this should be easily done.

Then there is a **third option**. This is again similar to the first option but this time we treat each weekday plus the corresponding heatmap cells as a row.

![heatmap-option-3](/content/images/2020/04/heatmap-option-3.png)

The first and third option where we split the heatmap into rows seems like a good fit for the 2D array since we already have the hours grouped by weekday. The second option would point us to using the 1D array.

Are there any advantages of one over the other?

**Performance considerations:** In the future, performance might be an issue. For example, if the heatmap cells would be more complex to render. Honestly, the probability for this doesn't seem so high.

But if we would need to keep track of a hover state in JS, for example, to show the data for a cell below the heatmap, we might run into performance issues. This doesn't seem too far away from the second acceptance criteria: "When a cell is clicked the corresponding posts are displayed below the heatmap".

Splitting the heatmap into cells would have a benefit here since we could only re-render the affected rows by using `React.memo`.

**Component complexity:** In every case we would need one component each for the hour, weekday, and heatmap cell.

The 1D array would be very simple to render. Apart from the above components, we would need one component for the top hour row, one for the left weekday column, and a wrapper around the heatmap cells.

The 2D array options would each require a top hour row. The first option would need a left weekday column as well as a heatmap row. A separate weekday column wouldn't be needed when we selected the third option though.

**Styling:**

This is more of a feeling, but somehow the third option with rows including the weekday plus heatmap cells seems to be the easiest to style.

Probably because it seems less risky to get an offset between the weekday and the heatmap cells. We would simply stack rows on top of each other.

I would pick the third option because of the potential performance benefits, the complexity, and the styling.

![heatmap-option-3](/content/images/2020/04/heatmap-option-3.png)

## How to style the component

By now we have decided to use a 2D array and render the heatmap in separate rows. What about styling?

We could use an HTML or CSS table. Maybe also a grid!? But it's probably simplest if we render each row as `div` on top of each other. We can use `display: flex` to render the cells in one line.

The weekday cells get a fixed width. The heatmap cells a fixed width and height. And the hour cells should be double the width of a heatmap cell.

## Reviewing the acceptance criteria

Let's have a last look at the acceptance criteria (AC). Did we get all of them by now?

1. The number in the heatmap cells represents the number of the posts at a given weekday and hour
2. When a cell is clicked the corresponding posts are displayed below the heatmap

The first AC is covered. We have a 2D array. If we wanted to get the number of posts for, let's say, Monday 12 pm we would access it with `data[1][12]`.

I forgot about the second AC, I have to admit. It's not clear how we should render the posts, but we need access to the selected heatmap cell either in the main heatmap component or its parent.

Inside a heatmap cell, we know the corresponding weekday and hour. So on clicking a cell, we can store these numbers inside a state variable in the main heatmap component. The state variable could look like this:

    selected = { day: 1, hour: 12 }


The problem is that `data[selectedWeekday][selectedHour]` gives us the number of posts, not the posts themselves. So instead of storing the number of posts on a day and hour in a 2D array, we should rather store an array of the posts themselves. This would make it a 3D array that looks as follows.

    [
      [ // Sunday
        [ // 12am - 1am
          { id: "c8drjo", title: "V8 7.6 Release...", ... },
          { id: "cbizuk", title: "Bouncing balls...", ... },
          ...
        ],
        [ // 1am - 2am
          { id: ... },
          ...
        ],
        // 22 more arrays of posts (posts per hour)
      ],
      // 6 more arrays (posts per weekday and hour)
    ]


This looks complicated but will still work for our purposes. `data[selectedWeekday][selectedHour]` will give us now a list of posts that we can render below the heatmap. Second AC: check!

When we think about our 1D array solution at this point we can see that it would have another advantage now: Apart from a simpler data structure we only would store one selected index inside the state variable instead of an object containing two indices.

Since we didn't implement anything yet we still have the chance to change our approach with low additional costs.

## Wrapping it up

Via our planning session, we were able to uncover some details that we probably only would have thought of during the implementation phase.

Of course, you don't need to do such detailed planning on paper for every feature. Some of these things should be discussed in a team planning session already. The rest can often be done in your head. For complex features, it's advisable though to take out a pen and start sketching or draw some diagrams on your computer.

import Newsletter from 'components/Newsletter'

<Newsletter formId="1499362:x4g7a4"/>