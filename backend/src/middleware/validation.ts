import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
export const validationSchemas = {
  signup: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
  }),
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
  cropPrediction: Joi.object({
    nitrogen: Joi.number().min(0).max(200).required().messages({
      'number.min': 'Nitrogen value must be at least 0',
      'number.max': 'Nitrogen value must not exceed 200',
      'any.required': 'Nitrogen value is required',
    }),
    phosphorus: Joi.number().min(0).max(200).required().messages({
      'number.min': 'Phosphorus value must be at least 0',
      'number.max': 'Phosphorus value must not exceed 200',
      'any.required': 'Phosphorus value is required',
    }),
    potassium: Joi.number().min(0).max(200).required().messages({
      'number.min': 'Potassium value must be at least 0',
      'number.max': 'Potassium value must not exceed 200',
      'any.required': 'Potassium value is required',
    }),
    temperature: Joi.number().min(-50).max(60).required().messages({
      'number.min': 'Temperature must be at least -50°C',
      'number.max': 'Temperature must not exceed 60°C',
      'any.required': 'Temperature is required',
    }),
    humidity: Joi.number().min(0).max(100).required().messages({
      'number.min': 'Humidity must be at least 0%',
      'number.max': 'Humidity must not exceed 100%',
      'any.required': 'Humidity is required',
    }),
    ph: Joi.number().min(0).max(14).required().messages({
      'number.min': 'pH value must be at least 0',
      'number.max': 'pH value must not exceed 14',
      'any.required': 'pH value is required',
    }),
    rainfall: Joi.number().min(0).max(5000).required().messages({
      'number.min': 'Rainfall must be at least 0mm',
      'number.max': 'Rainfall must not exceed 5000mm',
      'any.required': 'Rainfall is required',
    }),
  }),
  fertilizerPrediction: Joi.object({
    nitrogen: Joi.number().min(0).max(200).required().messages({
      'number.min': 'Nitrogen value must be at least 0',
      'number.max': 'Nitrogen value must not exceed 200',
      'any.required': 'Nitrogen value is required',
    }),
    phosphorus: Joi.number().min(0).max(200).required().messages({
      'number.min': 'Phosphorus value must be at least 0',
      'number.max': 'Phosphorus value must not exceed 200',
      'any.required': 'Phosphorus value is required',
    }),
    potassium: Joi.number().min(0).max(200).required().messages({
      'number.min': 'Potassium value must be at least 0',
      'number.max': 'Potassium value must not exceed 200',
      'any.required': 'Potassium value is required',
    }),
    temperature: Joi.number().min(-50).max(60).required().messages({
      'number.min': 'Temperature must be at least -50°C',
      'number.max': 'Temperature must not exceed 60°C',
      'any.required': 'Temperature is required',
    }),
    humidity: Joi.number().min(0).max(100).required().messages({
      'number.min': 'Humidity must be at least 0%',
      'number.max': 'Humidity must not exceed 100%',
      'any.required': 'Humidity is required',
    }),
    soilType: Joi.string().valid('Sandy', 'Loamy', 'Black', 'Red', 'Clayey').required().messages({
      'any.only': 'Soil type must be one of: Sandy, Loamy, Black, Red, Clayey',
      'any.required': 'Soil type is required',
    }),
    cropType: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Crop type must be at least 2 characters',
      'string.max': 'Crop type must not exceed 50 characters',
      'any.required': 'Crop type is required',
    }),
    moisture: Joi.number().min(0).max(100).required().messages({
      'number.min': 'Moisture must be at least 0%',
      'number.max': 'Moisture must not exceed 100%',
      'any.required': 'Moisture is required',
    }),
  }),
  yieldPrediction: Joi.object({
    state: Joi.string().min(2).max(100).required().messages({
      'string.min': 'State name must be at least 2 characters',
      'string.max': 'State name must not exceed 100 characters',
      'any.required': 'State is required',
    }),
    district: Joi.string().min(2).max(100).required().messages({
      'string.min': 'District name must be at least 2 characters',
      'string.max': 'District name must not exceed 100 characters',
      'any.required': 'District is required',
    }),
    season: Joi.string().valid('Kharif', 'Rabi', 'Summer', 'Winter', 'Whole Year', 'Autumn').required().messages({
      'any.only': 'Season must be one of: Kharif, Rabi, Summer, Winter, Whole Year, Autumn',
      'any.required': 'Season is required',
    }),
    crop: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Crop name must be at least 2 characters',
      'string.max': 'Crop name must not exceed 100 characters',
      'any.required': 'Crop is required',
    }),
    year: Joi.number().integer().min(1950).max(2100).required().messages({
      'number.min': 'Year must be at least 1950',
      'number.max': 'Year must not exceed 2100',
      'any.required': 'Year is required',
    }),
    area: Joi.number().min(0.01).max(1000000).required().messages({
      'number.min': 'Area must be at least 0.01 hectares',
      'number.max': 'Area must not exceed 1,000,000 hectares',
      'any.required': 'Area is required',
    }),
    rainfall: Joi.number().min(0).max(5000).required().messages({
      'number.min': 'Rainfall must be at least 0mm',
      'number.max': 'Rainfall must not exceed 5000mm',
      'any.required': 'Rainfall is required',
    }),
  }),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
  }),
};
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): any => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return ResponseUtil.badRequest(res, errorMessages.join(', '));
    }
    req[source] = value;
    next();
  };
};
