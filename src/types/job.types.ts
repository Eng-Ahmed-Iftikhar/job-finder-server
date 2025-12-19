export const JobType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
} as const;
export type JobType = (typeof JobType)[keyof typeof JobType];

export const WorkMode = {
  ONSITE: 'ONSITE',
  REMOTE: 'REMOTE',
} as const;
export type WorkMode = (typeof WorkMode)[keyof typeof WorkMode];

export const WageRate = {
  HOUR: 'HOUR',
  WEEKLY: 'WEEKLY',
  MONTH: 'MONTH',
  YEAR: 'YEAR',
} as const;
export type WageRate = (typeof WageRate)[keyof typeof WageRate];

export const JobStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const JobEmployeeStatus = {
  APPLIED: 'APPLIED',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;
export type JobEmployeeStatus =
  (typeof JobEmployeeStatus)[keyof typeof JobEmployeeStatus];

export const HiringStatus = {
  URGENT: 'URGENT',
  NORMAL: 'NORMAL',
} as const;
export type HiringStatus = (typeof HiringStatus)[keyof typeof HiringStatus];
