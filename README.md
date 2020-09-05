lecture-slides.js: Additional HTML Tags
=======================================

Description
-----------

This plugin simplifies content creation with lecture-slides.js by defining
additional HTML tags for complex elements:

 * Bootstrap grids
 * Info boxes (information, warning, critical)
 * Tab pages to switch between multiple sub-pages
 * Accordion to switch between multiple sub-pages
 * Carousels to manually slide through a linear process
 * Embedded Youtube videos
 * Interactive quizes
 * Lists with emoji symbols

Installation
------------

 1. Add this plugin to your presentation:
    `$ npm add --save-dev ls-plugin-extra-tags`
 2. Import it in the `index.js` file
 3. Use the HTML tags below in your presentation

Example for `index.js`:

```javascript
"use strict";

import SlideshowPlayer from "lecture-slides.js";
import LsPluginExtraTags from "ls-plugin-extra-tags";

window.addEventListener("load", () => {
    let player = new SlideshowPlayer({
        plugins: {
            ExtraTags: new LsPluginExtraTags({
                // Carousel control labels
                labelCarouselNext: "Next Step",
                labelCarouselPrev: "Previous Step",
                labelCarouselReset: "Restart",
            }),
        }
    });

    player.start();
});
```

Usage
-----

**Grids**

This is just a simple wrapper around bootstrap's `<div class="container-fluid">`,
`<div class="row">` and `<div class="col">` to make the HTML code more readable.

```html
<lsx-grid-fluid>
    <lsx-row>
        <lsx-col size="md-6 xl-8">
            ...
        </lsx-col>
    </lsx-row>
<lsx-grid-fluid>
```

This will be translated to:

```html
<div class="container-fluid">
    <div class="row">
        <div class="col-md-6 col-xl-8">
            ...
        </div>
    </div>
</div>
```

`<lsx-grid>` will be translated to `<div class="container">`.

**Info boxes**

Information boxes highlight important information, like this:

<img src="screenshots/lsx-info-box.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

```html
<lsx-info-box>
    Some additional information …
</lsx-info-box>

<lsx-info-box type="warning">
    Beware of the dog! He is selling pocket bibles.
</lsx-info-box>

<lsx-info-box type="critical" title="Important Notice">
    This is a critical information with a title.
</lsx-info-box>
```

They will be rendered as:

```html
<div class="info-box critical">
    <div class="info-box-title">
        Important Notice
    </div>
    <div class="info-box-content">
        This is a critical information with a title.
    </div>
</div>
```

**Tab pages**

Tab pages allow to switch between different content pages by clicking
on a title.

<img src="screenshots/lsx-tab-pages.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

```html
<lsx-tab-pages id="example">
    <lsx-tab-page title="Explanation">
        Content of the first tab page.
    </lsx-tab-page>
    <lsx-tab-page title="Case Study">
        Content of the second tab page.
    </lsx-tab-page>
    <lsx-tab-page title="Example Code">
        Content of the third tab page.
    </lsx-tab-page>
<lsx-tab-pages>
```

They will be rendered as plain bootstrap tab pages:

```html
<div>
    <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item">
            <a
                id            = "example-page1-tab"
                class         = "nav-link active"
                data-toggle   = "tab"
                href          = "#example-page1"
                role          = "tab"
                aria-controls = "example-page1"
                aria-expanded = "true"
            >
                Explanation
            </a>
        </li>
        <li class="nav-item">
            <a
                id            = "example-page2-tab"
                class         = "nav-link"
                data-toggle   = "tab"
                href          = "#example-page2"
                role          = "tab"
                aria-controls = "example-page2"
            >
                Case Study
            </a>
        </li>
    </ul>
    <div class="tab-content">
        <div
            class           = "tab-pane fade show active"
            id              = "example-page1"
            role            = "tabpanel"
            aria-labelledby = "example-page1-tab"
        >
            Content of the first tab page.
        </div>
        <div
            class           = "tab-pane fade"
            id              = "example-page2"
            role            = "tabpanel"
            aria-labelledby = "example-page2-tab"
        >
            Content of the second tab page.
        </div>
    </div>
</div>
```

**Accordion**

An accordion works similar to tab pages in that it allows to switch between
multiple sub-pages. Unlike tab pages, the accordion pages are stacked
verticaly, however.

<img src="screenshots/lsx-accordion.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

```html
<lsx-accordion id="example">
    <!-- Short version with plain-text title -->
    <lsx-accordion-page title="First Page" active>
        Content of the first accordion page.
    </lsx-accordion-page>

    <!-- Long version with HTML title -->
    <lsx-accordion-page>
        <lsx-accordion-title>
            <b>Second Page</b>
        </lsx-accordion-title>
        <lsx-accordion-content>
            Content of the second accordion page.
        <lsx-accordion-content>
    </lsx-accordion-page>
<lsx-accordion>
```

This will be rendered as:

```html
<div id="example" class="accordion">
    <div class="card">
        <div
            id            = "example-page1-title"
            class         = "card-header"
            data-toggle   = "collapse"
            aria-expanded = "false"
            aria-controls = "example-page1-content"
            href          = "#example-page1-content"
        >
            First Page
        </div>
        <div
            id              = "example-page1-content"
            class           = "collapse container-fluid p-3"
            aria-labelledby = "example-page1-title"
            data-parent     = "#example"
        >
            Content of the first accordion page.
        </div>
    </div>

    <div class="card">
        <div
            id            = "example-page2-title"
            class         = "card-header"
            data-toggle   = "collapse"
            aria-expanded = "false"
            aria-controls = "example-page2-content"
            href          = "#example-page2-content"
        >
            <b>Second Page</b>
        </div>
        <div
            id              = "example-page2-content"
            class           = "collapse container-fluid p-3"
            aria-labelledby = "example-page2-title"
            data-parent     = "#example"
        >
            Content of the second accordion page.
        </div>
    </div>
</div>
```

**Slide Carousel**

A carousel allows to manually slide through a linear sequence of images.
Unlike typical HTML carousels, this one doesn't automaticaly move but
rather requires to click a link to see the next card.

<img src="screenshots/lsx-carousel.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

Basic example:

```html
<lsx-carousel id="example">
    <lsx-carousel-page>
        Content of the first step.
    </lsx-carousel-page>
    <lsx-carousel-page>
        Content of the second step.
    </lsx-carousel-page>
    <lsx-carousel-page>
        Content of the third step.
    </lsx-carousel-page>
</lsx-carousel>
```

If wanted, additional links can be created to directly jump to a given page:

```html
<lsx-carousel id="example">
    <lsx-carousel-page>
        Content of the first step.
    </lsx-carousel-page>
    <lsx-carousel-page direct-link="Second Page">
        Content of the second step.
    </lsx-carousel-page>
    <lsx-carousel-page direct-link"Closing Notes">
        Content of the third step.
    </lsx-carousel-page>
</lsx-carousel>
```

Carousels will be rendered to plain bootstrap carousels:

```html
<ul class="nav nav-tabs" role="tablist">
    <li class="nav-item">
        <a href="#example-carousel" class="nav-link" data-slide="next">Next Step</a>
    </li>
    <li class="nav-item">
        <a href="#example-carousel" class="nav-link" data-slide="prev">Previous Step</a>
    </li>
    <li class="nav-item">
        <a href="#example-carousel" class="nav-link" data-slide-to="0">Restart</a>
    </li>
</ul>
<ul class="nav nav-tabs" role="tablist">
    <li class="nav-item">
        <small>
            <a href="#example-carousel" class="nav-link" data-slide-to="1">Second Page</a>
        </small>
    </li>
    <li class="nav-item">
        <small>
            <a href="#example-carousel" class="nav-link" data-slide-to="2">Closing Notes</a>
        <small>
    </li>
</ul>
<div id="example-carousel" class="carousel slide" data-interval="false">
    <div class="carousel-inner">
        <div class="carousel-item active">
            Content of the first step.
        </div>
        <div class="carousel-item">
            Content of the second step.
        </div>
        <div class="carousel-item">
            Content of the third step.
        </div>
    </div>
</div>
```

**Youtube Videos**

This element allows to embedded any youtube video, whose video ID (found in
the youtube URL) is known.

<img src="screenshots/lsx-youtube.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

```html
<lsx-youtube video="HERMqverQWM" aspect-ratio="16by9"><lsx-youtube>
```

The video will be embedded with no cookies to protect the viewers identity.
It will be rendered as:

```html
<div class="embed-responsive embed-responsive-16by9">
    <iframe class="embed-responsive-item" src="https://www.youtube-nocookie.com/embed/HERMqverQWM?rel=0&amp;showinfo=0" allowfullscreen></iframe>
</div>
```

The aspect ratio can be any ration supported by bootstrap:

 * `21by9`
 * `16by9` (default)
 * `4by3`
 * `1by1`

**Interative Quizes**

Currently this element allows to define interactive quizes with multiple-choice
and single-choice questions. In future, different answer types could be added
depending on actual need.

<img src="screenshots/lsx-quiz.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

A minimal, working example could be this:

```html
<lsx-quiz prefix="Aufgabe #:">
    <lsx-exercise title="Die Geschichte des Internets">
        <lsx-question
            type = "single-choice"
            text = "a) Wie hieß der technische Vorläufer des heutigen Internets?"
        >
            <lsx-answer>ADANET</lsx-answer>
            <lsx-answer correct>ARPANET</lsx-answer>
            <lsx-answer>Darker Net</lsx-answer>
            <lsx-answer>Global Web</lsx-answer>
        </lsx-question>

        <lsx-question
            type = "single-choice"
            text = "b) In welchem Jahr gingen die ersten Rechner online?"
        >
            <lsx-answer>1959</lsx-answer>
            <lsx-answer>1963</lsx-answer>
            <lsx-answer correct>1969</lsx-answer>
            <lsx-answer>1971</lsx-answer>
        </lsx-question>
    </lsx-exercise>

    <lsx-exercise title="Technisches zum World Wide Web">
        <lsx-question
            type = "single-choice"
            text = "a) Was ist ein Hypertext? "
        >
            <lsx-answer correct>Ein nicht-linearer Text mit Absprüngen und Verlinkungen</lsx-answer>
            <lsx-answer>Ein technisch-orientierter Text mit multimedialen Inhalten</lsx-answer>
            <lsx-answer>Ein für Computer lesbarer Quelltext nach der Compilierung</lsx-answer>
            <lsx-answer>Ein besonders effizient komprimierter, natürlichsprachlicher Text</lsx-answer>
        </lsx-question>

        <lsx-question
            type = "single-choice"
            text = "b) Wie lautet die vollständige URL der DHBW Karlsruhe inklusive aller optionalen Bestandteile? "
        >
            <lsx-answer><code>karlsruhe.dhbw.de</code></lsx-answer>
            <lsx-answer><code>www.karlsruhe.dhbw.de</code></lsx-answer>
            <lsx-answer><code>https://www.karlsruhe.dhbw.de</code></lsx-answer>
            <lsx-answer correct><code>https://www.karlsruhe.dhbw.de/</code></lsx-answer>
            <lsx-answer><code>https://www.karlsruhe.dhbw.de/dhbw-karlsruhe/</code></lsx-answer>
            <lsx-answer><code>https://www.karlsruhe.dhbw.de/en/general/about-us.html</code></lsx-answer>
            <lsx-answer><code>https://www.karlsruhe.dhbw.de/en/general/about-us.html?lang=en</code></lsx-answer>
        </lsx-question>
    </lsx-exercise>
</lsx-quiz>
```

The nested structure where a `<lsx-quiz>` contains many `<lsx-exercise>`, which
contain many `<lsx-question>`, which contain many `<lsx-answer>` is important
for this feature to work.

Question texts can also be HTML formatter:

```html
<lsx-question type="single-choice">
    <lsx-question-text>
        <b>HTML-formatted</b> question text.
    <lsx-question-text>

    <lsx-answer>Answer 1</lsx-answer>
    <lsx-answer>Answer 2</lsx-answer>
    …
</lsx-question>
```

Answers can be marked correct, wrong and partialy correct:

```html
<lsx-answer correct>
    Correct answer, gives 1 point if ticked.
</lsx-answer>

<lsx-answer partialy-correct>
    Partialy correct answer, gives 0.5 points if ticked.
</lsx-answer>

<lsx-answer wrong>
    Wrong answer, gives -1 point if ticked.
</lsx-answer>
```

**Lists with emoji symbols**

Plain unordered lists sometimes look a bit boring. The custom element
`<lsx-ul>` thus allows to create lists with an emoji as a list symbol:

<img src="screenshots/lsx-ul.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

```html
<lsx-ul emoji="⚽">
    <li>List Item 1</li>
    <li>List Item 2</li>
    <li>List Item 3</li>
</lsx-ul>
```

Normaly this will still be rendered as an html list:

```html
<ul style="list-style-type: '⚽  '";>
    <li>List Item 1</li>
    <li>List Item 2</li>
    <li>List Item 3</li>
</ul>
```

If however at least one of the list items contains its own emoji:

```html
<lsx-ul emoji="⚽">
    <li emoji="🎳">List Item 1</li>
    <li>List Item 2</li>
    <li>List Item 3</li>
</lsx-ul>
```

The list will be rendered as a table, instead:

```html
<table>
    <tr>
        <td style="padding-right: 0.5em;">🎳</td>
        <td>List Item 1</td>
    </tr>
    <tr>
        <td style="padding-right: 0.5em;">⚽</td>
        <td>List Item 2</td>
    </tr>
    <tr>
        <td style="padding-right: 0.5em;">⚽</td>
        <td>List Item 3</td>
    </tr>
</table>
```


Copyright
---------

lecture-slides.js: https://www.github.com/DennisSchulmeister/lecture-slides.js <br/>
This plugin: https://github.com/DennisSchulmeister/ls-plugin-extra-tags <br/>
© 2020 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
