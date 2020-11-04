<!-- Add banner here -->

<!-- omit in toc -->
# Gerbera Mobile App

<!-- Add buttons here -->
![Github last commit](https://img.shields.io/github/last-commit/gerbera/gerbera-mobile-app)

<!-- Describe your project in brief -->

<!-- The project title should be self explanotory and try not to make it a mouthful. (Although exceptions exist- **awesome-readme-writing-guide-for-open-source-projects** - would have been a cool name)

Add a cover/banner image for your README. **Why?** Because it easily **grabs people's attention** and it **looks cool**(*duh!obviously!*).

The best dimensions for the banner is **1280x650px**. You could also use this for social preview of your repo.

I personally use [**Canva**](https://www.canva.com/) for creating the banner images. All the basic stuff is **free**(*you won't need the pro version in most cases*).

There are endless badges that you could use in your projects. And they do depend on the project. Some of the ones that I commonly use in every projects are given below. 

I use [**Shields IO**](https://shields.io/) for making badges. It is a simple and easy to use tool that you can use for almost all your badge cravings. -->

<!-- Some badges that you could use -->

<!-- ![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/navendu-pottekkat/awesome-readme?include_prereleases)
: This badge shows the version of the current release.

![GitHub last commit](https://img.shields.io/github/last-commit/navendu-pottekkat/awesome-readme)
: I think it is self-explanatory. This gives people an idea about how the project is being maintained.

![GitHub issues](https://img.shields.io/github/issues-raw/navendu-pottekkat/awesome-readme)
: This is a dynamic badge from [**Shields IO**](https://shields.io/) that tracks issues in your project and gets updated automatically. It gives the user an idea about the issues and they can just click the badge to view the issues.

![GitHub pull requests](https://img.shields.io/github/issues-pr/navendu-pottekkat/awesome-readme)
: This is also a dynamic badge that tracks pull requests. This notifies the maintainers of the project when a new pull request comes.

![GitHub All Releases](https://img.shields.io/github/downloads/navendu-pottekkat/awesome-readme/total): If you are not like me and your project gets a lot of downloads(*I envy you*) then you should have a badge that shows the number of downloads! This lets others know how **Awesome** your project is and is worth contributing to.

![GitHub](https://img.shields.io/github/license/navendu-pottekkat/awesome-readme)
: This shows what kind of open-source license your project uses. This is good idea as it lets people know how they can use your project for themselves.

![Tweet](https://img.shields.io/twitter/url?style=flat-square&logo=twitter&url=https%3A%2F%2Fnavendu.me%2Fnsfw-filter%2Findex.html): This is not essential but it is a cool way to let others know about your project! Clicking this button automatically opens twitter and writes a tweet about your project and link to it. All the user has to do is to click tweet. Isn't that neat? -->

This is the mobile app interface for the [Gerbera] UPnP media server. It's built with React Native, using Expo, so it can function both on Android and iOS.

Downloads are available here: [APK](https://storage.googleapis.com/gh-assets/gerbera-861b92c363074151a2b8b524acc811bf-signed.apk)

**Contributions and Bug Reports are welcome**

<!-- # Screenshots -->

# Table of contents

- [Table of contents](#table-of-contents)
- [Build](#build)
- [Features](#features)
- [Limitations](#limitations)


# Build
[(Back to top)](#table-of-contents)

This process should allow you to build your own version of this apk.

Clone git repo

```
git clone https://github.com/gerbera/gerbera-mobile-app.git
cd gerbera-mobile-app
```

Install dependencies
(you can use `npm` to install dependencies if you prefer)
```
npm install -g expo-cli
yarn install
```

Build the app
(you will be aksed some questions when building, answer with the defaults and you should be good)
```
expo build -t apk
```

FYI: The build may take a while since you are using a shared build server

# Features
[(Back to top)](#table-of-contents)

* Download files from Database to your mobile phone
* Browse File System & Database
* Add files / folders from File System to Database
* Edit Containers / Items in Database
* Delete Containers / Items from Database
* View Item properties in Database (duration / bit rate / resolution / size / etc.)
* Add / Edit Autoscans on the File System
* View previously connected clients
* Dark Mode support

# Limitations
[(Back to top)](#table-of-contents)

Currently the app doesn't support the following (but it should very soon!):

* Username/password authentication
* Adding containers in the database

<!-- Add the footer here -->

<!-- ![Footer](https://github.com/navendu-pottekkat/awesome-readme/blob/master/fooooooter.png) -->
