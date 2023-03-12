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
  let current_time_seconds = (new Date()).getTime() / 1000
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
    const isLeap: boolean = (current_time_obj.getFullYear() % 4 === 0) || 
    (current_time_obj.getFullYear() % 100 === 0)
    const month_days = (isLeap) ? 
    month_days_leap[current_time_obj.getMonth()] : 
    month_days_non_leap[current_time_obj.getMonth()]
    let days_diff = current_time_obj.getDate() - time_obj.getDate()
    days_diff = (days_diff < 0) ? days_diff + month_days : days_diff
    return `${days_diff} days ago`
  } else if (diff < less_than_year) {
    let month_diff = current_time_obj.getMonth() - time_obj.getMonth()
    month_diff = (month_diff < 0) ? month_diff + 11 : month_diff
    return `${month_diff} months ago`
  } else {
    return `${current_time_obj.getFullYear() -
       time_obj.getFullYear()} years ago`
  }
}

export function add_relative_time(posts: Array<any>): Array<any> {
  return posts.map((e) => {
    e.relative_time = get_duration_str(e.timestamp)
    return e
  })
}
