import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useInsertRowForm, type FormField } from '@/hooks/useInsertRowForm';
import { type TableTab } from '@/hooks/useTableExplorer';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InsertRowFormProps {
  tab: TableTab;
  onInsert: (data: Record<string, any>) => Promise<void>;
  children: React.ReactNode;
}

export function InsertRowForm({ tab, onInsert, children }: InsertRowFormProps) {
  const [open, setOpen] = useState(false);
  
  const {
    formFields,
    errors,
    isSubmitting,
    handleSubmit: handleFormSubmit,
    getInputProps,
  } = useInsertRowForm({
    tab,
    onSubmit: async (data) => {
      await onInsert(data);
      toast.success('Row inserted successfully');
      setOpen(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleFormSubmit(e);
    } catch (error) {
      console.error('Error inserting row:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to insert row'
      );
    }
  };

  const renderInput = (field: FormField) => {
    const inputProps = getInputProps(field);
    const error = errors[field.name];
    const inputId = `field-${field.name}`;

    return (
      <div key={field.name} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={inputId} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.dbType && (
            <span className="text-xs text-muted-foreground">{field.dbType}</span>
          )}
        </div>

        {inputProps.type === 'select' ? (
          <div>
            <Select
              value={inputProps.value}
              onValueChange={(value: string | null) => {
                if (value !== null) {
                  inputProps.onChange(value);
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger className={cn('w-full', error && 'border-destructive')}>
                <SelectValue>{inputProps.value || `Select ${field.label}`}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {inputProps.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : inputProps.type === 'textarea' ? (
          <Textarea
            id={inputId}
            value={inputProps.value}
            onChange={inputProps.onChange}
            disabled={isSubmitting}
            className={cn('min-h-[100px]', error && 'border-destructive')}
            placeholder={`Enter ${field.label}`}
          />
        ) : (
          <Input
            id={inputId}
            type={inputProps.type}
            value={inputProps.value}
            onChange={inputProps.onChange}
            disabled={isSubmitting}
            className={cn(error && 'border-destructive')}
            placeholder={`Enter ${field.label}`}
            step={inputProps.type === 'number' ? 'any' : undefined}
          />
        )}

        {error && (
          <div className="flex items-center text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        {children}
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-[500px] p-0 flex flex-col"
      >
        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="shrink-0 border-b border-border bg-card">
            <SheetHeader className="p-6 pb-4">
              <SheetTitle className="text-xl font-semibold">
                Insert New Row
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Add a new row to {tab.schema}.{tab.table}
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form 
              id="insert-row-form" 
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {formFields.map((field) => renderInput(field))}
            </form>
          </div>

          {/* Fixed Footer */}
          <div className="shrink-0 border-t border-border bg-card p-4">
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="insert-row-form" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Inserting...' : 'Insert Row'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}