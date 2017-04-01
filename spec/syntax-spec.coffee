describe 'Jack grammar', ->
  grammar = null

  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage('language-jack')

    runs ->
      grammar = atom.grammars.grammarForScopeName('source.jack')

  it 'parses the grammar', ->
    expect(grammar).toBeTruthy()
    expect(grammar.scopeName).toBe 'source.jack'

  it 'does not stop highlighting after comments', ->
    {tokens} = grammar.tokenizeLine '/*\nblock comment\n*/\nclass Main {'
    expect(tokens[0]).toEqual value: '/*', scopes: [ 'source.jack', 'comment.block.jack', 'punctuation.definition.comment.jack' ]
    expect(tokens[1]).toEqual value: '\nblock comment\n', scopes: [ 'source.jack', 'comment.block.jack' ]
    expect(tokens[2]).toEqual value: '*/', scopes: [ 'source.jack', 'comment.block.jack', 'punctuation.definition.comment.jack' ]
    expect(tokens[4]).toEqual value: 'class', scopes: [ 'source.jack', 'keyword.control.jack' ]
    expect(tokens[5]).toEqual value: ' Main {', scopes: [ 'source.jack' ]

    {tokens} = grammar.tokenizeLine '// linecomment\n\nclass Main {'
    expect(tokens[0]).toEqual value: '//', scopes: [ 'source.jack', 'comment.line.double-slash.jack', 'punctuation.definition.comment.jack' ]
    expect(tokens[1]).toEqual value: ' linecomment', scopes: [ 'source.jack', 'comment.line.double-slash.jack' ]
    expect(tokens[4]).toEqual value: 'class', scopes: [ 'source.jack', 'keyword.control.jack' ]
    expect(tokens[5]).toEqual value: ' Main {', scopes: [ 'source.jack' ]
