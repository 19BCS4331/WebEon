const transformEmptyToNull = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const transformed = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        transformed[key] = value.trim() === '' ? null : value;
      } else if (typeof value === 'object' && value !== null) {
        transformed[key] = transformEmptyToNull(value);
      } else {
        transformed[key] = value;
      }
    }
  }
  return transformed;
};

module.exports = {
  transformEmptyToNull,
};