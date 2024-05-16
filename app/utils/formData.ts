import {ZodSchema} from 'zod';

export const parseFormData = <Inferrd>(
  formData: FormData,
  schema: ZodSchema<Inferrd>,
) => {
  return schema.parse(formDataToObj(formData));
};
export const parseRequestFormData = async <Inferrd>(
  request: Request,
  schema: ZodSchema<Inferrd>,
) => {
  const data = await requestToObj(request);
  return schema.parse(data);
};

export const formDataToObj = (formData: FormData) => {
  return Object.fromEntries(formData);
};

export const requestToObj = async (request: Request) => {
  const formData = await request.formData();

  return formDataToObj(formData);
};
