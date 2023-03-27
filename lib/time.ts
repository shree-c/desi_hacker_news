const month_days_non_leap = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const month_days_leap = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const less_than_hour = 60 * 60
const less_than_day = less_than_hour * 24
const less_than_month = less_than_day * 30
const less_than_year = less_than_month * 12

export function get_duration_str(timestamp: string | number): string {
  timestamp = parseInt(timestamp + '')
  const time_obj = new Date(timestamp)
  const current_time_obj = new Date()
  let seconds = timestamp / 1000
  let current_time_seconds = current_time_obj.getTime() / 1000
  const diff = current_time_seconds - seconds
  if (diff < 0) {
    throw Error('negative difference!!')
  }
  if (diff < less_than_hour) {
    let minutes_diff = current_time_obj.getMinutes() - time_obj.getMinutes()
    minutes_diff = (minutes_diff < 0) ? minutes_diff + 59 : minutes_diff
    return `${minutes_diff} minutes ago`
  } else if (diff < less_than_day) {
    let hours_diff = current_time_obj.getHours() - time_obj.getHours()
    hours_diff = (hours_diff < 0) ? hours_diff + 23 : hours_diff
    return `${hours_diff} hours ago`
  } else if (diff < less_than_month) {
    return `${Math.floor(diff / (60 * 60 * 24))} days ago`
  } else if (diff < less_than_year) {
    let month_diff = current_time_obj.getMonth() - time_obj.getMonth()
    month_diff = (month_diff < 0) ? month_diff + 11 : month_diff
    return `${month_diff} months ago`
  } else {
    return `${current_time_obj.getFullYear() -
      time_obj.getFullYear()} years ago`
  }
}

export function add_relative_time(posts: any[]): any[] {
  return posts.map((e) => {
    e.relative_time = get_duration_str(e.timestamp)
    return e
  })
}

export function go_back(date: Date): object {
  const year = new Date(date);
  year.setUTCFullYear(date.getUTCFullYear() - 1);
  const month = new Date(date);
  month.setUTCMonth(date.getUTCMonth() - 1);
  const day = new Date(date);
  day.setUTCDate(date.getUTCDate() - 1);
  return {
    year: date_format_hyphen_seperated(year),
    month: date_format_hyphen_seperated(month),
    day: date_format_hyphen_seperated(day)
  }
}

export function go_forward(date: Date, filter: Date): object {
  const year = new Date(date);
  year.setUTCFullYear(date.getUTCFullYear() + 1);
  const month = new Date(date);
  month.setUTCMonth(date.getUTCMonth() + 1);
  const day = new Date(date);
  day.setUTCDate(date.getUTCDate() + 1);
  return {
    year: (year < filter) ? date_format_hyphen_seperated(year) : null,
    month: (month < filter) ? date_format_hyphen_seperated(month) : null,
    day: (day < filter) ? date_format_hyphen_seperated(day) : null
  }
}

export function date_format_hyphen_seperated(date: Date): string {
  let month = (date.getUTCMonth() + 1)
  let month_str = (month < 10) ? '0' + month.toString() : month.toString()
  let day = (date.getUTCDate())
  let day_str = (day < 10) ? '0' + day.toString() : day.toString()
  return `${date.getUTCFullYear()}-${month_str}-${day_str}`
}

export function date_hyphen_to_date_obj(date: string): Date {
  return new Date(date)
}

export function set_to_start_of_utc_day(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0))
}
