---
title: "Apex Doc"
description: "Apex Doc"
layout: "guide"
icon: "code-file"
weight: 3
---

###### {$page.description}

<article id="1">

## Feature Overview

This feature generates the JSON structure of Sweet Apex files with comments.

</article>

<article id="2">

## Prerequisite

You need to turn on by setting `generateDoc` to `sync/async`.

</article>

<article id="3">

## Sweet Apex Example

```javascript
/**
 * Sample class for ApexDoc
 *
 * @author Wilson
 * @version 1.0.0
 * */
public class ApexDoc {
    // The name
    private String name;

    /**
     * The id
     *
     * @deprecated
     * */
    public String id;

    /**
     * Run
     *
     * @example
     * new ApexDoc().run(0);
     *
     * @param i The seed
     * */
    @future(callout=true)
    public void run(Integer i) {
    }

    /**
     * My interface
     *
     * @author Adam
     * */
    public interface MyInterface {
    }

    /**
     * My enum
     *
     * @author Henry
     * */
    public enum MyEnum {
        One, Two, Three;
    }
}
```

</article>

<article id="4">

## Generated JSON

```JSON
{
    "type": "Class",
    "name": "ApexDoc",
    "modifiers": [
        "public"
    ],
    "annotations": [],
    "comments": {
        "value": "Sample class for ApexDoc",
        "properties": {
            "author": "Wilson",
            "version": "1.0.0"
        }
    },
    "superclassType": null,
    "superInterfaceTypes": [],
    "typeParameters": [],
    "classDeclarations": [],
    "interfaceDeclarations": [
        {
            "type": "Interface",
            "name": "MyInterface",
            "modifiers": [
                "public"
            ],
            "annotations": [],
            "comments": {
                "value": "My interface",
                "properties": {
                    "author": "Adam"
                }
            },
            "superclassType": null,
            "classDeclarations": [],
            "interfaceDeclarations": [],
            "enumDeclarations": [],
            "fieldDeclarations": [],
            "methodDeclarations": []
        }
    ],
    "enumDeclarations": [
        {
            "type": "Enum",
            "name": "MyEnum",
            "modifiers": [
                "public"
            ],
            "annotations": [],
            "comments": {
                "value": "My enum",
                "properties": {
                    "author": "Henry"
                }
            },
            "superInterfaceTypes": [],
            "classDeclarations": [],
            "interfaceDeclarations": [],
            "enumDeclarations": [],
            "fieldDeclarations": [],
            "methodDeclarations": []
        }
    ],
    "fieldDeclarations": [
        [
            {
                "name": "name",
                "type": "String",
                "modifiers": [
                    "private"
                ],
                "annotations": [],
                "comments": {}
            }
        ],
        [
            {
                "name": "id",
                "type": "String",
                "modifiers": [
                    "public"
                ],
                "annotations": [],
                "comments": {
                    "value": "The id",
                    "properties": {
                        "deprecated": ""
                    }
                }
            }
        ]
    ],
    "methodDeclarations": [
        {
            "name": "run",
            "modifiers": [
                "public"
            ],
            "annotations": [
                {
                    "typeName": "future",
                    "values": [
                        {
                            "name": "callout",
                            "value": "true"
                        }
                    ]
                }
            ],
            "constructor": false,
            "parameters": [
                {
                    "name": "i",
                    "type": "Integer"
                }
            ],
            "returnType": "void",
            "comments": {
                "value": "Run",
                "properties": {
                    "example": "new ApexDoc().run(0);",
                    "param": "i The seed"
                }
            }
        }
    ]
}

```

</article>

<article id="5">

## Usage

This feature is enabled only when 'generateDoc' is turned to 'sync/async' and 'docDir' is set.

</article>
