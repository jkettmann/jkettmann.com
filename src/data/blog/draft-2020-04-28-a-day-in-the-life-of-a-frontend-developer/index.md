---
category: 'blog'
title: A day in the life of a frontend developer
slug: a-day-in-the-life-of-a-frontend-developer
date: 2020-04-28
published: false
---

Hi ,

since you signed up for this waitlist you're probably wondering if you're ready for your first job as a React developer.

Maybe you're thinking about applying for a job soon or you already did. Maybe you experienced this already first hand:

For developers without prior professional experience, it can be really tough to get their foot in the door. I know, I've been there.

**But what does it actually mean to be a professional developer?**

Until now you probably spent most of your time learning to code. And this will continue to be a big part of your day to day life once you have a job.

Apart from that professional devs spend a lot of their time in meetings and discussions about the product, its technical architecture, or development processes. They are working with designs, reviewing code, and writing tests.

It's often easier to understand by looking at an example. So let's see what a typical day inside an office for a frontend developer looks like:

(Don't worry if you don't understand all of the lingo. You can find a short glossary below)

**10:00 am** You enter the office, say hello to your team-mates. You turn on your computer and get a cup of coffee. In the kitchen, you have a short chat with one of your colleagues.

**10:10 am** You check your emails hoping that there's no urgent bugfix that came in. Of course, you also have a quick look at your Twitter account.

**10:26 am** Oh shit, it's almost time for the *daily stand-up*[[1]](#fn1). What did I do again yesterday? What was the plan for today again?

**10:30 am** The team meets for the 15 min daily. One team-mate joins remotely[[2]](#fn2). He forgot about a doctor's appointment and is coming in late. The *Kanban board*[[3]](#fn3) is turned on. Everybody says what they are working on, or if they have problems or need help. You check the tasks on the board and ensure that everything is up to date.

**10:45 am** You head back to your desk and start working on the *ticket*[[4]](#fn4) from yesterday. The *integration tests*[[5]](#fn5) were failing. It may take a while until you fix them.

**11:30 am** A team-mate asks if you'd like a coffee. Of course!

**11:40 am** You continue working.

**12:30 pm** It's time for the lunch train! The *Slack*[[6]](#fn6) poll tells you that it's gonna be the Chinese restaurant today.

**01:30 pm** Before you continue working on your task you have to do an urgent *code review*[[7]](#fn7) for one of your colleagues

**01:50 pm** You continue working on fixing the integration tests

**03:30 pm** It's time for the weekly *backlog grooming*[[8]](#fn8) with your team. The *product manager*[[9]](#fn9) explains the upcoming tasks to work on in the near future, you discuss them, try to get a clear picture, and give a rough estimation.

**04:30 pm** Puuuh, meetings are exhausting! Another coffee, please!

**04:45 pm** Continue fixing the integration tests

**05:30 pm** You're finally done. You create a *pull request on GitHub*[[10]](#fn10). The *CI pipelines*[[11]](#fn11) passed, all tests are working.

**05:45 pm** A team-mate did a quick code review. She thinks that some of the variable names are not explicit enough and that parts of the business logic should be optimized. You start a discussion about a few of the complaints. But in the end, she's right. You head back to implement the requested changes.

**06:15 pm** Done. You push your code changes to GitHub and request another review. Your critical team-mate *approves*[[10:1]](#fn10) right away.

**06:20 pm** Just as you want to click the *Merge button* the *designer* comes along. "That's not how I designed it. That's at least 3 pixels off"[[12]](#fn12). You compare the design and your implementation. He's right.

**06:30 pm** You push your changes again. Another code review required. Unfortunately, the other developer already went home. That has to wait until tomorrow

**06:35 pm** You check the tasks on the board. You pick a ticket that has a high priority and assign it to yourself.

That's what the next email will be about. You'll learn how to make your styles pixel-perfect in a quick hands-on lesson. (There should be a cliffhanger at the end, right?)

---

1.
**Daily stand-ups** are the most common kind of meeting in tech companies. The idea is that nobody sits down to keep the meeting short. One agile coach even suggested we'd do planks to keep it even shorter. Would have been good for our bodies as well but we never followed through.

The goal of the daily is to get everyone up to speed. Every team member says what they did the day before and what they are going to work on today. If there are any problems or unplanned absences they should be mentioned as well. Discussions should be restricted to a minimum. [↩︎](#fnref1)

2.
**Remote work** is very common in tech companies. Many tools we use are cloud-based. Even pair-progamming sessions can be done online. Many companies also have employees who work completely remotely. It can be difficult to integrate them into the team since you won't have the occasional coffee break together. But you can make it work. [↩︎](#fnref2)

3.
**Kanban boards** can be physical or on a computer. Most companies today use project management tools like Jira or Asana to keep track of their tasks. These tasks are organized in different columns.

The setup can be different at each company but the following flow is pretty common:

The most left column is the *backlog* where everything is gathered. The tasks in the backlog are usually prioritized by a product manager who decides what is urgent and what can be done later.

The developers pick a task they want to work on from the backlog and pull it into the next column called "In Progress". Once they are done they move it to the next column called "In Review". Finally when the code passed the review and the code has been merged the task is moved to the "Done" column. [↩︎](#fnref3)

4.
**Tickets** and tasks are the same [↩︎](#fnref4)

5.
**Testing** is one of the essential responsibilities of software developers. Many solo developers, agencies, or start-ups don't test sufficiently because of time pressure or fast-changing requirements. But in most established tech companies testing is part of daily business.

Testing provides huge advantages for the applications since they don't break so often. But they also mean a great measure of security for developers: You can touch code an be more or less certain that you don't break existing behavior.

The most common forms of tests are:

**Unit tests** are used to validate the behavior of small parts of the code like a single function. They are great to test for example business logic.

**Integration tests** are a level less specific. They are used to test the behavior of multiple parts of code together like the inputs and buttons on a page. They care less about the internals of the code but more about the overall functionality as it's exposed to the user. They are my first choice for testing a frontend.

**End-to-end tests** are testing the complete system together. They are simulating the behavior of a user on a running system including frontend and backend. This makes them very slow but at the same time closest to reality. Another problem is that you usually can't test edge cases like crashing servers. Whereas in integration tests you would simply mock the server response to simulate that a server is down. [↩︎](#fnref5)

6.
**Online communication** tools like Slack are the bread and butter of all tech companies. We often use them even to chat with our team-mate at the desk next to us. The company usually has multiple channels for different teams and purposes. Thanks to these tools we can naturally integrate remote workers into our teams.

They also come with a downside though: It's increasingly difficult to focus on one thing. That can make it very hard to work on complex tasks. There are different techniques to support us, like the *Pomodoro method* where you work on one thing for 25 min undisturbed and take a break of 5 min afterward. Wearing headphones is one sign of not wanting to be disturbed in some companies. [↩︎](#fnref6)

7.
**Code reviews** are an essential tool to keep code quality high and reduce the number of bugs we introduce into our production code. They are also one of the best ways to learn from each other.

Code reviews are not always straightforward though. Most of us don't handle critique as well as we'd like. The written language doesn't transmit the intended tone so they can come along as aggressive even though they're not. [↩︎](#fnref7)

8.
**Meetings** are what a developer spends most of their time apart from writing code. Depending on the company there are more or fewer meetings. A backlog grooming where the team has a look at upcoming tasks is one of the common types of meetings.

A team that uses Kanban typically has fewer meetings than a Scrum team where you have a certain set of meetings called Scrum ceremonies. These are planning sessions and sprint retrospectives to name a few. [↩︎](#fnref8)

9.
**Roles in a team** that developers are in close contact with are typically product managers and designers. A team might have a lead developer or a QA engineer as well.

Product managers are responsible for product requirements. They connect the developer team with the business side and the designers.

Designers create the designs for the product together with the product manager. In some companies, developers may also be involved in this process to prevent complicated designs that take forever to implement. [↩︎](#fnref9)

10.
**Git workflows** enable professional developer teams to work together on a single code base. Two popular workflows are the *Git flow* and *GitHub flow*.

With *Git flow* developers implement their code on feature branches (usually named feature/my-branch-name). They merge their code from the feature branch to a *development* branch. When they want to deploy the development branch they create a *release* branch where the application is tested. Only then the code is merged from *release* to the *master* branch.

The *GitHub flow* is a bit simpler. Developers create separate branches for their features. The only rule here is that the branch name should be descriptive. Once the implementation is ready to be merged the developer creates a pull request on GitHub. The code is reviewed and merged directly to the master branch. The master branch should be deployed immediately. [↩︎](#fnref10)[↩︎](#fnref10:1)

11.
**Continuous integration** means that an application is automatically tested and built.

Most modern applications have scripts like `npm test` or `npm lint` that check code formatting or functionality. These scripts can be run whenever a code change is sent to the remote repository, for example when a pull request on GitHub is created or updated.

The next step is *continuous delivery* where the application is automatically deployed to the production servers. [↩︎](#fnref11)

12.
**Working with designs** is a requirement for most front-end developers. The designs are usually handed to the developers via tools like Zeplin. These tools offer information about spacing, sizes, and colors. Unfortunately, not all the dimensions are 100% correct. Thus creating pixel-perfect designs is another kind of story for developers. [↩︎](#fnref12)
