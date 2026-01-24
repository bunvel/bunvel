import { useProject } from '@/hooks/queries/useProject'
import type { Project } from '@/types'
import { createContext, useContext } from 'react'

interface ProjectContextType {
  project: Project | undefined
  isLoading: boolean
  error: Error | null
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { data: project, isLoading, error } = useProject()

  return (
    <ProjectContext.Provider value={{ project, isLoading, error }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjectContext() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider')
  }
  return context
}
