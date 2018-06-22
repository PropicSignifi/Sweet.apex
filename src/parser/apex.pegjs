{
  function extractOptional(optional, index, def) {
    def = typeof def !== 'undefined' ?  def : null;
    return optional ? optional[index] : def;
  }

  function extractList(list, index) {
    var result = new Array(list.length), i;

    for (i = 0; i < list.length; i++) {
      result[i] = list[i][index];
    }

    return result;
  }

  function buildList(first, rest, index) {
    return [first].concat(extractList(rest, index));
  }

  function buildTree(first, rest, builder) {
    var result = first, i;

    for (i = 0; i < rest.length; i++) {
      result = builder(result, rest[i]);
    }

    return result;
  }

  function buildInfixExpr(first, rest) {
    return buildTree(first, rest, function(result, element) {
      return {
        node:        'InfixExpression',
        operator:     element[0][0], // remove ending Spacing
        leftOperand:  result,
        rightOperand: element[1]
      };
    });
  }

  function buildQualified(first, rest, index) {
    return buildTree(first, rest,
      function(result, element) {
        return {
          node:     'QualifiedName',
          qualifier: result,
          name:      element[index]
        };
      }
    );
  }

  function popQualified(tree) {
    return tree.node === 'QualifiedName'
      ? { name: tree.name, expression: tree.qualifier }
      : { name: tree, expression: null };
  }

  function extractExpressions(list) {
    return list.map(function(node) {
      return node.expression;
    });
  }

  function buildArrayTree(first, rest) {
    return buildTree(first, rest,
      function(result, element) {
      return {
        node:         'ArrayType',
        componentType: result
      };
    });
  }

  function optionalList(value) {
    return value !== null ? value : [];
  }

  function extractOptionalList(list, index) {
    return optionalList(extractOptional(list, index));
  }

  function skipNulls(list) {
    return list.filter(function(v){ return v !== null; });
  }

  function makePrimitive(code) {
    return {
      node:             'PrimitiveType',
      primitiveTypeCode: code
    }
  }

  function makeModifier(keyword) {
    return {
      node:   'Modifier',
      keyword: keyword
    };
  }

  function makeCatchFinally(catchClauses, finallyBlock) {
      return {
        catchClauses: catchClauses,
        finally:      finallyBlock
      };
  }

  function buildTypeName(qual, args, rest) {
    var first = args === null ? {
      node: 'SimpleType',
      name:  qual
    } : {
      node: 'ParameterizedType',
      type:  {
          node: 'SimpleType',
          name:  qual
      },
      typeArguments: args
    };

    return buildTree(first, rest,
      function(result, element) {
        var args = element[2];
        return args === null ? {
          node:     'QualifiedType',
          name:      element[1],
          qualifier: result
        } :
        {
          node: 'ParameterizedType',
          type:  {
            node:     'QualifiedType',
            name:      element[1],
            qualifier: result
          },
          typeArguments: args
        };
      }
    );
  }

  function mergeProps(obj, props) {
    var key;
    for (key in props) {
      if (props.hasOwnProperty(key)) {
        if (obj.hasOwnProperty(key)) {
          throw new Error(
            'Property ' + key + ' exists ' + line() + '\n' + text() +
            '\nCurrent value: ' + JSON.stringify(obj[key], null, 2) +
            '\nNew value: ' + JSON.stringify(props[key], null, 2)
          );
        } else {
          obj[key] = props[key];
        }
      }
    }
    return obj;
  }

  function buildSelectorTree(arg, sel, sels) {
    function getMergeVal(o,v) {
      switch(o.node){
        case 'SuperFieldAccess':
        case 'SuperMethodInvocation':
          return { qualifier: v };
        case 'ArrayAccess':
          return { array: v };
        default:
          return { expression: v };
      }
    }
    return buildTree(mergeProps(sel, getMergeVal(sel, arg)),
      sels, function(result, element) {
        return mergeProps(element, getMergeVal(element, result));
    });
  }

  function leadingComments(comments) {
    const leadComments = [];

    for(var i = 0; i < comments.length; i++) {
      leadComments.push({
        ast_type: "comment",
        value: comments[i].value,
        leading: true,
        trailing: false,
        printed: false
      });
    }

    return leadComments;
  }

  function TODO() {
    throw new Error('TODO: not impl line ' + line() + '\n' + text());
  }
}

/* ---- Syntactic Grammar ----- */

//-------------------------------------------------------------------------
//  Compilation Unit
//-------------------------------------------------------------------------

CompilationUnit "compilation unit"
    = Spacing types:TypeDeclaration* EmptyLines EOT
    {
      return {
        node:    'CompilationUnit',
        types:    skipNulls(types),
      };
    }

TypeDeclaration "type declaration"
    = EmptyLines
      leadComments:LeadingComments
      EmptyLines
      modifiers:Modifier*
      EmptyLines
      type:(
          ClassDeclaration
        / InterfaceDeclaration
      )
      { return mergeProps(type, { modifiers: modifiers, comments: leadComments }); }
      / SEMI
      { return null; }

//-------------------------------------------------------------------------
//  Class Declaration
//-------------------------------------------------------------------------

ClassDeclaration "class declaration"
    = CLASS id:Identifier EmptyLines gen:TypeParameters? EmptyLines ext:(EXTENDS ClassType)? EmptyLines impl:(IMPLEMENTS ClassTypeList)? EmptyLines body:ClassBody
    {
      return {
        node:               'TypeDeclaration',
        name:                id,
        superInterfaceTypes: extractOptionalList(impl, 1),
        superclassType:      extractOptional(ext, 1),
        bodyDeclarations:    body,
        typeParameters:      optionalList(gen),
        interface:           false
      };
    }

ClassBody "class body"
    = LWING decls:ClassBodyDeclaration* Indent RWING
    { return skipNulls(decls); }

ClassBodyDeclaration "class body declaration"
    = Indent SEMI
    { return null; }
    / Indent modifier:STATIC? body:Block                      // Static or Instance Initializer
    {
      return {
        node:     'Initializer',
        body:      body,
        modifiers: modifier === null ? [] : [makeModifier('static')]
      };
    }
    / Indent modifiers:Modifier* EmptyLines member:MemberDecl            // ClassMemberDeclaration
    { return mergeProps(member, { modifiers: modifiers }); }
    / Indent comment:EndOfLineComment
    { return { node: "EndOfLineComment", comment: comment.value }; }
    / Indent comment:TraditionalComment
    { return { node: "TraditionalComment", comment: comment.value }; }
    / Indent comment:JavaDocComment
    { return { node: "JavaDocComment", comment: comment.value }; }
    / Indent !LetterOrDigit [\r\n\u000C]
    { return { node: "LineEmpty" }; }

MemberDecl "member declaration"
    = InterfaceDeclaration                             // Interface
    / ClassDeclaration                                 // Class
    / EnumDeclaration                                  // Enum
    / EmptyLines type:Type EmptyLines id:Identifier
      rest:MethodDeclaratorRest                        // Method
    {
      return mergeProps(rest, {
        node:          'MethodDeclaration',
        returnType2:    type,
        name:           id,
        typeParameters: []
      });
    }
    / type:Type decls:VariableDeclarators SEMI?         // Field
    {
      return {
        node:     'FieldDeclaration',
        fragments: decls,
        type:      type
      };
    }
    / VOID id:Identifier rest:VoidMethodDeclaratorRest // Void method
    {
      return mergeProps(rest, {
        node:       'MethodDeclaration',
        returnType2: makePrimitive('void'),
        name:        id,
        constructor: false
      });
    }
    / id:Identifier rest:ConstructorDeclaratorRest     // Constructor
    {
      return mergeProps(rest, {
        node:           'MethodDeclaration',
        name:            id,
        typeParameters:  []
      });
    }

MethodDeclaratorRest "method declarator rest"
    = (EmptyLines EndOfLineComment)* params:FormalParameters dims:Dim*
      body:(MethodBody / SEMI { return null; })
    {
      return {
        parameters:       params,
        extraDimensions:  dims.length,
        body:             body,
        constructor:      false
      };
    }

VoidMethodDeclaratorRest "void method declarator rest"
    = params:FormalParameters
      body:(MethodBody / SEMI { return null; })
    {
      return {
        parameters:       params,
        body:             body,
        extraDimensions:  0,
        typeParameters:   []
      };
    }

ConstructorDeclaratorRest "constructor declarator rest"
    = params:FormalParameters body:MethodBody
    {
      return {
        parameters:       params,
        body:             body,
        returnType2:      null,
        constructor:      true,
        extraDimensions:  0
      };
    }

MethodBody "method body"
    = Block

//-------------------------------------------------------------------------
//  Interface Declaration
//-------------------------------------------------------------------------

InterfaceDeclaration "interface declaration"
    = INTERFACE id:Identifier gen:TypeParameters? ext:(EXTENDS ClassTypeList)? body:InterfaceBody
    {
      return {
          node:               'TypeDeclaration',
          name:                id,
          superInterfaceTypes: extractOptionalList(ext, 1),
          superclassType:      null,
          bodyDeclarations:    body,
          typeParameters:      optionalList(gen),
          interface:           true
        };
    }

InterfaceBody "interface body"
    = LWING decls:InterfaceBodyDeclaration* Indent RWING
    { return skipNulls(decls); }

InterfaceBodyDeclaration "interface body declaration"
    = Indent modifiers:Modifier* member:InterfaceMemberDecl
    { return mergeProps(member, { modifiers: modifiers }); }
    / Indent SEMI
    { return null; }
    / Indent comment:EndOfLineComment
    { return { node: "EndOfLineComment", comment: comment.value }; }
    / Indent comment:TraditionalComment
    { return { node: "TraditionalComment", comment: comment.value }; }
    / Indent comment:JavaDocComment
    { return { node: "JavaDocComment", comment: comment.value }; }
    / Indent !LetterOrDigit [\r\n\u000C]
    { return { node: "LineEmpty" }; }

InterfaceMemberDecl "interface member declaration"
    = InterfaceDeclaration
    / ClassDeclaration
    / EnumDeclaration
    / InterfaceMethodOrFieldDecl
    / InterfaceGenericMethodDecl
    / VOID id:Identifier rest:VoidInterfaceMethodDeclaratorRest
    { return mergeProps(rest, { name: id }); }

InterfaceMethodOrFieldDecl "interface method or field declaration"
    = type:Type id:Identifier rest:InterfaceMethodOrFieldRest
    {
      if (rest.node === 'FieldDeclaration') {
        rest.fragments[0].name = id;
        return mergeProps(rest, { type: type });
      } else {
        return mergeProps(rest, {
          returnType2:    type,
          name:           id,
          typeParameters: []
        });
      }
    }

InterfaceMethodOrFieldRest "interface method or field rest"
    = rest:ConstantDeclaratorsRest SEMI
    { return { node: 'FieldDeclaration', fragments: rest }; }
    / InterfaceMethodDeclaratorRest

InterfaceMethodDeclaratorRest "interface method declarator rest"
    = params:FormalParameters dims:Dim* SEMI
    {
      return {
        node:            'MethodDeclaration',
        parameters:       params,
        extraDimensions:  dims.length,
        body:             null,
        constructor:      false
      };
    }

InterfaceGenericMethodDecl "interface generic method declaration"
    = params:TypeParameters type:(Type / VOID { return makePrimitive('void'); }) id:Identifier rest:InterfaceMethodDeclaratorRest
    {
      return mergeProps(rest, {
        returnType2:    type,
        name:           id,
        typeParameters: params
      });
    }

VoidInterfaceMethodDeclaratorRest "void interface method declarator rest"
    = params:FormalParameters SEMI
    {
      return {
        node:            'MethodDeclaration',
        parameters:       params,
        returnType2:      makePrimitive('void'),
        extraDimensions:  0,
        typeParameters:   [],
        body:             null,
        constructor:      false
      };
    }

ConstantDeclaratorsRest "constant declarators rest"
    = first:ConstantDeclaratorRest rest:(COMMA ConstantDeclarator)*
    { return buildList(first, rest, 1); }

ConstantDeclarator "constant declarator"
    = id:Identifier rest:ConstantDeclaratorRest
    { return mergeProps(rest, { name: id }); }

ConstantDeclaratorRest "constant declarator rest"
    = dims:Dim* EQU init:VariableInitializer
    {
        return {
          node:           'VariableDeclarationFragment',
          extraDimensions: dims.length,
          initializer:     init
      };
    }

//-------------------------------------------------------------------------
//  Enum Declaration
//-------------------------------------------------------------------------

EnumDeclaration "enum declaration"
    = ENUM name:Identifier impl:(IMPLEMENTS ClassTypeList)? eb:EnumBody
    {
      return mergeProps(eb, {
        node:               'EnumDeclaration',
        name:                name,
        superInterfaceTypes: extractOptionalList(impl, 1)
      });
    }

EnumBody "enum body"
    = LWING consts:EnumConstants? COMMA? body:EnumBodyDeclarations? Indent RWING
    {
      return {
        enumConstants:    optionalList(consts),
        bodyDeclarations: optionalList(body)
      };
    }

EnumConstants "enum constants"
    = first:EnumConstant rest:(COMMA EnumConstant)*
    { return buildList(first, rest, 1); }

EnumConstant "enum constant"
    = EmptyLines annot:Annotation* name:Identifier args:Arguments? cls:ClassBody?
    {
      return {
        node:                     'EnumConstantDeclaration',
        anonymousClassDeclaration: cls === null ? null : {
          node:             'AnonymousClassDeclaration',
          bodyDeclarations:  cls
        },
        arguments:                 optionalList(args),
        modifiers:                 annot,
        name:                      name
      };
    }

EnumBodyDeclarations "enum body declarations"
    = SEMI decl:ClassBodyDeclaration*
    { return decl; }

//-------------------------------------------------------------------------
//  Variable Declarations
//-------------------------------------------------------------------------

LocalVariableDeclarationStatement "local variable declaration statement"
    = Indent modifiers:(FINAL { return makeModifier('final'); } / Annotation)*
      type:Type decls:VariableDeclarators SEMI
    {
      return {
        node:        'VariableDeclarationStatement',
        fragments:    decls,
        modifiers:    modifiers,
        type:         type
      };
    }

VariableDeclarators "variable declarators"
    = first:VariableDeclarator rest:(COMMA VariableDeclarator)*
    { return buildList(first, rest, 1); }

VariableDeclarator "variable declarator"
    = name:Identifier dims:Dim* init:(EQU VariableInitializer)? accessor:AccessorDeclarator?
    {
      return {
        node:           'VariableDeclarationFragment',
        name:            name,
        extraDimensions: dims.length,
        initializer:     extractOptional(init, 1),
        accessor:        accessor
      };
    }

SetterDeclarator "setter declarator"
    = modifiers:Modifier* Indent SET body:Block? Indent SEMI?
    {
        return {
            modifiers: modifiers,
            body: body,
        };
    }

GetterDeclarator "getter declarator"
    = modifiers:Modifier* Indent GET body:Block? Indent SEMI?
    {
        return {
            modifiers: modifiers,
            body: body,
        };
    }

AccessorDeclarator "accessor declarator"
    = LWING
    setter:SetterDeclarator?
    EmptyLines
    getter:GetterDeclarator?
    EmptyLines RWING
    {
        return {
            node: 'AccessorDeclarationFragment',
            setter: setter,
            getter: getter,
        };
    }

//-------------------------------------------------------------------------
//  Formal Parameters
//-------------------------------------------------------------------------

FormalParameters "formal parameters"
    = LPAR params:FormalParameterList? EmptyLines RPAR
    { return optionalList(params); }

FormalParameter "formal parameter"
    = EmptyLines modifiers:(FINAL { return makeModifier('final'); } / Annotation)*
      type:Type decl:VariableDeclaratorId
    {
      return mergeProps(decl, {
        type:        type,
        modifiers:   modifiers,
        varargs:     false,
        initializer: null
      });
    }

LastFormalParameter "last formal parameter"
    = modifiers:(FINAL { return makeModifier('final'); } / Annotation)*
      type:Type ELLIPSIS decl:VariableDeclaratorId
    {
      return mergeProps(decl, {
        type:        type,
        modifiers:   modifiers,
        varargs:     true,
        initializer: null
      });
    }

FormalParameterList "formal parameter list"
    = first:FormalParameter rest:(COMMA FormalParameter)* last:(COMMA LastFormalParameter)?
    { return buildList(first, rest, 1).concat(extractOptionalList(last, 1)); }
    / last:LastFormalParameter
    { return [last]; }

VariableDeclaratorId "variable declarator id"
    = id:Identifier dims:Dim*
    {
      return {
        node:           'SingleVariableDeclaration',
        name:            id,
        extraDimensions: dims.length
      };
    }

//-------------------------------------------------------------------------
//  Statements
//-------------------------------------------------------------------------

Block "block"
    = LWING statements:BlockStatements Indent RWING
    {
      return {
        node:      'Block',
        statements: statements
      }
    }

BlockStatements "block statements"
    = BlockStatement*

BlockStatement "block statement"
    = Indent op:DMLOperator operand:Expression SEMI
    {
        return {
            node: 'DMLStatement',
            operator: op[1],
            operand: operand,
        };
    }
    / LocalVariableDeclarationStatement
    / Indent modifiers:Modifier* decl:( ClassDeclaration / EnumDeclaration )
    {
      return {
        node:       'TypeDeclarationStatement',
        declaration: mergeProps(decl,  { modifiers: modifiers })
      };
    }
    / Statement

Statement "statement"
    = Block
    / Indent IF expr:ParExpression (EmptyLines EndOfLineComment)* then:Statement (EmptyLines EndOfLineComment)* alt:(ELSE Statement)?
    {
      return {
        node:         'IfStatement',
        elseStatement: extractOptional(alt, 1),
        thenStatement: then,
        expression:    expr.expression,
      };
    }
    / Indent FOR LPAR (EmptyLines EndOfLineComment)* init:ForInit? SEMI (EmptyLines EndOfLineComment)* expr:Expression? SEMI (EmptyLines EndOfLineComment)* up:ForUpdate? RPAR body:Statement
    {
      return {
        node:        'ForStatement',
        initializers: optionalList(init),
        expression:   expr,
        updaters:     optionalList(up),
        body:         body
      };
    }
    / Indent FOR LPAR param:FormalParameter COLON expr:Expression RPAR statement:Statement
    {
      return {
        node:      'EnhancedForStatement',
        parameter:  param,
        expression: expr,
        body:       statement
      };
    }
    / Indent WHILE expr:ParExpression body:Statement
    {
      return {
        node:      'WhileStatement',
        expression: expr.expression,
        body:       body
      };
    }
    / Indent DO statement:Statement WHILE expr:ParExpression SEMI
    {
      return {
        node:      'DoStatement',
        expression: expr.expression,
        body:       statement
      };
    }
    / Indent TRY body:Block
      rest:(cat:Catch+ fin:Finally? { return makeCatchFinally(cat, fin); }
            / fin:Finally { return makeCatchFinally([], fin); })
    {
      return mergeProps(rest, {
        node:        'TryStatement',
        body:         body,
        resources:    []
      });
    }
    / Indent SWITCH expr:ParExpression LWING cases:SwitchBlockStatementGroups RWING
    { return { node: 'SwitchStatement', statements: cases, expression: expr.expression }; }
    / Indent RETURN expr:Expression? SEMI
    { return { node: 'ReturnStatement', expression: expr } }
    / Indent THROW expr:Expression SEMI
    { return { node: 'ThrowStatement', expression: expr }; }
    / Indent BREAK id:Identifier? SEMI
    { return { node: 'BreakStatement', label: id }; }
    / Indent CONTINUE id:Identifier? SEMI
    { return { node: 'ContinueStatement', label: id }; }
    / Indent SEMI
    { return { node: 'EmptyStatement' }; }
    / Indent statement:StatementExpression SEMI
    { return statement; }
    / Indent id:Identifier COLON statement:Statement
    { return { node: 'LabeledStatement', label: id, body: statement }; }
    / Indent comment:EndOfLineComment
    { return { node: "EndOfLineComment", comment: comment.value }; }
    / Indent comment:TraditionalComment
    { return { node: "TraditionalComment", comment: comment.value }; }
    / Indent comment:JavaDocComment
    { return { node: "JavaDocComment", comment: comment.value }; }
    / Indent !LetterOrDigit [\r\n\u000C]
    { return { node: "LineEmpty" }; }

Catch "catch"
    = CATCH LPAR modifiers:(FINAL { return makeModifier('final'); } / Annotation)*
      first:Type rest:(OR Type)* decl:VariableDeclaratorId EmptyLines RPAR body:Block
    {
      return {
        node:       'CatchClause',
        body:        body,
        exception:   mergeProps(decl, {
          modifiers:   modifiers,
          initializer: null,
          varargs:     false,
          type:        rest.length ? {
            node: 'UnionType',
            types: buildList(first, rest, 1)
            } : first
        })
      };
    }

Finally "finally"
    = FINALLY block:Block
    { return block; }

SwitchBlockStatementGroups "switch block statement groups"
    = blocks:SwitchBlockStatementGroup*
    { return [].concat.apply([], blocks); }

SwitchBlockStatementGroup "switch block statement group"
    = expr:SwitchLabel blocks:BlockStatements
    { return [{ node: 'SwitchCase', expression: expr }].concat(blocks); }

SwitchLabel "switch label"
    = CASE expr:ConstantExpression COLON
    { return expr; }
    / CASE expr:EnumConstantName COLON
    { return expr; }
    / DEFAULT COLON
    { return null; }

ForInit "for-init"
    = modifiers:(FINAL { return makeModifier('final'); } / Annotation)* type:Type decls:VariableDeclarators
    {
      return [{
        node:     'VariableDeclarationExpression',
        modifiers: modifiers,
        fragments: decls,
        type:      type
      }];
    }
    / first:StatementExpression rest:(COMMA StatementExpression)*
    { return extractExpressions(buildList(first, rest, 1)); }

ForUpdate "for-update"
    = first:StatementExpression rest:(COMMA StatementExpression)*
    { return extractExpressions(buildList(first, rest, 1)); }

EnumConstantName "enum constant name"
    = Identifier

//-------------------------------------------------------------------------
//  Expressions
//-------------------------------------------------------------------------

StatementExpression "statement expression"
    = expr:Expression
    {
      switch(expr.node) {
        case 'SuperConstructorInvocation':
        case 'ConstructorInvocation':
          return expr;
        default:
          return {
            node:      'ExpressionStatement',
            expression: expr
          };
      }
    }

ConstantExpression "constant expression"
    = Expression

MethodReference "method reference"
    = left:Identifier COLONCOLON right:(Identifier / NEW { return { node: "SimpleName", identifier: "new" }; })
    {
      return {
        node: 'MethodReference',
        class: left,
        method: right
      };
    }

Expression "expression"
    = left:ConditionalExpression op:AssignmentOperator right:Expression
    {
      return {
        node:         'Assignment',
        operator:      op[0] /* remove ending spaces */,
        leftHandSide:  left,
        rightHandSide: right
      };
    }
    / MethodReference
    / LambdaExpression
    / ConditionalExpression

LambdaExpression "lambda expression"
    = args:Arguments POINTER body:LambdaBody
    {
      return {
        node: 'LambdaExpression',
        args: args,
        body: body
      };
    }
    / id:Identifier POINTER body:LambdaBody
    {
      return {
        node: 'LambdaExpression',
        args: [id],
        body: body
      };
    }

LambdaBody "lambda body"
    = body:MethodBody
    { return body; }
    / statement:StatementExpression
    {
      return {
        node:      'Block',
        statements: [statement]
      }
    }

AssignmentOperator "assignment operator"
    = EQU
    / PLUSEQU
    / MINUSEQU
    / STAREQU
    / DIVEQU
    / ANDEQU
    / OREQU
    / HATEQU
    / MODEQU
    / SLEQU
    / SREQU
    / BSREQU

DMLOperator "DML operator"
    = INSERT
    / UPDATE
    / UPSERT
    / DELETE
    / UNDELETE
    / MERGE

ConditionalExpression "conditional expression"
    = expr:ConditionalOrExpression QUERY then:Expression COLON alt:ConditionalExpression
    {
      return {
        node:          'ConditionalExpression',
        expression:     expr,
        thenExpression: then,
        elseExpression: alt
      };
    }
    / ConditionalOrExpression

ConditionalOrExpression "conditional OR expression"
    = (EmptyLines EndOfLineComment)* EmptyLines first:ConditionalAndExpression (EmptyLines EndOfLineComment)* EmptyLines rest:(OROR ConditionalAndExpression)*
    { return buildInfixExpr(first, rest); }

ConditionalAndExpression "conditional AND expression"
    = (EmptyLines EndOfLineComment)* EmptyLines first:InclusiveOrExpression (EmptyLines EndOfLineComment)* EmptyLines rest:(ANDAND InclusiveOrExpression)*
    { return buildInfixExpr(first, rest); }

InclusiveOrExpression "inclusive OR expression"
    = (EmptyLines EndOfLineComment)* EmptyLines first:ExclusiveOrExpression (EmptyLines EndOfLineComment)* EmptyLines rest:(OR ExclusiveOrExpression)*
    { return buildInfixExpr(first, rest); }

ExclusiveOrExpression "exclusive OR expression"
    = (EmptyLines EndOfLineComment)* EmptyLines first:AndExpression (EmptyLines EndOfLineComment)* EmptyLines rest:(HAT AndExpression)*
    { return buildInfixExpr(first, rest); }

AndExpression "AND expression"
    = (EmptyLines EndOfLineComment)* EmptyLines first:EqualityExpression (EmptyLines EndOfLineComment)* EmptyLines rest:(AND EqualityExpression)*
    { return buildInfixExpr(first, rest); }

EqualityExpression "equality expression"
    = (EmptyLines EndOfLineComment)* EmptyLines first:RelationalExpression (EmptyLines EndOfLineComment)* EmptyLines rest:((EQUAL /  NOTEQUAL) RelationalExpression)*
    { return buildInfixExpr(first, rest); }

RelationalExpression "relational expression"
    = (EmptyLines EndOfLineComment)* EmptyLines first:ShiftExpression (EmptyLines EndOfLineComment)* EmptyLines rest:((LE / GE / LT / GT) ShiftExpression / INSTANCEOF ReferenceType )*
    {
      return buildTree(first, rest, function(result, element) {
        return element[0][0] === 'instanceof' ? {
          node:        'InstanceofExpression',
          leftOperand:  result,
          rightOperand: element[1]
        } : {
          node:        'InfixExpression',
          operator:     element[0][0], // remove ending Spacing
          leftOperand:  result,
          rightOperand: element[1]
        };
      });
    }

ShiftExpression "shift expression"
    = (EmptyLines EndOfLineComment)* EmptyLines first:AdditiveExpression (EmptyLines EndOfLineComment)* EmptyLines rest:((SL / SR / BSR) AdditiveExpression)*
    { return buildInfixExpr(first, rest); }

AdditiveExpression "additive expression"
    = (EmptyLines EndOfLineComment)* EmptyLines first:MultiplicativeExpression (EmptyLines EndOfLineComment)* EmptyLines rest:((PLUS / MINUS) MultiplicativeExpression)*
    { return buildInfixExpr(first, rest); }

MultiplicativeExpression "multiplicative expression"
    = (EmptyLines EndOfLineComment)* EmptyLines first:UnaryExpression (EmptyLines EndOfLineComment)* EmptyLines rest:((STAR / DIV / MOD) UnaryExpression)*
    { return buildInfixExpr(first, rest); }

UnaryExpression "unary expression"
    = operator:PrefixOp operand:UnaryExpression
    {
      return operand.node === 'NumberLiteral' && operator === '-' &&
        (operand.token === '9223372036854775808L' ||
         operand.token === '9223372036854775808l' ||
         operand.token === '2147483648')
        ? { node: 'NumberLiteral', token: text() }
        : {
          node:    'PrefixExpression',
          operator: operator,
          operand:  operand
        };
    }
    / UnaryExpressionNotPlusMinus

UnaryExpressionNotPlusMinus "unary expression not plus minus"
    = expr:CastExpression
    {
      return {
        node:      'CastExpression',
        type:       expr[1],
        expression: expr[3]
      };
    }
    / arg:Primary sel:Selector sels:Selector* operator:PostfixOp+
    {
      return operator.length > 1 ? TODO() : {
        node:    'PostfixExpression',
        operator: operator[0],
        operand:  buildSelectorTree(arg, sel, sels)
      };
    }
    / arg:Primary sel:Selector sels:Selector*
    { return buildSelectorTree(arg, sel, sels); }
    / arg:Primary operator:PostfixOp+
    {
      return operator.length > 1 ? TODO() : {
        node:    'PostfixExpression',
        operator: operator[0],
        operand:  arg
      };
    }
    / Primary

CastExpression "cast expression"
    = LPAR PrimitiveType RPAR UnaryExpression
    / LPAR ReferenceType RPAR UnaryExpressionNotPlusMinus

Primary "primary"
    = ParExpression
    / args:NonWildcardTypeArguments ret:(ExplicitGenericInvocationSuffix
    {
      if (ret.typeArguments.length) return TODO(/* Ugly ! */);
      ret.typeArguments = args;
      return ret;
    }
    / THIS args_r:Arguments
    { return { node: 'ConstructorInvocation', arguments: args_r, typeArguments: [] }; })
    / THIS args:Arguments?
    {
      return args === null ? {
        node:     'ThisExpression',
        qualifier: null
      } : {
        node:         'ConstructorInvocation',
        arguments:     args,
        typeArguments: []
      };
    }
    / SUPER suffix:SuperSuffix
    {
      return suffix.node === 'SuperConstructorInvocation'
        ? suffix
        : mergeProps(suffix, { qualifier: null });
    }
    / Literal
    / NEW creator:Creator
    { return creator; }
    / QualifiedIdentifierSuffix
    / QualifiedIdentifier
    / type:BasicType dims:Dim* DOT CLASS
    {
      return {
        node: 'TypeLiteral',
        type:  buildArrayTree(type, dims)
      };
    }
    / VOID DOT CLASS
    {
      return {
        node: 'TypeLiteral',
        type:  makePrimitive('void')
      };
    }
    / LBRK value:(Escape / ![\[\]\\\n\r] _)* RBRK
    {
        return {
            node: 'SoqlLiteral',
            value: text(),
        };
    }

QualifiedIdentifierSuffix "qualified identifier suffix"
    = qual:QualifiedIdentifier dims:Dim+ DOT CLASS
    {
      return {
        node: 'TypeLiteral',
        type:  buildArrayTree(buildTypeName(qual, null, []), dims)
      };
    }
    / qual:QualifiedIdentifier LBRK expr:Expression RBRK
    { return { node: 'ArrayAccess', array: qual, index: expr }; }
    / qual:QualifiedIdentifier args:Arguments
    {
      return mergeProps(popQualified(qual), {
        node:         'MethodInvocation',
        arguments:     args,
        typeArguments: []
      });
    }
    / qual:QualifiedIdentifier typeArgs:TypeArguments? DOT CLASS
    { return { node: 'TypeLiteral', type: buildTypeName(qual, null, []), typeArguments: typeArgs }; }
    / qual:QualifiedIdentifier DOT ret:ExplicitGenericInvocation
    {
      if (ret.expression) return TODO(/* Ugly ! */);
      ret.expression = qual;
      return ret;
    }
    / qual:QualifiedIdentifier DOT THIS
    { return { node: 'ThisExpression', qualifier: qual }; }
    / qual:QualifiedIdentifier DOT SUPER args:Arguments
    {
      return {
        node:         'SuperConstructorInvocation',
        arguments:     args,
        expression:    qual,
        typeArguments: []
      };
    }
    / qual:QualifiedIdentifier DOT NEW args:NonWildcardTypeArguments? rest:InnerCreator
    { return mergeProps(rest, { expression: qual, typeArguments: optionalList(args) }); }

ExplicitGenericInvocation "explicit generic invocation"
    = args:NonWildcardTypeArguments ret:ExplicitGenericInvocationSuffix
    {
      if (ret.typeArguments.length) return TODO(/* Ugly ! */);
      ret.typeArguments = args;
      return ret;
    }

NonWildcardTypeArguments "non-wildcard type arguments"
    = LPOINT first:ReferenceType rest:(COMMA ReferenceType)* RPOINT
    { return buildList(first, rest, 1); }

EmptyWildcardTypeArguments "empty wildcard type arguments"
    = LPOINT RPOINT
    { return []; }

TypeArgumentsOrDiamond "type arguments or diamond"
    = LPOINT RPOINT
    { return []; }
    / TypeArguments

NonWildcardTypeArgumentsOrDiamond "non-wildcard type arguments or diamond"
    = LPOINT RPOINT
    / NonWildcardTypeArguments

ExplicitGenericInvocationSuffix "explicit generic invocation suffix"
    = SUPER suffix:SuperSuffix
    { return suffix; }
    / id:Identifier args:Arguments
    { return { node: 'MethodInvocation', arguments: args, name: id, typeArguments: [] }; }

PrefixOp "prefix operator"
    = op:(
      INC
    / DEC
    / BANG
    / TILDA
    / PLUS
    / MINUS
    ) { return op[0]; /* remove ending spaces */ }

PostfixOp "postfix operator"
    = op:(
      INC
    / DEC
    ) { return op[0]; /* remove ending spaces */ }

Selector "selector"
    = DOT id:Identifier args:Arguments
    { return { node: 'MethodInvocation', arguments: args, name: id, typeArguments: [] }; }
    / DOT id:Identifier
    { return { node: 'FieldAccess', name: id }; }
    / DOT ret:ExplicitGenericInvocation
    { return ret; }
    / DOT THIS
    { return TODO(/* Any sample ? */); }
    / DOT SUPER suffix:SuperSuffix
    { return suffix; }
    / DOT NEW args:NonWildcardTypeArguments? ret:InnerCreator
    { return mergeProps(ret, { typeArguments: optionalList(args) }); }
    / expr:DimExpr
    { return { node: 'ArrayAccess', index: expr }; }

SuperSuffix "super suffix"
    = args:Arguments
    {
      return {
        node:         'SuperConstructorInvocation',
        arguments:     args,
        expression:    null,
        typeArguments: []
      };
    }
    / DOT gen:NonWildcardTypeArguments? id:Identifier args:Arguments?
    {
      return args === null ? {
        node: 'SuperFieldAccess',
        name:  id
      } : {
        node:         'SuperMethodInvocation',
        typeArguments: optionalList(gen),
        name:          id,
        arguments:     args
      };
    }

BasicType "basic type"
    = type:(
        "byte"
      / "short"
      / "char"
      / "int"
      / "long"
      / "float"
      / "double"
      / "boolean"
      ) !LetterOrDigit Spacing
    { return makePrimitive(type); }

PrimitiveType "primitive type"
    = BasicType

Arguments "arguments"
    = LPAR EmptyLines args:(first:Expression rest:(COMMA EmptyLines Expression)* { return buildList(first, rest, 2); })? EmptyLines RPAR
    { return optionalList(args); }

Creator "creator"
    = type:(BasicType / CreatedName) rest:ArrayCreatorRest
    {
      return  {
        node:       'ArrayCreation',
        type:        buildArrayTree(type, rest.extraDims),
        initializer: rest.init,
        dimensions:  rest.dimms
      };
    }
    / type:CreatedName init:ArrayInitializer
    {
      return  {
        node:       'ArrayCreation',
        type:        buildArrayTree(type, []),
        initializer: init,
        dimensions:  []
      };
    }
    / args:(NonWildcardTypeArguments / EmptyWildcardTypeArguments)? type:CreatedName rest:ClassCreatorRest
    {
      return mergeProps(rest, {
        node:          'ClassInstanceCreation',
        type:           type,
        typeArguments:  args,
        expression:     null
      });
    }

CreatedName "created name"
    = qual:QualifiedIdentifier args:TypeArgumentsOrDiamond? rest:( DOT Identifier TypeArgumentsOrDiamond? )*
    { return buildTypeName(qual, args, rest); }

InnerCreator "inner creator"
    = id:Identifier args:NonWildcardTypeArgumentsOrDiamond? rest:ClassCreatorRest
    {
      return mergeProps(rest, {
        node: 'ClassInstanceCreation',
        type:  buildTypeName(id, args, [])
      });
    }

ClassCreatorRest "class creator rest"
    = args:Arguments body:ClassBody?
    {
      return {
        arguments:                 args,
        anonymousClassDeclaration: body === null ? null : {
          node:            'AnonymousClassDeclaration',
          bodyDeclarations: body
        }
      };
    }

ArrayCreatorRest "array creator rest"
    = dims:Dim+ init:ArrayInitializer
    { return { extraDims:dims, init:init, dimms: [] }; }
    / dimexpr:DimExpr+ dims:Dim*
    { return { extraDims:dimexpr.concat(dims), init:null, dimms: dimexpr }; }
    / dim:Dim
    { return { extraDims:[dim], init:null, dimms: [] }; }

ArrayElementValuePair "array element value pair"
    = Indent name:VariableInitializer ARROW? value:ElementValue?
    {
        if(value) {
            return {
                node: 'ArrayMemberValuePair',
                name:  name,
                value: value
            };
        }
        else {
            return name;
        }
    }

ArrayInitializer "array initializer"
    = LWING
      init:(
        first:ArrayElementValuePair rest:(COMMA ArrayElementValuePair)*
        { return buildList(first, rest, 1); }
      )?
      COMMA? EmptyLines  RWING
    { return { node: 'ArrayInitializer', expressions: optionalList(init) }; }

VariableInitializer "variable initializer"
    = ArrayInitializer
    / Expression

ParExpression "parenthesized expression"
    = LPAR EmptyLines expr:Expression EmptyLines RPAR
    { return { node: 'ParenthesizedExpression', expression: expr }; }

QualifiedIdentifier "qualified identifier"
    = first:Identifier rest:(DOT Identifier)*
    { return buildQualified(first, rest, 1); }

Dim "dimension"
    = LBRK RBRK

DimExpr "dimension expression"
    = LBRK exp:Expression RBRK
    { return exp; }

//-------------------------------------------------------------------------
//  Types and Modifiers
//-------------------------------------------------------------------------

Type "type"
    = type:(BasicType / ClassType) dims:Dim*
      { return buildArrayTree(type, dims); }

ReferenceType "reference type"
    = bas:BasicType dims:Dim+
    { return buildArrayTree(bas, dims); }
    / cls:ClassType dims:Dim*
    { return buildArrayTree(cls, dims); }

ClassType "class type"
    = qual:QualifiedIdentifier args:TypeArguments? rest:(DOT Identifier TypeArguments?)*
    { return buildTypeName(qual, args, rest); }

ClassTypeList "class type list"
    = first:ClassType rest:(COMMA ClassType)*
    { return buildList(first, rest, 1); }

TypeArguments "type arguments"
    = LPOINT first:TypeArgument rest:(COMMA TypeArgument)* EmptyLines RPOINT
    { return buildList(first, rest, 1); }

TypeArgument "type argument"
    = EmptyLines refType:ReferenceType
    { return refType; }

TypeParameters "type parameters"
    = LPOINT first:TypeParameter rest:(COMMA TypeParameter)* EmptyLines RPOINT
    { return buildList(first, rest, 1); }

TypeParameter "type parameter"
    = EmptyLines id:Identifier
    {
      return {
        node:      'TypeParameter',
        name:       id,
      };
    }
    / EmptyLines QUERY { return { node: 'WildcardType' }; }

Modifier "modifier"
    = Annotation
      / Indent keyword:(
          "public"
        / "global"
        / "protected"
        / "private"
        / "final"
        / "static"
        / "abstract"
        / "virtual"
        / "override"
        / "transient"
        / "with sharing"
        / "without sharing"
        / "func"
        / "testmethod"
        ) !LetterOrDigit Spacing
      { return makeModifier(keyword); }

//-------------------------------------------------------------------------
//  Annotations
//-------------------------------------------------------------------------

Annotation "annotation"
    = NormalAnnotation
    / SingleElementAnnotation
    / MarkerAnnotation

NormalAnnotation "normal annotation"
    = Indent AT id:QualifiedIdentifier LPAR pairs:ElementValuePairs? Indent RPAR Spacing
    {
      return {
        node:    'Annotation',
        typeName: id,
        values:   optionalList(pairs)
      };
    }

SingleElementAnnotation "single element annotation"
    = Indent AT id:QualifiedIdentifier LPAR value:ElementValue RPAR Spacing
    {
      return {
        node:    'Annotation',
        typeName: id,
        value:    value
      };
    }

MarkerAnnotation "marker annotation"
    = Indent AT id:QualifiedIdentifier Spacing
    { return { node: 'Annotation', typeName: id }; }

ElementValuePairs "element value pairs"
    = first:ElementValuePair rest:(COMMA ElementValuePair)*
    { return buildList(first, rest, 1); }

ElementValuePair "element value pair"
    = Indent name:Identifier EQU value:ElementValue
    {
      return {
        node: 'MemberValuePair',
        name:  name,
        value: value
      };
    }

ElementValue "element value"
    = ConditionalExpression
    / Annotation
    / ElementValueArrayInitializer

ElementValueArrayInitializer "element value array initializer"
    = LWING values:ElementValues? COMMA? RWING
    { return { node: 'ArrayInitializer', expressions: optionalList(values)}; }

ElementValues "element values"
    = first:ElementValue rest:(COMMA ElementValue)*
    { return buildList(first, rest, 1); }

//-------------------------------------------------------------------------
//  Spacing
//-------------------------------------------------------------------------

Indent "indent"
    = [ \t]*

Spacing "spacing"
    = Indent WhiteSpaces?

WhiteSpaces "whitespaces"
    = [\r\n\u000C]

EmptyLines "empty lines"
    = [ \t\r\n\u000C]*

LeadingComments "leading comments"
    = commentStatements:CommentStatement*
    { return leadingComments(commentStatements); }

CommentStatement "comment statement"
    = commentStatement:(
      comment:JavaDocComment [\r\n\u000C]*
      { return comment; }
      / comment:TraditionalComment [\r\n\u000C]*
      { return comment; }
      / comment:EndOfLineComment [\r\n\u000C]*
      { return comment; }
      )
    { return commentStatement; }

JavaDocComment "java doc comment"
    = "/**" comment:MultilineCommentLetter* "*/" [\r\n\u000C]?
    { return { value: "/**" + comment.join("") + "*/" }; }

TraditionalComment "traditional comment"
    = "/*" !("*"!"/") comment:MultilineCommentLetter* "*/" [\r\n\u000C]?
    { return { value: "/*" + comment.join("") + "*/" }; }

MultilineCommentLetter "multiline comment letter" = letter:(!"*/" _)
    { return letter[1]; }

EndOfLineComment "end-of-line comment"
    = "//" comment:CommentLetter* [\r\n\u000C]
    { return { value: "//" + comment.join("") }; }

CommentLetter "comment letter"
    = letter:(![\r\n\u000C] _)
    { return letter[1]; }

//-------------------------------------------------------------------------
//  Identifiers
//-------------------------------------------------------------------------

Identifier "identifier"
    = !Keyword first:Letter rest:$LetterOrDigit* Spacing
    { return { identifier: first + rest, node: 'SimpleName' }; }

Letter "letter" = [a-z] / [A-Z] / [_$] ;

LetterOrDigit "letter or digit" = [a-z] / [A-Z] / [0-9] / [_$] ;

//-------------------------------------------------------------------------
//  Keywords
//-------------------------------------------------------------------------

Keyword "keyword"
    = ( "abstract"
      / "break"
      / "case"
      / "catch"
      / "class"
      / "continue"
      / "default"
      / "do"
      / "else"
      / "enum"
      / "extends"
      / "false"
      / "final"
      / "finally"
      / "for"
      / "global"
      / "if"
      / "implements"
      / "instanceof"
      / "interface"
      / "new"
      / "null"
      / "override"
      / "private"
      / "protected"
      / "public"
      / "return"
      / "static"
      / "super"
      / "switch"
      / "this"
      / "throw"
      / "transient"
      / "true"
      / "try"
      / "virtual"
      / "void"
      / "while"
      ) !LetterOrDigit

BREAK        = Indent "break"        !LetterOrDigit Spacing
CASE         = Indent "case"         !LetterOrDigit Spacing
CATCH        = Indent "catch"        !LetterOrDigit Spacing
CLASS        = Indent "class"        !LetterOrDigit Spacing
CONTINUE     = Indent "continue"     !LetterOrDigit Spacing
DEFAULT      = Indent "default"      !LetterOrDigit Spacing
DO           = Indent "do"           !LetterOrDigit Spacing
ELSE         = Indent "else"         !LetterOrDigit Spacing
ENUM         = Indent "enum"         !LetterOrDigit Spacing
EXTENDS      = Indent "extends"      !LetterOrDigit Spacing
FINALLY      = Indent "finally"      !LetterOrDigit Spacing
FINAL        = Indent "final"        !LetterOrDigit Spacing
FOR          = Indent "for"          !LetterOrDigit Spacing
IF           = Indent "if"           !LetterOrDigit Spacing
IMPLEMENTS   = Indent "implements"   !LetterOrDigit Spacing
IMPORT       = Indent "import"       !LetterOrDigit Spacing
INTERFACE    = Indent "interface"    !LetterOrDigit Spacing
INSTANCEOF   = Indent "instanceof"   !LetterOrDigit Spacing
NEW          = Indent "new"          !LetterOrDigit Spacing
PACKAGE      = Indent "package"      !LetterOrDigit Spacing
RETURN       = Indent "return"       !LetterOrDigit Spacing
STATIC       = Indent "static"       !LetterOrDigit Spacing
SUPER        = Indent "super"        !LetterOrDigit Spacing
SWITCH       = Indent "switch"       !LetterOrDigit Spacing
THIS         = Indent "this"         !LetterOrDigit Spacing
THROW        = Indent "throw"        !LetterOrDigit Spacing
TRY          = Indent "try"          !LetterOrDigit Spacing
VOID         = Indent "void"         !LetterOrDigit Spacing
WHILE        = Indent "while"        !LetterOrDigit Spacing
SET          = Indent "set"          !LetterOrDigit Spacing
GET          = Indent "get"          !LetterOrDigit Spacing
INSERT       = Indent "insert"       !LetterOrDigit Spacing
UPDATE       = Indent "update"       !LetterOrDigit Spacing
UPSERT       = Indent "upsert"       !LetterOrDigit Spacing
DELETE       = Indent "delete"       !LetterOrDigit Spacing
UNDELETE     = Indent "undelete"     !LetterOrDigit Spacing
MERGE        = Indent "merge"        !LetterOrDigit Spacing

//-------------------------------------------------------------------------
//  Literals
//-------------------------------------------------------------------------

Literal "literal"
    = EmptyLines literal:( FloatLiteral
      / IntegerLiteral          // May be a prefix of FloatLiteral
      / StringLiteral
      / "true"  !LetterOrDigit
      { return { node: 'BooleanLiteral', booleanValue: true }; }
      / "false" !LetterOrDigit
      { return { node: 'BooleanLiteral', booleanValue: false }; }
      / "null"  !LetterOrDigit
      { return { node: 'NullLiteral' }; }
      ) Spacing
    { return literal; }

IntegerLiteral "integer literal"
    = ( HexNumeral
      / BinaryNumeral
      / OctalNumeral            // May be a prefix of HexNumeral or BinaryNumeral
      / DecimalNumeral          // May be a prefix of OctalNumeral
      ) [lL]?
    { return { node: 'NumberLiteral', token: text() }; }

DecimalNumeral "decimal numeral"
    = "0"
    / [1-9]([_]*[0-9])*

HexNumeral "hex numeral"
    = ("0x" / "0X") HexDigits

BinaryNumeral "binary numeral"
    = ("0b" / "0B") [01]([_]*[01])*

OctalNumeral "octal numeral"
    = "0" ([_]*[0-7])+

FloatLiteral "float literarl"
    = ( HexFloat
    / DecimalFloat )
    { return { node: 'NumberLiteral', token: text() }; }

DecimalFloat "decimal float"
    = Digits "." Digits?  Exponent? [fFdD]?
    / "." Digits Exponent? [fFdD]?
    / Digits Exponent [fFdD]?
    / Digits Exponent? [fFdD]

Exponent "exponent"
    = [eE] [+\-]? Digits

HexFloat "hex float"
    = HexSignificand BinaryExponent [fFdD]?

HexSignificand "hex significand"
    = ("0x" / "0X") HexDigits? "." HexDigits
    / HexNumeral "."?                           // May be a prefix of above

BinaryExponent "binary exponent"
    = [pP] [+\-]? Digits

Digits "digits"
    = [0-9]([_]*[0-9])*

HexDigits "hex digits"
    = HexDigit ([_]*HexDigit)*

HexDigit "hex digit"
    = [a-f] / [A-F] / [0-9]

StringLiteral "string literal"
    = "\"" (Escape / !["\\\n\r] _)* "\""                   // this " keeps the editor happy
    { return { node: 'StringLiteral', escapedValue: text() }; }
    / "\'" (Escape / !['\\\n\r] _)* "\'"                   // this " keeps the editor happy
    { return { node: 'StringLiteral', escapedValue: text() }; }

Escape "escape"
    = "\\" ([btnfr"'\\] / OctalEscape / UnicodeEscape)     // this " keeps the editor happy

OctalEscape "octal escape"
    = [0-3][0-7][0-7]
    / [0-7][0-7]
    / [0-7]

UnicodeEscape "unicode escape"
    = "u"+ HexDigit HexDigit HexDigit HexDigit

//-------------------------------------------------------------------------
//  Separators, Operators
//-------------------------------------------------------------------------

ARROW           =            "=>"      Spacing
AT              =            "@"       Spacing
AND             =            "&"![=&]  Spacing
ANDAND          =            "&&"      Spacing
ANDEQU          =            "&="      Spacing
BANG            =            "!" !"="  Spacing
BSR             =            ">>>"!"=" Spacing
BSREQU          =            ">>>="    Spacing
COLON           =            ":" !":"  Spacing
COLONCOLON      =            "::"      Spacing
COMMA           =            ","       Spacing
DEC             =            "--"      Spacing
DIV             =            "/" !"="  Spacing
DIVEQU          =            "/="      Spacing
DOT             = EmptyLines "."       Spacing
ELLIPSIS        =            "..."     Spacing
EQU             =            "="![=>]  Spacing
EQUAL           =            "=="      Spacing
GE              =            ">="      Spacing
GT              =            ">"![=>]  Spacing
HAT             =            "^"!"="   Spacing
HATEQU          =            "^="      Spacing
INC             =            "++"      Spacing
LBRK            =            "["       Spacing
LE              =            "<="      Spacing
LPAR            =            "("       Spacing
LPOINT          =            "<"       Spacing
LT              =            "<"![=<]  Spacing
LWING           =            "{"       Spacing
MINUS           =            "-"![=\-] Spacing
MINUSEQU        =            "-="      Spacing
MOD             =            "%"!"="   Spacing
MODEQU          =            "%="      Spacing
NOTEQUAL        =            "!="      Spacing
OR              =            "|"![=|]  Spacing
OREQU           =            "|="      Spacing
OROR            =            "||"      Spacing
PLUS            =            "+"![=+]  Spacing
PLUSEQU         =            "+="      Spacing
POINTER         =            "->"      Spacing
QUERY           =            "?"       Spacing
RBRK            =            "]"       Spacing
RPAR            =            ")"       Spacing
RPOINT          =            ">"       Spacing
RWING           =            "}"       Spacing
SEMI            =            ";"       Spacing
SL              =            "<<"!"="  Spacing
SLEQU           =            "<<="     Spacing
SR              =            ">>"![=>] Spacing
SREQU           =            ">>="     Spacing
STAR            =            "*"!"="   Spacing
STAREQU         =            "*="      Spacing
TILDA           =            "~"       Spacing

EOT = !_

_               =   .
