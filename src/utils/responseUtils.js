export const extractArrayFromResponse = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.suggestions)) {
    return payload.suggestions;
  }

  if (Array.isArray(payload?.data?.suggestions)) {
    return payload.data.suggestions;
  }

  return [];
};
