'use server';

import z, { ZodError } from 'zod';
import { getFormData, getYekaterinburgDate } from './utils';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

interface ReturnInvoiceActionData {
  status: 'error' | 'success';
  message: string;
}

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData): Promise<ReturnInvoiceActionData> {
  try {
    const { customerId, amount, status } = getFormData(formData, CreateInvoice);
    const amountInCents = amount * 100;

    const date = getYekaterinburgDate();

    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    console.error(error);
    let zodErrors: string[] = [];

    if (error instanceof ZodError) {
      zodErrors = Object.values(error)[0].map((error: { message: string }) => error.message);
    }
    return {
      status: 'error',
      message: `При создании счета произошла ошибка. ${zodErrors.join(',')} `,
    };
  }

  revalidatePath('/dashboard/invoices');
  return {
    status: 'success',
    message: 'Счет создан.',
  };
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  invoiceId: string,
  formData: FormData,
): Promise<ReturnInvoiceActionData> {
  try {
    const { customerId, amount, status } = getFormData(formData, UpdateInvoice);
    const amountInCents = amount * 100;

    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${invoiceId}
  `;
  } catch (error) {
    console.error(error);
    let zodErrors: string[] = [];

    if (error instanceof ZodError) {
      zodErrors = Object.values(error)[0].map((error: { message: string }) => error.message);
    }

    return {
      status: 'error',
      message: `При изменении счета произошла ошибка. ${zodErrors.join(',')}`,
    };
  }

  revalidatePath('/dashboard/invoices');

  return {
    status: 'success',
    message: 'Счет успешно обновлен.',
  };
}

export async function deleteInvoice(invoiceId: string) {
  await sql`DELETE FROM invoices WHERE id = ${invoiceId}`;
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
