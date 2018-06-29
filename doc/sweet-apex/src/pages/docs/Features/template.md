---
title: "Template"
description: "Template"
layout: "guide"
icon: "code-file"
weight: 23
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature converts templates in the source files.

</article>

<article id="2">

## Prerequisite

You need to create template files in the template directory set in the config file.

</article>

<article id="3">

## Sweet Apex Example

```javascript
@log
public class TemplateDemo {
    public static void main() {
        #debug('Hello World')

        #debug('a\,b', 'c\,d')
    }
}
```

</article>

<article id="4">

## Transpiled Apex

```javascript
public class TemplateDemo {
    public static final Log logger = Log.getLogger(TemplateDemo.class);

    public static void main() {

        if(logger.isDebugEnabled()) {
            logger.debug('Hello World');
        }
        if(logger.isDebugEnabled()) {
            logger.debug('a,b', 'c,d');
        }
    }
}
```

</article>

<article id="5">

## Usage

Here is an example of how to create a new template definition.

```javascript
// In debug.js
const _ = require('lodash');

const debug = (...values) => `
if(logger.isDebugEnabled()) {
    logger.debug(${_.join(values, ', ')});
}
`;

module.exports = debug;
```

Place this js file in the template directory set in the config file and Sweet.apex will load it.

Here is how you would invoke this template.

```
#debug('Hello World')
```

`#` starts the template, and anything between the following parenthesis, separated by comma,  will be passed in as the arguments.

For example,

```
#test(abc, def)
```

</article>
