import { apiClient } from '@/lib/api-client'
import { useExecuteSqlQuery } from '@/hooks/mutations/useExecuteSqlQuery'
import { useQuery } from '@tanstack/react-query'
import { useSqlManager } from '@/hooks/use-sql-manager'
import { SQL_COMPLETIONS } from '@/utils/sql/sql-completions'
import { Editor } from '@monaco-editor/react'
import { useTheme } from 'better-themes'
import { useEffect, useRef, useState } from 'react'

export function MonacoSqlEditor() {
  const [isBrowser, setIsBrowser] = useState(false)
  const editorRef = useRef<any>(null)
  const completionProviderRef = useRef<any>(null)
  const completionsRef = useRef<Array<any>>([])
  const tableColumnsMapRef = useRef<Record<string, Array<string>>>({})

  const { theme, systemTheme } = useTheme()
  const { query, setQuery, activeTab, updateTabExecution, addToHistory } =
    useSqlManager()
  const { mutate: executeQuery } = useExecuteSqlQuery()

  // Fetch tables and columns in public schema
  const { data: completionsData } = useQuery({
    queryKey: ['schema-completions'],
    queryFn: async () => {
      const sqlQuery = `
        SELECT 
          table_name as table, 
          column_name as column 
        FROM 
          information_schema.columns 
        WHERE 
          table_schema = 'public'
      `
      const response = await apiClient.post<
        Array<{ table: string; column: string }>
      >('/meta/query', { query: sqlQuery })
      return response.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Map and update suggestions when metadata is loaded
  useEffect(() => {
    if (!completionsData) return

    const tableColumnsMap: Record<string, Array<string>> = {}
    const tablesSet = new Set<string>()

    completionsData.forEach((row) => {
      tablesSet.add(row.table)
      if (!tableColumnsMap[row.table]) {
        tableColumnsMap[row.table] = []
      }
      tableColumnsMap[row.table].push(row.column)
    })

    tableColumnsMapRef.current = tableColumnsMap

    const dynamicSuggestions: Array<any> = []

    // Add table suggestions
    tablesSet.forEach((tableName) => {
      dynamicSuggestions.push({
        label: tableName,
        kind: 3, // Field / Class
        insertText: tableName,
        documentation: `Table in schema public`,
        detail: 'Table',
      })
    })

    // Add column suggestions
    const columnsSet = new Set<string>()
    completionsData.forEach((row) => {
      columnsSet.add(row.column)
    })

    columnsSet.forEach((colName) => {
      dynamicSuggestions.push({
        label: colName,
        kind: 4, // Property
        insertText: colName,
        documentation: `Column`,
        detail: 'Column',
      })
    })

    completionsRef.current = dynamicSuggestions
  }, [completionsData])

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

    // Dispose previous provider if any
    if (completionProviderRef.current) {
      completionProviderRef.current.dispose()
    }

    // Add SQL completion provider
    completionProviderRef.current =
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

          const lineContent = model.getLineContent(position.lineNumber)
          const textBeforeCursor = lineContent.substring(0, position.column - 1)
          const match = textBeforeCursor.match(/(\w+)\.$/)

          // If user typed "table_name.", suggest columns of that table
          if (match) {
            const tableName = match[1]
            const columns = tableColumnsMapRef.current[tableName] || []

            const suggestions = columns.map((colName) => ({
              label: colName,
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: colName,
              documentation: `Column in table ${tableName}`,
              detail: 'Column',
              range,
            }))

            return { suggestions }
          }

          // Default suggestions: static SQL + dynamic tables and columns
          const suggestions = [
            ...SQL_COMPLETIONS.map((item) => ({
              ...item,
              range,
              insertText: item.insertText || item.label,
            })),
            ...completionsRef.current.map((item) => ({
              ...item,
              range,
            })),
          ]

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
    setIsBrowser(true)
  }, [])

  useEffect(() => {
    // Focus the editor when mounted
    if (editorRef.current) {
      editorRef.current.focus()
    }

    // Cleanup completion provider on unmount
    return () => {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose()
      }
    }
  }, [])

  if (!isBrowser) {
    return <div className="h-full w-full bg-slate-100" />
  }

  return (
    <div className="h-full w-full">
      <Editor
        key={theme}
        height="100%"
        language="sql"
        value={query}
        onChange={(value: any) => setQuery(value || '')}
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
