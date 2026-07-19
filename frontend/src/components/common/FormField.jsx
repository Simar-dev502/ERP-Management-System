import { TextField } from '@mui/material';

const FormField = ({ name, label, formik, type = 'text', select = false, children, ...props }) => {
  return (
    <TextField
      fullWidth
      name={name}
      label={label}
      type={type}
      select={select}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
      margin="normal"
      {...props}
    >
      {children}
    </TextField>
  );
};

export default FormField;