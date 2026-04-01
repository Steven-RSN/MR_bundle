function sanitize(data) {
  if (typeof data !== 'string') return data;

  return data
    .trim()
    .replace(/<\/?[^>]+>/gi, '') 
    .replace(/\\/g, '');         
}

  module.exports = sanitize;