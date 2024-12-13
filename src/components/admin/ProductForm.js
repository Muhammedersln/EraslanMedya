import { useForm } from 'react-hook-form';

export default function ProductForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    // Form işlemleri
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', { 
          required: 'Ürün adı zorunludur',
          minLength: { value: 3, message: 'Minimum 3 karakter olmalıdır' }
        })}
      />
      {errors.name && <span className="text-red-500">{errors.name.message}</span>}
      {/* Diğer form alanları */}
    </form>
  );
} 