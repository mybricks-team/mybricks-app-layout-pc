export function shortenLongStrings(obj, maxLength = 50) {
  if (typeof obj === 'object') {
    const newObj = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
      if (typeof obj[key] === 'string' && obj[key].length > maxLength) {
        newObj[key] = obj[key].substring(0, maxLength) + '...';
      } else if (typeof obj[key] === 'object') {
        newObj[key] = shortenLongStrings(obj[key], maxLength);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  } else {
    return obj;
  }
}

export function jsonStringWithShortenedStrings(obj: any, maxLength = 50) {
  const newObj = shortenLongStrings(obj, maxLength);
  return JSON.stringify(newObj, null, 2);
}
