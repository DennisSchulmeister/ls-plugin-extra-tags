Edit and Download GitHub Repositories Online
============================================

For programming assignments you usually need to provide the source code and
required tools out of band. But if the code is publicly available on GitHub,
you can use this element to provide a link to start an online IDE or directly
download the source code from GitHub:

<img src="./img/lsx-github-edit.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

```html
<lsx-github-edit url="1%20HTML%20und%20CSS/Aufgaben/Einfaches%20Layout/Aufgabe"></lsx-github-edit>
```

Optionally an different url can be given for the download button, e.g. to also
include a sample solution. Additionally, HTML pages served on GitHub pages can
be added via three additional buttons:

```html
<lsx-github-edit
    url          = "https://codespaces.new/DennisSchulmeister/dhbwka-wwi-webprog-quellcodes/tree/1%20HTML%20und%20CSS/Aufgaben/Einfaches%20Layout/Aufgabe"
    download     = "1%20HTML%20und%20CSS/Aufgaben/Einfaches%20Layout"
    pages-url1   = "1%20HTML%20und%20CSS/Aufgaben/Einfaches%20Layout/Loesung/"
    pages-label1 = "Musterlösung ansehen"
    pages-url2   = ""
    pages-label2 = ""
    pages-url3   = ""
    pages-label3 = ""
></lsx-github-edit>
```

Long prefixes, that will remain the same throughout a presentation, can be also be
moved to the plugin configuration:

```js
ExtraTags: new LsPluginExtraTags({
    downloadUrlPrefix: "https://github.com/DennisSchulmeister/dhbwka-wwi-webprog-quellcodes/tree/main/",
    githubEditUrlPrefix: "https://codespaces.new/DennisSchulmeister/dhbwka-wwi-webprog-quellcodes/",
    githubPagesUrlPrefix: "https://dennisschulmeister.github.io/dhbwka-wwi-webprog-quellcodes/",
    githubEditOnOpen: url => {alert(`The code is in directory '${decodeURI(url)}'!`)},
}),
```

Before 2026 this tag used to open the sourcecode with `gitpod.io`. Unfortunately they
deprecarted their Online IDE in favor of yet anotehr AI coding agent. :-( Now we are
using GitHub CodeSpaces, which does virtually the same. But it cannot deep-link into a
directory inside the Git repository. The nasty workaround is the `githubEditOnOpen(url, fullUrl)`
callback, used here to tell the user where to find the code.
