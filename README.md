lecture-slides.js: Additional HTML Tags
=======================================

Description
-----------

This plugin simplifies content creation with `lecture-slides.js` and
`mini-tutorial.js` by defining additional HTML tags for complex elements:

 * Bootstrap grids
 * Info boxes (information, warning, critical)
 * Tab pages to switch between multiple sub-pages
 * Accordion to switch between multiple sub-pages
 * Carousels to manually slide through a linear process
 * Embedded Youtube videos
 * Interactive quizzes
 * Lists with emoji symbols
 * Edit and Download GitHub Repositories online

Please note, that this requires the Bootstrap framework in your document.
For `lecture-slides.js` this is no problem, as Bootstrap is already used
for the main UI and can be used, anyway. For `mini-tutorial.js` projects
Bootstrap must be manually added to the project as it is intentionally not
defined as a dependency here.

Installation
------------

**If you are using `mini-tutorial.js`:**

 1. Add Bootstrap to you project, if you are using `mini-tutorial.js`.
 1. Make sure your bundler allows loading of LESS stylesheets

**In all cases:**

 1. Add this plugin to your presentation: `$ npm add --save-dev @dschulmeis/ls-plugin-extra-tags`
 1. Import it in the `index.js` file
 1. Use the HTML tags below in your presentation

Example for `lecture-slides.js`:

```javascript
"use strict";

import SlideshowPlayer from "lecture-slides.js";
import LS_Plugin_ExtraTags from "ls-plugin-extra-tags";

window.addEventListener("load", () => {
    let player = new SlideshowPlayer({
        plugins: {
            ExtraTags: new LS_Plugin_ExtraTags({
                // Carousel control labels
                labelCarouselNext: "Next Step",
                labelCarouselPrev: "Previous Step",
                labelCarouselReset: "Restart",

                labelGithubEditOnline: "Start Online-IDE",
                labelGithubEditDownload: "Download Source Code",

                labelQuizPoints: "{1} from {2}",
                labelQuizEvaluate: "Correct",
                labelQuizNewTry: "New Try",
                quizExerciseHeading: "h2",

                githubEditUrlPrefix: "https://github.com/DennisSchulmeister/dhbwka-wwi-webprog-quellcodes/tree/master/",
            }),
        }
    });

    player.start();
});
```

Example for `mini-tutorial.js`:

```javascript
import MiniTutorial from "@dschulmeis/mini-tutorial.js";
import LS_Plugin_ExtraTags from "ls-plugin-extra-tags";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

window.addEventListener("load", () => {
    let mt = new MiniTutorial({
        plugins: [
            new LS_Plugin_ExtraTags({
                // Same options as above
            }),
        ]
    });

    mt.start();
});
```

Usage
-----

 1. [Grid](#grid)
 1. [Info Box](#info-box)
 1. [Tab Pages](#tab-pages)
 1. [Accordion](#accordion)
 1. [Slide Carousel](#slide-carousel)
 1. [Youtube Video](#youtube-video)
 1. [Interactive Quiz](#interactive-quiz)
 1. [List with Emoji Symbols](#list-with-emoji-symbols)
 1. [Edit and Download GitHub Repositories Online](#edit-and-download-github-repositories-online)


### Grid

This is just a simple wrapper around bootstrap's `<div class="container-fluid">`,
`<div class="row">` and `<div class="col">` to make the HTML code more readable.

```html
<lsx-grid-fluid>
    <lsx-row>
        <lsx-col size="md-6 xl-8">
            ...
        </lsx-col>
    </lsx-row>
</lsx-grid-fluid>
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


### Info Box

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


### Tab Pages

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
</lsx-tab-pages>
```

They will be rendered as plain bootstrap tab pages:

```html
<div>
    <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item">
            <a
                id             = "example-page1-tab"
                class          = "nav-link active"
                data-bs-toggle = "tab"
                href           = "#example-page1"
                role           = "tab"
                aria-controls  = "example-page1"
                aria-expanded  = "true"
            >
                Explanation
            </a>
        </li>
        <li class="nav-item">
            <a
                id             = "example-page2-tab"
                class          = "nav-link"
                data-bs-toggle = "tab"
                href           = "#example-page2"
                role           = "tab"
                aria-controls  = "example-page2"
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


### Accordion

An accordion works similar to tab pages in that it allows to switch between
multiple sub-pages. Unlike tab pages, the accordion pages are stacked
vertically, however.

<img src="screenshots/lsx-accordion.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

```html
<lsx-accordion id="example">
    <!-- Short version with plain-text title -->
    <lsx-accordion-page title="First Page" bold active>
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

    <!-- Long version with left and right title content -->
    <lsx-accordion-page>
        <lsx-accordion-title>
            <div class="w-100 me-3 d-flex justify-content-between">
                <b><tt>GET</tt></b>
                <span>Request Resources</span>
            </div>
        </lsx-accordion-title>
        <lsx-accordion-content>
            Content of the third accordion page
        </lsx-accordion-content>
    <lsx-accordion-page>
</lsx-accordion>
```

This will be rendered as:

```html
<div id="example" class="accordion">
    <div class="accordion-item">
        <div
            id    =  "example-page1-title"
            class = "accordion-header font-weight-bold"
        >
            <button
                class          = "accordion-button bg-light text-body fs-5"
                type           = "button"
                data-bs-toggle = "collapse"
                data-bs-target = "#example-page1-content"
                aria-controls  = "example-page1-content"
                aria-expanded  = "false"
            >
                First Page
            </button>
        </div>
        <div
            id              = "example-page1-content"
            class           = "accordion-collapse collapse"
            aria-labelledby = "example-page1-title"
            data-bs-parent  = "#example"
        >
            <div class="accordion-body">
                Content of the first accordion page.
            </div>
        </div>
    </div>

    <div class="accordion-item">
        <div
            id    = "example-page2-title"
            class = "accordion-header"
        >
            <button
                class          = "accordion-button bg-light text-body fs-5"
                type           = "button"
                data-bs-toggle = "collapse"
                data-bs-target = "#example-page2-content"
                aria-controls  = "example-page2-content"
                aria-expanded  = "false"
            >
                <b>Second Page</b>
            </button>
        </div>
        <div
            id              = "example-page2-content"
            class           = "accordion-collapse collapse"
            aria-labelledby = "example-page2-title"
            data-bs-parent  = "#example"
        >
            <div class="accordion-body">
                Content of the second accordion page.
            </div>
        </div>
    </div>
</div>
```

The attribute `active` can be used to open one page by default. Accordingly
the attribute `bold` can be used to render a bold page title.


### Slide Carousel

A carousel allows to manually slide through a linear sequence of images.
Unlike typical HTML carousels, this one doesn't automatically move but
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
    <lsx-carousel-page direct-link="Closing Notes">
        Content of the third step.
    </lsx-carousel-page>
</lsx-carousel>
```

Carousels will be rendered to plain bootstrap carousels:

```html
<div class="carousel-outer">
    <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item">
            <a href="#example-carousel" class="nav-link" data-bs-slide="next">Next Step</a>
        </li>
        <li class="nav-item">
            <a href="#example-carousel" class="nav-link" data-bs-slide="prev">Previous Step</a>
        </li>
        <li class="nav-item">
            <a href="#example-carousel" class="nav-link" data-bs-slide-to="0">Restart</a>
        </li>
    </ul>
    <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item">
            <small>
                <a href="#example-carousel" class="nav-link" data-bs-slide-to="1">Second Page</a>
            </small>
        </li>
        <li class="nav-item">
            <small>
                <a href="#example-carousel" class="nav-link" data-bs-slide-to="2">Closing Notes</a>
            <small>
        </li>
    </ul>
    <div id="example-carousel" class="carousel slide mb-0" data-bs-interval="false">
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
</div>
```


### Youtube Video

This element allows to embedded any youtube video, whose video ID (found in
the youtube URL) is known.

<img src="screenshots/lsx-youtube.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

```html
<lsx-youtube video="HERMqverQWM" aspect-ratio="16by9"></lsx-youtube>
```

The video will be embedded with no cookies to protect the viewers identity.
It will be rendered as:

```html
<div class="embed-responsive ratio ratio-16x9">
    <iframe src="https://www.youtube-nocookie.com/embed/HERMqverQWM?rel=0&amp;showinfo=0" allowfullscreen></iframe>
</div>
```

The aspect ratio can be any ration supported by bootstrap:

 * `21x9`
 * `16x9` (default)
 * `4x3`
 * `1x1`


### Interactive Quiz

This element allows to define interactive quizzes with types of answers and automatic validation.

<img src="screenshots/lsx-quiz.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

A minimal example showcasing all answer types could be this:

```html
<lsx-quiz prefix="Exercise #:">
    <lsx-exercise title="History of the Internet">
        <!-- Single Choice Questions -->
        <lsx-question
            type = "single-choice"
            text = "a) What was the name of the Internet's precursor?"
            hint = "Try one of the acronyms."
        >
            <lsx-answer>ADANET</lsx-answer>
            <lsx-answer correct points="2">ARPANET</lsx-answer>
            <lsx-answer>Darker Net</lsx-answer>
            <lsx-answer>Global Web</lsx-answer>
        </lsx-question>

        <lsx-question
            type = "single-choice"
            text = "b) In which year the first computer went online?"
        >
            <lsx-question-hint>
                It was earlier than you might think.
            </lsx-question-hint>

            <lsx-answer>1959</lsx-answer>
            <lsx-answer>1963</lsx-answer>
            <lsx-answer correct>1969</lsx-answer>
            <lsx-answer>1971</lsx-answer>
        </lsx-question>
    </lsx-exercise>

    <lsx-exercise title="Technical Details on the Internet">
        <!-- Multiple-Choice Question -->
        <lsx-question
            type         = "multiple-choice"
            text         = "a) Which of the following can be part of a web address (URL)?"
            wrong-points = "-2"
            label-length = "8em"
        >
            <lsx-question-line>
                <lsx-answer correct>Protocol</lsx-answer>
                <lsx-answer points="-1">First name</lsx-answer>
                <lsx-answer points="-1">Last name</lsx-answer>
                <lsx-answer correct>Host name</lsx-answer>
            </lsx-question-line>
            <lsx-question-line>
                <lsx-answer>Postcode</lsx-answer>
                <lsx-answer correct>Port number</lsx-answer>
                <lsx-answer>House number</lsx-answer>
                <lsx-answer correct>Path</lsx-answer>
            </lsx-question-line>
            <lsx-question-line>
                <lsx-answer correct>Query parameters</lsx-answer>
                <lsx-answer>Geo coordinates</lsx-answer>
                <lsx-answer correct>Anchor</lsx-answer>
                <lsx-answer>Harbour</lsx-answer>
            </lsx-question-line>
        </lsx-question>

        <!-- Assignment Question (select positions can be "before", "after", "above", "below") -->
        <lsx-question
            type            = "assignment"
            text            = "b) Which web technology is used for the following purposes?"
            label-length    = "30em"
            select-position = "after"
            select-style    = "font-style: italic;"
        >
            <lsx-assignment answer="URL">To uniquely address resources at the world wide web:</lsx-assignment>
            <lsx-assignment answer="HTTP">To request data from a server and send it to the client:</lsx-assignment>
            <lsx-assignment answer="HTML">To define the structure and content of a web site:</lsx-assignment>
            <lsx-assignment answer="CSS">To define stylesheets for the visual appearance of a web site:</lsx-assignment>
            <lsx-assignment answer="JavaScript">To execute logic on the client e.g. for interactive behavior:</lsx-assignment>

            <!-- Dummy answers (can also be marked as wrong or partially-correct) -->
            <lsx-assignment answer="SVG" wrong></lsx-assignment>
            <lsx-assignment answer="PNG" wrong></lsx-assignment>
            <lsx-assignment answer="PDF" wrong></lsx-assignment>
            <lsx-assignment answer="SMTP" partially-correct></lsx-assignment>
            <lsx-assignment answer="FTP"  partially-correct></lsx-assignment>
        </lsx-question>

        <!-- Gap Text (line-start switches to source-code mode which preserves white-space) -->
        <lsx-question
            type = "gap-text"
            text = "c) Fill out the blanks in the following source code"
            mode = "source-code"
        >
            <!-- Length must be a CSS length -->
            <lsx-gap answer="<!DOCTYPE html>" ignore-case ignore-spaces></lsx-gap>
            &lt;<lsx-gap answer="html" ignore-case></lsx-gap>&gt;
                &lt;head&gt;
                   ...
                &lt;/head&gt;
                &lt;<lsx-gap answer="body" ignore-case></lsx-gap>&gt;
                   ...
                   <lsx-gap length="10em" regexp=".*" answer="<h1>Example</h1>"></lsx-gap>
                &lt;/body&gt;
                <!-- Using a <lsx-answer> to define partially correct answers -->
            &lt;<lsx-gap answer="/html" ignore-case ignore-spaces points="2"><lsx-answer partially-correct points="1">html</lsx-answer></lsx-gap>&gt;
        </lsx-question>
    </lsx-exercise>

    <lsx-exercise title="Fundamental Electronics">
        <!-- Assignment Question with multiple options side-by-side -->
        <lsx-question
            type            = "assignment"
            text            = "a) Which electrical components are shown on the following pictures?"
            select-length   = "20em"
            select-position = "below"
            select-style    = "font-style: italic;"
            empty-answer    = "<i>(no selection)</i>"
            empty-points    = "-1"
            wrong-points    = "-2"
        >
            <lsx-question-line>
                <lsx-assignment answer="Resistor"><img src="..."></lsx-assignment>
                <lsx-assignment answer="Capacitor"><img src="..."></lsx-assignment>
                <lsx-assignment answer="Coil"><img src="..."></lsx-assignment>
            </lsx-question-line>

            <lsx-question-line>
                <lsx-assignment answer="Switch"><img src="..."></lsx-assignment>
                <lsx-assignment answer="Potentiometer"><img src="..."></lsx-assignment>
                <lsx-assignment answer="Connector"><img src="..."></lsx-assignment>
            </lsx-question-line>
        </lsx-question>

        <!-- Gap text can also be used for simple text input. -->
        <!-- <lsx-question-line> can be optionally used to split the text into lines with their own correction marks. -->
        <lsx-question
            type         = "gap-text"
            text         = "b) According to Ohm's Law, which formulas convert between Voltage U, Resistance R and Current I?"
            mode         = "split-lines"
            empty-points = "-1"
            wrong-points = "-2"
        >
            U = <lsx-gap answer="R * I" ignore-case ignore-spaces></lsx-gap>
            R = <lsx-gap answer="U / I" ignore-case ignore-spaces></lsx-gap>
            I = <lsx-gap answer="U / R" ignore-case ignore-spaces></lsx-gap>
        </lsx-question>

        <!-- Same question with explicit <lsx-question-lines> -->
        <lsx-question
            type = "gap-text"
            text = "b) According to Ohm's Law, which formulas convert between Voltage U, Resistance R and Current I?"
        >
            <lsx-question-line>
                U = <lsx-gap answer="R * I" ignore-case ignore-spaces></lsx-gap>
            </lsx-question-line>
            <lsx-question-line>
                R = <lsx-gap answer="U / I" ignore-case ignore-spaces></lsx-gap>
            </lsx-question-line>
            <lsx-question-line>
                I = <lsx-gap answer="U / R" ignore-case ignore-spaces></lsx-gap>
            </lsx-question-line>
        </lsx-question>

        <!-- Free-Text Question (multi line) -->
        <lsx-question
            type = "free-text"
            text = "c) Why is the electrical current flowing through an electrical circuit proportional to the input voltage and the circuit's resistance?"
        >
            <!-- Editor can be "html" or "plain" -->
            <lsx-free-text
                initial      = "Your answer here"
                sample       = "While voltage describes ..."
                editor       = "html"
                validate     = "customValidationFunction"
                empty-points = "-1"
                wrong-points = "-2"
            >
                <!-- Alternative to the attributes -->
                <lsx-initial-answer>
                    Your answer here
                </lsx-initial-answer>

                <lsx-sample-answer>
                    <p>
                        While voltage describes the potential energy carried by the electrons (the higher the voltage, the more energy
                        the electrons transport), current describes the number of electrons flowing through the circuit in a time period
                        (though not quite correct, imagine it as the "speed of the electrons").
                    </p>
                    <p>
                        However the electrons cannot freely flow through the circuit but are hindered by the circuit element's individual
                        resistance. The higher the resistance, the more energy gets lost (actually gets transformed into heat) by the electrons
                        traveling through the circuit. As this reduces the energy that is making the electrons flow in the first place, this in
                        turn reduces the rate or "speed" of the resulting electron flow.
                    </p>
                </lsx-sample-answer>
            </lsx-free-text>
        </lsx-question>
    </lsx-exercise>
</lsx-quiz>
```

The nested structure where a `<lsx-quiz>` contains many `<lsx-exercise>`, which
contain many `<lsx-question>` and so on is important for this feature to work.

Question texts and hints can also be HTML formatted, either by including HTML tags
in the attributes or with explicit `<lsx-question-text>` and `<lsx-question-hint>`
elements.

```html
<lsx-question type="single-choice">
    <lsx-question-text>
        <b>HTML-formatted</b> question text.
    </lsx-question-text>

    <lsx-question-hint>
        The second answer is mostly right.
    </lsx-question-hint>

    <lsx-answer>Answer 1</lsx-answer>
    <lsx-answer>Answer 2</lsx-answer>
    …
</lsx-question-hint>
```

Answers can be marked correct, wrong and partially correct:

```html
<lsx-answer correct>
    Correct answer, gives 1 point if ticked.
</lsx-answer>

<lsx-answer partially-correct>
    Partially correct answer, gives 0.5 points if ticked.
</lsx-answer>

<lsx-answer wrong>
    Wrong answer, gives -1 point if ticked.
</lsx-answer>

<lsx-answer>
    Neutral answer, gives 0 points if ticked.
</lsx-answer>
```

The number of points can be overruled, if needed. But still each answer should be assigned
a correctness level.

```html
<lsx-answer correct points="5">Correct answer</lsx-answer>
<lsx-answer wrong points="-3">Wrong answer</lsx-answer>
...
```

The elements `<lsx-gap>` and `<lsx-free-text>` offer the following options to validate the answers:

 * Verbatim expected answer:
    * Attribute `answer`: String with the expected answer
    * Attribute `ignore-case`: Ignore lower/upper case differences from the expected answer (by converting the answer to lower-case)
    * Attribute `ignore-spaces`: Ignore all whitespace differences from the expected answer (by removing all whitespace from the answer)
* Regular expression:
    * Attribute `length`: Width of the input field (e.g. `10em`)
    * Attribute `regexp`: Regular expression that must return a match
    * Attribute `answer`: Example answer shown as expected answer after validation
* Custom logic:
    * Attribute `length`: Width of the input field (e.g. `10em`)
    * Attribute `validate`: Name of a global Javascript function with the following signature:

      ```js
      /**
       * Custom validation function for free-text answers. Receives a parameter object with the following
       * keys. The implementing function can omit not-needed parameters from its declaration of the form
       * below is used.
       *
       *  `answer` contains the answer text to be validated.

       *  `evaluation` contains the properties `status`, `points` and `expected`, which must be changed.
       *    * `status` must be set to `status.unknown`, `status.correct`, `status.partial` or `status.wrong`.
       *      `status.unknown` means, that other validation methods should be tried (see remarks below)
       *    * `points` must be set to the credited points. Can be negative to deduce points.
       *    * `expected` should contain the expected correct answer, of the result is not `status.correct`.
       *
       * The remaining parameters contain the corresponding <lsx-...> DOM elements
       */
      function custom_validation({answer, evaluation, status, gapElement, questionElement, exerciseElement, quizElement}) {
          // Custom validation logic
      }
      ```

      At first the validation status will be `unknown` and the validation function will be executed, if defined.
      If it doesn't exist or the status remains `unknown`, the DOM event `lsx-quiz-validation` will be raised on
      the `<lsx-gap>`/`<lsx-free-text>` element. But note, that the event cannot bubble up to the parent HTML
      elements, since they are torn apart when the DOM structure is built. The event details (`event.detail`)
      contain the same attributes as the validation function would receive. If the result is still unchanged,
      the validation rules based on the other HTML attributes and nested `<lsx-answer>` elements are executed
      in the order they were defined. The first matching rule determines the result.

### List with Emoji Symbols

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

Normally this will still be rendered as an html list:

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


### Edit and Download GitHub Repositories Online

For programming assignments you usually need to provide the source code and
required tools out of band. But if the code is publicly available on GitHub,
you can use this element to provide a link to start an online IDE or directly
download the source code from GitHub:

<img src="screenshots/lsx-github-edit.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

```html
<lsx-github-edit
    url="https://github.com/DennisSchulmeister/dhbwka-wwi-webprog-quellcodes/tree/master/1%20HTML%20und%20CSS/Aufgaben/Einfaches%20Layout/Aufgabe"
></lsx-github-edit>
```

Optionally an different url can be given for the download button, e.g. to also
include a sample solution:

```html
<lsx-github-edit
    url      = "https://github.com/DennisSchulmeister/dhbwka-wwi-webprog-quellcodes/tree/master/1%20HTML%20und%20CSS/Aufgaben/Einfaches%20Layout/Aufgabe"
    download = "https://github.com/DennisSchulmeister/dhbwka-wwi-webprog-quellcodes/tree/master/1%20HTML%20und%20CSS/Aufgaben/Einfaches%20Layout"
></lsx-github-edit>
```

Long prefixes, that will remain the same throughout a presentation, can be also be
moved to the plugin configuration (see top of this page).


Copyright
---------

lecture-slides.js: https://www.github.com/DennisSchulmeister/lecture-slides.js <br/>
This plugin: https://github.com/DennisSchulmeister/ls-plugin-extra-tags <br/>
© 2020 – 2023 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de> <br/>
Licensed under the 2-Clause BSD License.
