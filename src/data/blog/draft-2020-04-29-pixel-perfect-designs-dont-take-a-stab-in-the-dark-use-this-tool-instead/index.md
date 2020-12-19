---
category: 'blog'
title: "Pixel-perfect designs: Don't take a stab in the dark! Use this tool instead."
slug: pixel-perfect-designs-dont-take-a-stab-in-the-dark-use-this-tool-instead
date: 2020-04-29
published: false
---

When you start working with designs you may be tempted to use the CSS styles that the design tool of choice offers you.

I took this design of a header from the course on ooloo.io.

![1-header](./1-header.png)

It is hosted on Zeplin where the developers can easily see all the colors, fonts, spacing, and sizes.

Here you can see the margin between the header links.

![2-header-size](./2-header-size.png)

Zeplin even offers you a set of CSS styles that you can simply copy & paste to your app.

![3-header-css](./3-header-css.png)

There are a lot of unnecessary styles admittedly. Some should probably rather be defined globally like the font-size. Still nice to have this.

But what happens when we apply these styles to our application?

![5-header-overlay](./5-header-overlay.png)

This is an overlay of the design on top of the real application. Can you see the blurry links? Maybe it's a bit hard to see. Here is a close-up.

![4-header-links-overlay](./4-header-links-overlay.png)

Now it's obvious, right? This blurriness means that something is off by a couple of pixels.

Okay, great. So now we know that a direct comparison of the design with our real application tells us if the styles are pixel-perfect or not.

That sounds kind of obvious, doesn't it? How are we supposed to do that in our daily work?

Of course, there is a tool for this! The Chrome extension [Perfect Pixel](https://chrome.google.com/webstore/detail/perfectpixel-by-welldonec/dkaagdgjmgdmbnecmcefdhjekcoceebi) does a great job.

Give it a try yourself! This will take roughly 10 min and you'll have learned a new skill.

I prepared a [simple repository](https://github.com/ooloo-io/pixel-perfect-example). Go ahead and clone it on your local machine.

The repository includes an HTML file *header.html*. You can simply open it in your browser via double click to see the header. The styles were directly taken from Zeplin and don't match the design yet.

Make sure that the browser window is 1440px wide. You can open the dev tools and resize the side panel. The responsive view, unfortunately, doesn't work together with the extension (at least for me).

![6-window-width](./6-window-width.png)

Now install the Perfect Pixel extension. Add the screenshot *header.png* that you can find in the repository as your first layer.

![7-perfect-pixel](./7-perfect-pixel.png)

Now you should see the same blurry links as in the screenshot before.

Finally, try to change the styles of the links so that they match the design perfectly.

When you're done feel free to create a pull request in the repository. I'm always interested in your results. You can find [my solution here](https://github.com/ooloo-io/pixel-perfect-example/pull/1/files).

Great job! Now you know how to create pixel-perfect designs. It'll take some practice but you already learned the basics of this valuable skill.
