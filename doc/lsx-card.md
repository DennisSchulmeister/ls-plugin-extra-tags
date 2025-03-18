Card
====

Content cards with optional top/bottom image, header, body and footer.

<img src="./img/lsx-card-1.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />
<img src="./img/lsx-card-2.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

Simple markup:

```html
<lsx-card title="Card Title" bold>
    Card Body
</lsx-card>
```

Alternative:

```html
<lsx-card header="Card Title" bold>
    Card Body
</lsx-card>
```

Will both be rendered as:

```html
<div class="card">
    <div class="card-title fw-bold">
        Card Title
    </div>
    <div class="card-body">
        Card Body
    </div>
</div>
```

Complex markup:

```html
<lsx-card img="image.jpg" img-position="top" img-alt="Alt Text">
    <lsx-card-header>
        Card Header
    </lsx-card-header>
    <lsx-card-body>
        Card Body
    </lsx-card-body>
    <lsx-card-footer>
        Card Footer
    </lsx-card-footer>
</lsx-card>
```

Will be rendered as:

```html
<div class="card">
    <img src="image.jpg" class="card-img-top" alt="Alt Text">

    <div class="card-title fw-bold">
        Card Title
    </div>
    <div class="card-body">
        Card Body
    </div>
    <div class="card-footer">
        Card Footer
    </div>
</div>
```