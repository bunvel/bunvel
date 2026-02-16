import { useExecuteSqlQuery } from '@/hooks/mutations/useExecuteSqlQuery'
import { useSqlManager } from '@/hooks/use-sql-manager'
import { SQL_COMPLETIONS } from '@/utils/sql/sql-completions'
import { Editor } from '@monaco-editor/react'
import { useTheme } from 'better-themes'
import { useEffect, useRef } from 'react'

export function MonacoSqlEditor() {
  const editorRef = useRef<any>(null)
  const { theme, systemTheme } = useTheme()
  const { query, setQuery, activeTab, updateTabExecution, addToHistory } =
    useSqlManager()
  const { mutate: executeQuery } = useExecuteSqlQuery()

  const handleExecute = () => {
    if (!query.trim() || !activeTab) return

    updateTabExecution(activeTab.id, undefined, undefined, true, query)

    executeQuery(query, {
      onSuccess: (result) => {
        updateTabExecution(activeTab.id, result, undefined, false, query)
        addToHistory(query, true)
      },
      onError: (error) => {
        updateTabExecution(activeTab.id, undefined, error, false, query)
        addToHistory(query, false)
      },
    })
  }

  const getEditorTheme = () => {
    if (theme === 'system') {
      return systemTheme === 'dark' ? 'vs-dark' : 'vs-light'
    }
    return theme === 'dark' ? 'vs-dark' : 'vs-light'
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Configure basic SQL language features
    monaco.languages.setLanguageConfiguration('sql', {
      comments: {
        blockComment: ['/*', '*/'],
        lineComment: '--',
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"', notIn: ['string'] },
        { open: "'", close: "'", notIn: ['string'] },
      ],
    })

    // Add SQL completion provider
    monaco.languages.registerCompletionItemProvider('sql', {
      triggerCharacters: [' ', '.', '(', ',', '"', "'"],
      provideCompletionItems: (model: any, position: any, _context: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = SQL_COMPLETIONS.map((item) => ({
          ...item,
          range,
          insertText: item.insertText || item.label,
        }))

        return { suggestions }
      },
    })

    // Add keyboard shortcut for Ctrl/Cmd + Enter to execute
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecute()
    })

    // Set the language to SQL
    monaco.editor.setModelLanguage(editor.getModel(), 'sql')
  }

  useEffect(() => {
    // Focus the editor when mounted
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  return (
    <div className="h-full w-full">
      <Editor
        key={theme}
        height="100%"
        language="sql"
        value={query}
        onChange={(value) => setQuery(value || '')}
        onMount={handleEditorDidMount}
        theme={getEditorTheme()}
        options={{
          fontSize: 14,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          parameterHints: { enabled: true },
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          wordBasedSuggestions: 'allDocuments',
          formatOnPaste: true,
          formatOnType: true,
          suggestSelection: 'first',
          occurrencesHighlight: 'off',
          padding: { top: 10, bottom: 10 },
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          renderLineHighlight: 'line',
          renderWhitespace: 'selection',
          selectionHighlight: true,
          bracketPairColorization: { enabled: true },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showClasses: true,
            showFunctions: true,
            showVariables: true,
          },
        }}
      />
    </div>
  )
}
