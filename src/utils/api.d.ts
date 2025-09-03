export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Report {
  id: string;
  class: number;
  reason: string;
  isadd: boolean;
  changescore: number;
  submittime: string;
  headteacher?: string;
}

export interface HeadTeacher {
  class: number;
  headteacher: string;
}

export interface ClassRankingItem {
  class: number;
  headteacher: string;
  score: number;
}

export interface ReportTypeStats {
  [key: string]: number;
}

export interface DateReportsResponse {
  success: boolean;
  data: Report[];
  typeStats: ReportTypeStats;
  classRanking: ClassRankingItem[];
  recentReports: Report[];
  total: number;
}

export interface SubmitReportData {
  class: number;
  reason: string;
  isadd: boolean;
  changescore: number;
}

export declare const api: {
  getAllReports(): Promise<ApiResponse<Report[]>>;
  getTodayReports(): Promise<ApiResponse<Report[]>>;
  getDateReports(date: string): Promise<DateReportsResponse>;
  getHeadTeachers(): Promise<ApiResponse<HeadTeacher[]>>;
  getAllTimeRanking(): Promise<ApiResponse<ClassRankingItem[]>>;
  submitReport(reportData: SubmitReportData): Promise<ApiResponse<Report>>;
};