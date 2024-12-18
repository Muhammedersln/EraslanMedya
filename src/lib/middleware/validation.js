import { NextResponse } from 'next/server';

// Kullanıcı doğrulama şeması
export const userValidation = {
  register: async (data) => {
    const errors = [];

    if (!data.username || data.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (!data.email || !data.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      errors.push('Please enter a valid email address');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return errors;
  },

  login: async (data) => {
    const errors = [];

    if (!data.username) {
      errors.push('Username is required');
    }

    if (!data.password) {
      errors.push('Password is required');
    }

    return errors;
  }
};

// Ürün doğrulama şeması
export const productValidation = {
  create: async (data) => {
    const errors = [];

    if (!data.name || data.name.trim().length < 3) {
      errors.push('Product name must be at least 3 characters long');
    }

    if (!data.price || isNaN(data.price) || Number(data.price) <= 0) {
      errors.push('Please enter a valid price');
    }

    if (!data.category) {
      errors.push('Category is required');
    }

    if (!data.minQuantity || Number(data.minQuantity) < 1) {
      errors.push('Minimum quantity must be at least 1');
    }

    if (!data.maxQuantity || Number(data.maxQuantity) <= Number(data.minQuantity)) {
      errors.push('Maximum quantity must be greater than minimum quantity');
    }

    return errors;
  },

  update: async (data) => {
    const errors = [];

    if (data.name && data.name.trim().length < 3) {
      errors.push('Product name must be at least 3 characters long');
    }

    if (data.price && (isNaN(data.price) || Number(data.price) <= 0)) {
      errors.push('Please enter a valid price');
    }

    if (data.minQuantity && Number(data.minQuantity) < 1) {
      errors.push('Minimum quantity must be at least 1');
    }

    if (data.maxQuantity && data.minQuantity && Number(data.maxQuantity) <= Number(data.minQuantity)) {
      errors.push('Maximum quantity must be greater than minimum quantity');
    }

    return errors;
  }
};

// Validation middleware
export async function validate(schema, data) {
  try {
    const errors = await schema(data);

    if (errors.length > 0) {
      return NextResponse.json({
        message: 'Validation Error',
        errors
      }, { status: 400 });
    }

    return null;
  } catch (error) {
    return NextResponse.json({
      message: 'Validation Error',
      error: error.message
    }, { status: 500 });
  }
} 