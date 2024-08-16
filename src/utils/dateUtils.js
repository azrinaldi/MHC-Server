const { toZonedTime, fromZonedTime, format } = require('date-fns-tz');

const timeZone = 'Asia/Jakarta';

const toWIB = (date) => {
  return toZonedTime(date, timeZone);
};

const fromWIB = (date) => {
  return fromZonedTime(date, timeZone);
};

const formatToWIB = (date, formatString = 'yyyy-MM-dd HH:mm:ss') => {
  const zonedDate = toWIB(date);
  return format(zonedDate, formatString, { timeZone });
};

module.exports = { toWIB, fromWIB, formatToWIB };
