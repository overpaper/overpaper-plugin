import getDate from "date-fns/get_date";
import getMonth from "date-fns/get_month";
import getYear from "date-fns/get_year";
import setDate from "date-fns/set_date";
import setISOWeek from "date-fns/set_iso_week";
import setMonth from "date-fns/set_month";
import setYear from "date-fns/set_year";

export const createDate = ({
  year = getYear(new Date()),
  month = getMonth(new Date()),
  week = -1,
  day = getDate(new Date())
}: {
  year?: number;
  month?: number;
  week?: number;
  day?: number;
}) => {
  let date = new Date();
  date = setYear(date, year);
  if (week === -1 && month !== -1) {
    date = setMonth(date, month);
  }
  if (week !== -1 && day === -1) {
    date = setISOWeek(date, week);
  }
  if (week === -1 && day !== -1) {
    date = setDate(date, day);
  }
  return date;
};
