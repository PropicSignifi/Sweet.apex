" Vim syntax file
" Language:	Apex
" Maintainer:	Ben Burwell <ben@benburwell.com>
" URL:		https://github.com/benburwell/vim-syntax-apex
" Last Change:	2016 February 18

if version < 600
        syntax clear
elseif exists("b:current_syntax")
        finish
endif
" we define it here so that included files can test for it
let main_syntax='apex'

if version < 508
  command! -nargs=+ ApexHiLink hi link <args>
else
  command! -nargs=+ ApexHiLink hi def link <args>
endif

syntax case ignore

" keyword definitions
syn keyword apexConditional	if else switch
syn keyword apexRepeat		while for do break continue
syn keyword apexBoolean		true false
syn keyword apexConstant	null
syn keyword apexTypedef		this super
syn keyword apexOperator	new instanceof
syn keyword apexType		void
syn keyword apexStatement	return insert update upsert delete
syn keyword apexStorageClass	static transient volatile final serializable
syn keyword apexExceptions	throw try catch finally
syn keyword apexClassDecl	class interface enum extends implements
"
syn match   apexAnnotation	"@\([_$a-zA-Z][_$a-zA-Z0-9]*\.\)*[_$a-zA-Z][_$a-zA-Z0-9]*\>\(([^)]*)\)\=" contains=apexString
syn match   apexTemplate	"#\([_$a-zA-Z][_$a-zA-Z0-9]*\.\)*[_$a-zA-Z][_$a-zA-Z0-9]*\>\(([^)]*)\)\=" contains=apexString
syn keyword apexScopeDecl	global public protected private abstract
syn match apexScopeDecl "with sharing"
syn match apexScopeDecl "without sharing"

syn match	apexSpaceError	"\s\+$"
syn match	apexSpaceError	" \+\t"me=e-1

syn keyword apexType System
syn keyword apexType Boolean Integer String Date Id
syn keyword apexType Map List Set

" Comments
syn keyword apexTodo		 contained TODO FIXME
syn region  apexComment		 start="/\*"  end="\*/" contains=apexTodo
syn match   apexCommentStar	 contained "^\s*\*[^/]"me=e-1
syn match   apexCommentStar	 contained "^\s*\*$"
syn match   apexLineComment	 "//.*" contains=apexTodo

syn region apexSoqlStatement start="\[" end="\]" contains=apexSoqlKeyword,apexSoqlIdentifier,apexSoqlConstant
syn keyword apexSoqlKeyword contained SELECT TYPEOF END FROM WHERE WITH ROLLUP CUBE HAVING ASC DESC LIMIT OFFSET AND OR NOT IN
syn match apexSoqlKeyword contained "USING SCOPE"
syn match apexSoqlKeyword contained "DATA CATEGORY"
syn match apexSoqlKeyword contained "GROUP BY"
syn match apexSoqlKeyword contained "ORDER BY"
syn match apexSoqlKeyword contained "NULLS FIRST"
syn match apexSoqlKeyword contained "NULLS LAST"
syn match apexSoqlKeyword contained "FOR VIEW"
syn match apexSoqlKeyword contained "FOR REFERENCE"
syn match apexSoqlKeyword contained "UPDATE TRACKING"
syn match apexSoqlKeyword contained "UPDATE VIEWSTAT"
syn keyword apexSoqlConstant contained TRUE FALSE NULL TODAY
syn match apexSoqlIdentifier contained "\:\s*[a-zA-Z\.0-9_]\+"


" HTML enables spell checking for all text that is not in a syntax item. This
" is wrong for apex (all identifiers would be spell-checked), so it's undone
" here.
syntax spell default

syn region  apexDocComment	start="/\*\*"  end="\*/" keepend contains=apexCommentTitle,apexDocTags,apexDocSeeTag,apexTodo,@Spell
syn region  apexCommentTitle	contained matchgroup=apexDocComment start="/\*\*"   matchgroup=apexCommentTitle keepend end="\.$" end="\.[ \t\r<&]"me=e-1 end="[^{]@"me=s-2,he=s-1 end="\*/"me=s-1,he=s-1 contains=apexCommentStar,apexTodo,@Spell,apexDocTags,apexDocSeeTag

syn region apexDocTags	 contained start="{@\(code\|link\|linkplain\|inherit[Dd]oc\|doc[rR]oot\|value\)" end="}"
syn match  apexDocTags	 contained "@\(param\|exception\|throws\|since\)\s\+\S\+" contains=apexDocParam
syn match  apexDocParam	 contained "\s\S\+"
syn match  apexDocTags	 contained "@\(version\|author\|return\|deprecated\|serial\|serialField\|serialData\)\>"
syn region apexDocSeeTag	 contained matchgroup=apexDocTags start="@see\s\+" matchgroup=NONE end="\_."re=e-1 contains=apexDocSeeTagParam
syn match  apexDocSeeTagParam  contained @"\_[^"]\+"\|<a\s\+\_.\{-}</a>\|\(\k\|\.\)*\(#\k\+\((\_[^)]\+)\)\=\)\=@ extend

" match the special comment /**/
syn match   apexComment		 "/\*\*/"

" Strings and constants
syn match   apexSpecialChar	 contained "\\\([4-9]\d\|[0-3]\d\d\|[\"\\'ntbrf]\|u\x\{4\}\)"
syn region  apexString		start=+'+ end=+'+ end=+$+ contains=apexSpecialChar,@Spell
syn region  apexString		start=+`+ end=+`+ end=+$+ contains=apexSpecialChar,@Spell
syn match   apexNumber		 "\<\(0[bB][0-1]\+\|0[0-7]*\|0[xX]\x\+\|\d\(\d\|_\d\)*\)[lL]\=\>"
syn match   apexNumber		 "\(\<\d\(\d\|_\d\)*\.\(\d\(\d\|_\d\)*\)\=\|\.\d\(\d\|_\d\)*\)\([eE][-+]\=\d\(\d\|_\d\)*\)\=[fFdD]\="
syn match   apexNumber		 "\<\d\(\d\|_\d\)*[eE][-+]\=\d\(\d\|_\d\)*[fFdD]\=\>"
syn match   apexNumber		 "\<\d\(\d\|_\d\)*\([eE][-+]\=\d\(\d\|_\d\)*\)\=[fFdD]\>"

syn match  apexFuncDef "^\(\t\| \{8\}\)[_$a-zA-Z][_$a-zA-Z0-9_. \[\]<>]*([^-+*/]*)" contains=apexScopeDecl,apexType,apexStorageClass,@apexClasses,apexAnnotation
syn region apexFuncDef start=+^\(\t\| \{8\}\)[$_a-zA-Z][$_a-zA-Z0-9_. \[\]<>]*([^-+*/]*,\s*+ end=+)+ contains=apexScopeDecl,apexType,apexStorageClass,@apexClasses,apexAnnotation
syn match  apexFuncDef "^  [$_a-zA-Z][$_a-zA-Z0-9_. \[\]<>]*([^-+*/]*)" contains=apexScopeDecl,apexType,apexStorageClass,@apexClasses,apexAnnotation
syn region apexFuncDef start=+^  [$_a-zA-Z][$_a-zA-Z0-9_. \[\]<>]*([^-+*/]*,\s*+ end=+)+ contains=apexScopeDecl,apexType,apexStorageClass,@apexClasses,apexAnnotation

" The default highlighting.
if version >= 508 || !exists("did_apex_syn_inits")
  if version < 508
    let did_apex_syn_inits = 1
  endif
  ApexHiLink apexFuncDef		Function
  ApexHiLink apexConditional		Conditional
  ApexHiLink apexRepeat			Repeat
  ApexHiLink apexExceptions		Exception
  ApexHiLink apexStorageClass		StorageClass
  ApexHiLink apexClassDecl		apexStorageClass
  ApexHiLink apexScopeDecl		apexStorageClass
  ApexHiLink apexBoolean		Boolean
  ApexHiLink apexString			String
  ApexHiLink apexSpecialChar		SpecialChar
  ApexHiLink apexNumber			Number
  ApexHiLink apexStatement		Statement
  ApexHiLink apexOperator		Operator
  ApexHiLink apexComment		Comment
  ApexHiLink apexDocComment		Comment
  ApexHiLink apexLineComment		Comment
  ApexHiLink apexConstant		Constant
  ApexHiLink apexTypedef		Typedef
  ApexHiLink apexTodo			Todo
  ApexHiLink apexAnnotation		PreProc
  ApexHiLink apexTemplate		PreProc

  ApexHiLink apexCommentTitle		SpecialComment
  ApexHiLink apexDocTags		Special
  ApexHiLink apexDocParam		Function
  ApexHiLink apexDocSeeTagParam		Function
  ApexHiLink apexCommentStar		apexComment

  ApexHiLink apexType			Type

  ApexHiLink apexSpaceError		Error

  ApexHiLink apexSoqlKeyword Keyword
  ApexHiLink apexSoqlIdentifier Identifier
  ApexHiLink apexSoqlConstant Constant
endif

delcommand ApexHiLink

let b:current_syntax = "apex"

if main_syntax == 'apex'
  unlet main_syntax
endif

let b:spell_options="contained"

" vim: ts=8
