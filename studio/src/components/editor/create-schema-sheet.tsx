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
import { useCreateSchema } from '@/hooks/mutations/useCreateSchema'
import { BUTTON_LABELS, DESCRIPTIONS, PLACEHOLDERS } from '@/constants/ui'
import { Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { toast } from 'sonner'

export function CreateSchemaSheet() {
  const [open, setOpen] = useState(false)
  const { mutate: createSchema, isPending } = useCreateSchema()

  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      createSchema(
        { name: value.name },
        {
          onSuccess: () => {
            toast.success('Schema created', {
              description: `Schema "${value.name}" has been created successfully.`,
            })
            form.reset()
            setOpen(false)
          },
          onError: (error) => {
            toast.error('Error creating schema', {
              description: error.message || 'Failed to create schema',
            })
          },
        },
      )
    },
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon">
            <HugeiconsIcon icon={Plus} className="h-4 w-4" />
          </Button>
        }
      ></SheetTrigger>
      <SheetContent
        side="right"
        className="bg-card w-[400px] sm:w-[540px] flex flex-col"
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle>Create New Schema</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex-1 flex flex-col"
        >
          <div className="flex-1 p-4 overflow-auto">
            <form.Field
              name="name"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Schema Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={PLACEHOLDERS.SCHEMA_NAME}
                    required
                    pattern="[a-zA-Z_][a-zA-Z0-9_]*"
                    title={DESCRIPTIONS.SCHEMA_NAME_RULES}
                  />
                  {field.state.meta.errors && (
                    <p className="text-sm text-red-500">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
          <SheetFooter className="p-4 border-t flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {BUTTON_LABELS.CANCEL}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : BUTTON_LABELS.CREATE_SCHEMA}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
