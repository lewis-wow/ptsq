import { useField } from 'formik';

export type TextFieldProps = {
  name: string;
  type?: 'text' | 'email' | 'password';
};

export const TextField = ({ name, type = 'text' }: TextFieldProps) => {
  const [field, _meta, helpers] = useField<string>(name);

  return (
    <input
      type={type}
      value={field.value}
      onChange={(event) => helpers.setValue(event.target.value)}
    />
  );
};
