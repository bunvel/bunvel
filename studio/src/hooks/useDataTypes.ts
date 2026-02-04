import { useDatabaseEnums } from '@/hooks/queries/useEnums'
import { DATA_TYPES } from '@/utils/constant'

export function useDataTypes(schema: string) {
  const { data: enums = [] } = useDatabaseEnums(schema)

  // Group enums by name to avoid duplicates
  const uniqueEnums = enums.reduce((acc: any[], enum_: any) => {
    if (!acc.find((e: any) => e.enum_name === enum_.enum_name)) {
      acc.push(enum_)
    }
    return acc
  }, [])

  const allDataTypes = [
    ...DATA_TYPES,
    ...uniqueEnums.map((enum_: any) => ({
      value: enum_.enum_name,
      label: `${enum_.enum_name} (Custom Enum)`,
    })),
  ]

  return { allDataTypes }
}
