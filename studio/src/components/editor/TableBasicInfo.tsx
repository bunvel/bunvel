import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PLACEHOLDERS, TABLE_FORM_MESSAGES } from '@/utils/constant'

interface TableBasicInfoProps {
  name: string
  description: string
  onInputChange: (field: string, value: string) => void
  disabled?: boolean
}

export function TableBasicInfo({
  name,
  description,
  onInputChange,
  disabled = false,
}: TableBasicInfoProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex">
        <Label htmlFor="table-name" className="w-48">
          {TABLE_FORM_MESSAGES.TABLE_NAME}
        </Label>
        <Input
          id="table-name"
          name="name"
          value={name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder={PLACEHOLDERS.TABLE_NAME}
          required
          pattern="[a-zA-Z_][a-zA-Z0-9_]*"
          className="w-full"
          disabled={disabled}
        />
      </div>
      <div className="flex">
        <Label htmlFor="description" className="w-48">
          {TABLE_FORM_MESSAGES.DESCRIPTION}
        </Label>
        <Input
          id="description"
          name="description"
          value={description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder={PLACEHOLDERS.OPTIONAL}
          className="w-full"
          disabled={disabled}
        />
      </div>
    </div>
  )
}
