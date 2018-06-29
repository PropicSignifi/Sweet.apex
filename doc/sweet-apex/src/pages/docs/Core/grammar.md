---
title: "Grammar"
description: "Grammar"
layout: "guide"
icon: "flash"
weight: 3
---

###### {$page.description}

<article id="1">

## Grammar

Sweet.apex uses a lenient grammar that is compatible with Apex grammar except that it is CASE SENSITIVE.

We believe that adopting case sensitive way is both a best practice and easier to be implemented.

</article>

<article id="2">

## Grammar Parser

We use [peg.js](https://pegjs.org/) to generate our parser. To get more details, please check it.

</article>

<article id="3">

## Parsing Errors

How to show friendly error messages in case of parsing failures has always been a difficult problem.

We have tried our best to clearly indicate the error message, yet it still fails our expectation sometimes. Then you
have to rely on the error location to detect the errors.

</article>
