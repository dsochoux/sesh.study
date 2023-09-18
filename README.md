# sesh.study

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Overview

I spent a large part of summer 2023 learning React and applying what I learned to this project, sesh.study. The goal was to create a website where students of any university could create and join study sessions around campus with their peers. I love collaborating with others, but find that meeting people in your classes who are availible to work when you are is a challenge. My vision was to fix this problem by creating a simple platform for students to connect on a study session by study session basis. Below, I have explained the features of sesh.study.

### Accessing sesh.study

<img src="/images/sslanding.jpg" alt="screenshot of login page" width="300"/>
Although I attend University of Michigan, I wanted sesh.study to be available to all students at all universities. Since most universities use G Suite for Education, and because I chose Firebase for a backend, I felt like having studnets sign in with their .edu gmail accounts was optimal. From there, I extract what university they attend, and only display courses and study sessions that belong under that university. 

### User profile

<img src="/images/ssaccount.jpg" alt="screenshot of account page" width="300"/>
To keep sesh.study as simple as possible, students only need to consider two things when configuring their profile. First, they decide what their display name will be. By default, it is the first name attached to their Google account. This is needed so that students can see who is attending a study session. And secondly, users will join the courses that they are currently enrolled in. This will enable students to create and find study sessions for those courses.

### Creating a new study session

<img src="/images/ssnewsession.jpg" alt="screenshot of create session page" width="300"/>
Students have the ability to create study sessions on the fly, or for up to 30 days in the future. To create a study session the student must specify for which course, the day, time range, and give a description and location of the session.

### Finding study sessions

<img src="/images/ssstudy.jpg" alt="screenshot of study session feed page" width="300"/>
Students are able to browse through all study sessions for their enrolled courses. When on the study page, students can filter by course (can be multiple at a time) and if they have committed to attending. For each study group, all relevant information is shown. Viewing the list of attending students shows their display names as well as their emails. When viewing the list, if there is more than one student attending, a button to send an email to the group is displayed.

### Final words

As of now, sesh.study is not live. I considered deploying it for students to use, but I have two issues preventing me from doing so. The first issue is that I do not want to be responsible for students using the platform to meet up and behave in academically dishonest ways that go against their school's integrity policies. Unfortunatley, sesh.study has the potential to enable such behaviors and no ways to prevent it. Secondly, students have the ability to create new courses if they one they are looking for does not exist. That is because I am not able to get a list of all courses offered at all universities. As a result of this, students can end up creating courses that may not reflect well on the university that they attend. And more generally, I do not have a system of content moderation, which feels necessary for an application such as this one.

I learned a lot about full stack developement while making this application. I enjoy learning everything about software, and I will continue to grow my full stack developement skills in addition to skills in many other software domains. I greatly appriciate you taking the time to check this out. If you would like to stay in touch, please send me an email! You can find my email as well as my resume at [dsochoux.com](https://dsochoux.com/).


