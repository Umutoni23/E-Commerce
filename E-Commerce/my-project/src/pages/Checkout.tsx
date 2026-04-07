import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import FormInput from '../Components/FormInput';
import type { PaymentMethod } from '../types';
import toast from 'react-hot-toast';

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').refine((v) => v.trim().length > 0, 'Cannot be empty'),
  shippingAddress: z.string().min(1, 'Address is required').refine((v) => v.trim().length > 0, 'Cannot be empty'),
  city: z.string().min(1, 'City is required').refine((v) => v.trim().length > 0, 'Cannot be empty'),
  postalCode: z.string().optional(),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  paymentMethod: z.enum(['CREDIT_CARD', 'PAYPAL', 'MOBILE_MONEY', 'CASH_ON_DELIVERY']),
});

type CheckoutForm = z.infer<typeof schema>;
const STEPS = ['Shipping', 'Payment', 'Review'];

export default function Checkout() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: (payload: CheckoutForm) => api.post('/auth/orders', payload),
    onSuccess: () => {
      toast.success('Order placed successfully!');
      navigate('/orders');
    },
    onError: () => toast.error('Failed to place order'),
  });

  const nextStep = async () => {
    const fields: (keyof CheckoutForm)[][] = [
      ['fullName', 'shippingAddress', 'city', 'phoneNumber'],
      ['paymentMethod'],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => s + 1);
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
      <div className="flex items-center mb-8 gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div>
            <span className={`text-sm ${i <= step ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
        {step === 0 && (
          <>
            <FormInput label="Full Name" {...register('fullName')} error={errors.fullName?.message} />
            <FormInput label="Shipping Address" {...register('shippingAddress')} error={errors.shippingAddress?.message} />
            <FormInput label="City" {...register('city')} error={errors.city?.message} />
            <FormInput label="Postal Code (optional)" {...register('postalCode')} error={errors.postalCode?.message} />
            <FormInput label="Phone Number (10 digits)" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
          </>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Payment Method</label>
            <select {...register('paymentMethod')} className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select payment method</option>
              {(['CREDIT_CARD', 'PAYPAL', 'MOBILE_MONEY', 'CASH_ON_DELIVERY'] as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {errors.paymentMethod && <p className="text-red-500 text-xs">{errors.paymentMethod.message}</p>}
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-gray-700">Order Review</h3>
            <div className="text-sm text-gray-600 flex flex-col gap-1">
              <p><strong>Name:</strong> {getValues('fullName')}</p>
              <p><strong>Address:</strong> {getValues('shippingAddress')}, {getValues('city')}</p>
              <p><strong>Phone:</strong> {getValues('phoneNumber')}</p>
              <p><strong>Payment:</strong> {getValues('paymentMethod')}</p>
            </div>
          </div>
        )}
        <div className="flex justify-between mt-2">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Back</button>
          )}
          {step < 2 ? (
            <button type="button" onClick={nextStep} className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">Next</button>
          ) : (
            <button type="submit" disabled={mutation.isPending} className="ml-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium">
              {mutation.isPending ? 'Placing...' : 'Place Order'}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
