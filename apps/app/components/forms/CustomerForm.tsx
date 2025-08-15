'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  apiKey: z.string().min(32, 'API key must be at least 32 characters'),
  dailyLimit: z.number().positive('Daily limit must be positive'),
  monthlyBudget: z.number().positive('Monthly budget must be positive'),
  alertThreshold: z.number().min(0).max(100, 'Threshold must be between 0-100'),
  enableAlerts: z.boolean(),
  models: z.array(z.string()).min(1, 'Select at least one model'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  defaultValues?: Partial<CustomerFormData>;
}

export function CustomerForm({ onSubmit, defaultValues }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      enableAlerts: true,
      alertThreshold: 80,
      models: ['gpt-4', 'gpt-3.5-turbo'],
      ...defaultValues,
    },
  });

  const enableAlerts = watch('enableAlerts');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Settings</CardTitle>
        <CardDescription>
          Configure customer API access and usage limits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Customer Name
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Acme Corp"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="contact@acme.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              API Key
            </label>
            <input
              {...register('apiKey')}
              type="password"
              className="w-full px-3 py-2 border rounded-md font-mono"
              placeholder="sk-..."
            />
            {errors.apiKey && (
              <p className="text-red-500 text-sm mt-1">{errors.apiKey.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Daily Limit ($)
              </label>
              <input
                {...register('dailyLimit', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="100.00"
              />
              {errors.dailyLimit && (
                <p className="text-red-500 text-sm mt-1">{errors.dailyLimit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Monthly Budget ($)
              </label>
              <input
                {...register('monthlyBudget', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="3000.00"
              />
              {errors.monthlyBudget && (
                <p className="text-red-500 text-sm mt-1">{errors.monthlyBudget.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                {...register('enableAlerts')}
                type="checkbox"
                id="enableAlerts"
                className="rounded"
              />
              <label htmlFor="enableAlerts" className="text-sm font-medium">
                Enable cost alerts
              </label>
            </div>

            {enableAlerts && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alert Threshold (%)
                </label>
                <input
                  {...register('alertThreshold', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="80"
                />
                {errors.alertThreshold && (
                  <p className="text-red-500 text-sm mt-1">{errors.alertThreshold.message}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Allowed Models
            </label>
            <div className="space-y-2">
              {['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'].map(model => (
                <label key={model} className="flex items-center space-x-2">
                  <input
                    {...register('models')}
                    type="checkbox"
                    value={model}
                    className="rounded"
                  />
                  <span className="text-sm">{model}</span>
                </label>
              ))}
            </div>
            {errors.models && (
              <p className="text-red-500 text-sm mt-1">{errors.models.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : 'Save Customer Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}