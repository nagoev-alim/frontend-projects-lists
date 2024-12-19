import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { UseFormReturn, ControllerRenderProps, FieldValues } from 'react-hook-form';

type FormFieldWrapperProps = {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: 'input' | 'textarea';
}

export const FormFieldWrapper = ({ form, name, label, type = 'input', placeholder }: FormFieldWrapperProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }: { field: ControllerRenderProps<FieldValues, string> }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {type === 'input' ? (
              <Input {...field} placeholder={placeholder} />
            ) : (
              <Textarea {...field} placeholder={placeholder} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

FormFieldWrapper.displayName = 'FormFieldWrapper';
