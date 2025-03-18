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
    url          = "1%20HTML%20und%20CSS/Aufgaben/Einfaches%20Layout/Aufgabe"
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
moved to the plugin configuration (see top of this page).