export function shortenLongStrings(obj, maxLength = 50) {
  if (typeof obj === 'object') {
    for (let key in obj) {
      if (typeof obj[key] === 'string' && obj[key].length > maxLength) {
        obj[key] = obj[key].substring(0, maxLength) + '...';
      } else if (typeof obj[key] === 'object') {
        shortenLongStrings(obj[key], maxLength);
      }
    }
  }
}

export function jsonStringWithShortenedStrings(obj: any, maxLength = 50) {
  shortenLongStrings(obj, maxLength);
  return JSON.stringify(obj, null, 2);
}