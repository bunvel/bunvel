import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCreateEnum } from '@/hooks/mutations/useEnumMutations'
import { logger } from '@/lib/logger'
import { PLACEHOLDERS } from '@/constants/ui'
import { Plus, Trash2 } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface EnumFormSheetProps {
  schema: string
  children?: React.ReactNode
}

type FormValues = {
  enumName: string
  values: Array<string>
}

export function EnumFormSheet({ schema, children }: EnumFormSheetProps) {
  const [open, setOpen] = useState(false)
  const { mutate: createEnum, isPending: isSubmitting } = useCreateEnum()

  const resetForm = () => {
    setFormValues({
      enumName: '',
      values: [''],
    })
  }

  const [formValues, setFormValues] = useState<FormValues>({
    enumName: '',
    values: [''],
  })

  const handleInputChange = (field: keyof FormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...formValues.values]
    newValues[index] = value
    setFormValues((prev) => ({
      ...prev,
      values: newValues,
    }))
  }

  const addValue = () => {
    setFormValues((prev) => ({
      ...prev,
      values: [...prev.values, ''],
    }))
  }

  const removeValue = (index: number) => {
    if (formValues.values.length > 1) {
      const newValues = formValues.values.filter((_, i) => i !== index)
      setFormValues((prev) => ({
        ...prev,
        values: newValues,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate enum name
    if (!formValues.enumName.trim()) {
      toast.error('Enum name is required')
      return
    }

    // Validate enum name pattern
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formValues.enumName)) {
      toast.error(
        'Enum name must start with a letter or underscore and contain only letters, numbers, and underscores',
      )
      return
    }

    // Filter out empty values and validate
    const validValues = formValues.values.filter((value) => value.trim() !== '')
    if (validValues.length === 0) {
      toast.error('At least one enum value is required')
      return
    }

    // Check for duplicate values
    const uniqueValues = [...new Set(validValues)]
    if (uniqueValues.length !== validValues.length) {
      toast.error('Enum values must be unique')
      return
    }

    // Create enum with valid values
    createEnum(
      {
        schema: schema,
        enumName: formValues.enumName,
        values: validValues,
      },
      {
        onSuccess: () => {
          setOpen(false)
          resetForm()
        },
        onError: (error) => {
          logger
            .component('enum-form-sheet')
            .error('Error creating enum', error)
        },
      },
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (newOpen) {
          resetForm()
        }
      }}
    >
      <SheetTrigger
        render={<Button size={children ? 'sm' : 'icon'} variant="outline" />}
      >
        <HugeiconsIcon icon={Plus} className="h-4 w-4" />
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="bg-card min-w-xl flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Create a new enumerated type</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Enum Name Field */}
              <div className="flex">
                <Label htmlFor="enum-name" className="w-48">
                  Enum Name
                </Label>
                <Input
                  id="enum-name"
                  name="enumName"
                  value={formValues.enumName}
                  onChange={(e) =>
                    handleInputChange('enumName', e.target.value)
                  }
                  placeholder={PLACEHOLDERS.TABLE_NAME}
                  required
                  pattern="[a-zA-Z_][a-zA-Z0-9_]*"
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Enum Values Section */}
            <div className="space-y-4 p-6 border-t">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Enum Values</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Define the possible values for this enum type
                </p>
              </div>

              <div className="space-y-4">
                {/* Value Headers */}
                <div className="grid grid-cols-12 gap-2 pb-2 border-b">
                  <div className="col-span-11">
                    <Label className="text-sm font-medium">Value</Label>
                  </div>
                  <div className="col-span-1">
                    <Label className="text-sm font-medium"></Label>
                  </div>
                </div>

                {/* Value Rows */}
                <div className="space-y-4">
                  {formValues.values.map((value, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      {/* Value Input */}
                      <div className="col-span-11">
                        <Input
                          value={value}
                          onChange={(e) =>
                            handleValueChange(index, e.target.value)
                          }
                          placeholder="Enter enum value"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90 h-8 w-8 p-0"
                          onClick={() => removeValue(index)}
                          disabled={
                            isSubmitting || formValues.values.length === 1
                          }
                        >
                          <HugeiconsIcon icon={Trash2} className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addValue}
                      disabled={isSubmitting}
                    >
                      <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" />
                      Add Value
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="border-t p-4">
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Enum'}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
