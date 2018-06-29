---
title: "Feature"
description: "Feature"
layout: "guide"
icon: "cloud"
weight: 2
---

###### {$page.description}

<article id="1">

## Feature Callback Methods

To implement a feature, you can choose to provide below methods.

| Method Name | Description |
| ----------- | ----------- |
| setUp(config) | Do the setup |
| finalize(config) | Do the finalization |
| accept(context) | If the feature accepts this kind of AST node |
| run(context) | Run the feature against the AST node |
| groupBy(context) | Get the string to group the AST nodes |
| runGroup(group) | Run the feature against the AST node group |

</article>

<article id="2">

## AST Node

Most of the job that a feature does is to handle the AST nodes.

You have two ways to do it.

- Direct Manipulation

You create AST nodes purely from javascript and set all the attributes, which is suitable for simple cases.

Example:

```javascript
const newNode = {
    name: {
        identifier: "mod",
        node: "SimpleName",
    },
    expression: {
        identifier: "Math",
        node: "SimpleName",
    },
    node: "MethodInvocation",
    arguments: [
        current.leftOperand,
        current.rightOperand,
    ],
    typeArguments: [],
};
```

- Parse From String

You construct the string and parse it to create the AST node, preferably to be used in complex cases.

Example:

```javascript
const newFuncTypeContent =
    `private class ${funcClassName} extends Func {
        public ${funcClassName}() {
            super(${_.size(parameters)});
        }

        public override Object execN(List<Object> args) {
            ${castStatements};
            ${lines.join('\n')};
        }
    }`;
const newFuncType = AST.parseTypeDeclaration(newFuncTypeContent);
```

</article>

<article id="3">

## AST Processing

You can choose either way to create new AST nodes, but when it comes to impacting the existing AST nodes,
you have to use the AST utility library to do this.

```javascript
AST.removeChild(methodDeclaration, 'modifiers', annotation);
AST.removeChildren(methodDeclaration.body, 'statements');
```

</article>

<article id="4">

## Batch Processing

If you want to process a group of AST nodes that have some similarities, you can implement `groupBy` and `runGroup`, instead
of `run`.

Check `src/features/not_null/index.js` for details.

</article>
