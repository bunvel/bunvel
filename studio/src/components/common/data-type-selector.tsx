import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { Button } from '../ui/button'

interface DataTypeOption {
  value: string
  label: string
}

interface DataTypeSelectorProps {
  value: string
  onChange: (value: string | null) => void
  dataTypes: DataTypeOption[]
  disabled?: boolean
  placeholder?: string
  label?: string
  className?: string
}

export function DataTypeSelector({
  value,
  onChange,
  dataTypes,
  disabled = false,
  placeholder = 'Choose a data type...',
  label,
  className,
}: DataTypeSelectorProps) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor="data-type" className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Combobox items={dataTypes} value={value} onValueChange={onChange}>
        <ComboboxTrigger
          render={
            <Button
              variant="outline"
              className="w-full justify-between font-normal"
              disabled={disabled}
            >
              <span className="truncate flex-1 text-left">
                <ComboboxValue placeholder={placeholder} />
              </span>
            </Button>
          }
        />
        <ComboboxContent>
          <ComboboxInput
            showTrigger={false}
            placeholder="Search data types..."
          />
          <ComboboxEmpty>No data types found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
