---
title: "Sweet.apex Core"
description: "Sweet.apex Core"
layout: "guide"
icon: "flash"
weight: 1
---

###### {$page.description}

<article id="1">

## What is Sweet.apex?

In essence, Sweet.apex is a developer tool that transpiles your Sweet Apex to Apex classes.

</article>

<article id="2">

## What is Sweet Apex?

Sweet Apex is a feature-rich Apex-like code that can be transpiled to Apex classes.

</article>

<article id="3">

## What is Transpilation?

Transpilation is the process of compiling one kind of source files to another kind.

</article>

<article id="4">

## Example

Well, these concepts are somehow confusing? Then watch the below example.

Here is a very simple Sweet Apex file:

```javascript
// Sweet Apex
public class HelloSweetApex {
    public static void main() {
        Integer a = 5;
        Integer b = 7;
        System.debug(a % b);
    }
}
```

At the first glance, you would probably think that it is just an Apex class. You are 90% percent right.

Sweet Apex files adopt a very lenient grammar that largely resembles Apex grammar, so that normal Apex classes
are actually compatible to Sweet Apex files.

The example above is actually not a valid Apex class, because it does not compile due to the use of `%`.

Here is the equivalent Apex version.

```javascript
// Apex Class
public class HelloSweetApex {
    public static void main() {
        Integer a = 5;
        Integer b = 7;
        System.debug(Math.mod(a, b));
    }
}
```

Transpilation is the process of converting the first version to the second.

Sweet Apex -> Transpiled -> Apex Class

</article>

<article id="5">

## Why?

Why all the efforts to invent the transpilation thing?

Because we want to present you a new development process.

This new process looks like this:

Writing Sweet Apex -> Transpilation -> Deployment

So now you write Sweet Apex files, instead of Apex classes. Then the transpilation process
will convert them to Apex classes. Finally you run DX scripts to deploy your Apex classes.

And the question now becomes:

Why are we writing Sweet Apex instead of Apex classes?

Then the answer is simple:

Because we can provide rich features in Sweet Apex, that Apex classes cannot.

</article>
