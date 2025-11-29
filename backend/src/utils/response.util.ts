export const successResponse = (data: any, message: string = 'Éxito') => {
  return {
    success: true,
    message,
    data
  };
};
