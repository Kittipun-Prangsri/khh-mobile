import mysql from 'mysql2/promise';
/**
 * HOSxP Database Connection Pool Configuration
 */
export declare function getHosxpPool(): mysql.Pool;
/**
 * Get paginated patient list directly from HOSxP `patient` table with Thai TIS-620 search support
 */
export declare function getHosxpPatientList(search?: string, page?: number, limit?: number): Promise<{
    patients: any;
    total: any;
    page: number;
    limit: number;
}>;
/**
 * Query single patient details by HN or CID
 */
export declare function getHosxpPatientByHnOrCid(query: string): Promise<{
    hn: any;
    fullName: string;
    cid: any;
    birthday: any;
    sex: string;
    phone: any;
} | null>;
/**
 * Query patient medical treatment history from HOSxP (`ovst` + `opdscreen` + `vn_stat`)
 */
export declare function getHosxpPatientMedicalHistory(hn: string, limit?: number): Promise<any>;
export interface HosxpAppointmentOptions {
    search?: string;
    startDate?: string;
    endDate?: string;
    hn?: string;
    clinic?: string;
    page?: number;
    limit?: number;
    latestPerPatient?: boolean;
}
/**
 * Query upcoming/filtered appointments directly from HOSxP `oapp` JOIN `patient`, `clinic`, `doctor`
 * Uses the latest `nextdate` per patient for upcoming appointment tracking
 * Supports search, date ranges, clinic filtering, HN filtering, pagination, and TIS-620 to UTF-8 conversion
 */
export declare function getHosxpAppointments(optionsOrLimit?: number | HosxpAppointmentOptions): Promise<any>;
/**
 * Query appointments by HN from HOSxP `oapp`
 */
export declare function getHosxpAppointmentsByHn(hn: string, limit?: number): Promise<any>;
/**
 * Query single appointment detail by `oapp_id` from HOSxP `oapp`
 */
export declare function getHosxpAppointmentById(oappId: number | string): Promise<{
    id: string;
    oapp_id: any;
    hn: any;
    rawHn: any;
    patientName: any;
    phone: any;
    cid: any;
    birthday: any;
    vstDate: any;
    nextDate: any;
    nextTime: any;
    rawDate: string;
    dateFormatted: string;
    timeFormatted: string;
    clinicCode: any;
    clinicName: any;
    doctorCode: any;
    doctorName: any;
    appCause: any;
    note: any;
    contactPoint: any;
    status: string;
} | null>;
/**
 * Query NCDs missed follow-ups and calculate patient overdue days from HOSxP
 * Filters out patients who have already visited or rescheduled
 */
export declare function getHosxpMissedFollowUps(limit?: number, daysInterval?: number): Promise<any>;
export interface HosxpNcdRegistryOptions {
    clinic?: string;
    controlStatus?: 'all' | 'controlled' | 'uncontrolled' | 'unknown';
    search?: string;
    page?: number;
    limit?: number;
}
/**
 * Query DM/HT Patient Registry & Treatment Monitoring data from HOSxP
 * Joining patient, clinicmember, latest opdscreen/vn_stat (vitals/labs), and latest oapp (appointments)
 */
export declare function getHosxpNcdRegistry(options?: HosxpNcdRegistryOptions): Promise<{
    patients: any;
    total: any;
    page: number;
    limit: number;
}>;
/**
 * Query DM/HT Registry Summary Statistics and Control Rates
 */
export declare function getHosxpNcdRegistryStats(): Promise<{
    dmTotal: any;
    htTotal: any;
    ckdTotal: any;
    dmControlRate: number;
    htControlRate: number;
    uncontrolledCount: any;
}>;
