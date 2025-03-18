Slide Carousel
==============

1. [Usage](#usage)
1. [JavaScript API](#javascript-api)


Usage
-----

A carousel allows to manually slide through a linear sequence of images.
Unlike typical HTML carousels, this one doesn't automatically move but
rather requires to click a link to see the next card.

<img src="./img/lsx-carousel.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

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