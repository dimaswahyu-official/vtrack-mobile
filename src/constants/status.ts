export const STATUS_ACTIVITY_MD_1 = 1;
export const STATUS_ACTIVITY_MD_2 = 2;
export const STATUS_ACTIVITY_MD_21 = 211;
export const STATUS_ACTIVITY_MD_22 = 212;
export const STATUS_ACTIVITY_MD_23 = 213;
export const STATUS_ACTIVITY_MD_3 = 3;
export const STATUS_ACTIVITY_MD_31 = 311;
export const STATUS_ACTIVITY_MD_32 = 312;
export const STATUS_ACTIVITY_MD_33 = 313;
export const STATUS_INACTIVE = 0;

export const STATUS_ACTIVITY_SURVEY_12 = 12;
export const STATUS_ACTIVITY_SURVEY_21 = 21;
export const STATUS_ACTIVITY_SURVEY_31 = 31;
export const STATUS_ACTIVITY_SURVEY_32 = 32;
export const STATUS_ACTIVITY_SURVEY_41 = 41;
export const STATUS_ACTIVITY_SURVEY_51 = 51;

export const STATUS_LABELS = {
  [STATUS_INACTIVE]: 'TIDAK AKTIF',
  [STATUS_ACTIVITY_MD_1]: 'Proses Dikunjungi',
  [STATUS_ACTIVITY_MD_2]: 'Belum Dikunjungi',
  [STATUS_ACTIVITY_MD_21]: 'Outlet Tutup Sementara',
  [STATUS_ACTIVITY_MD_22]: 'Outlet Tutup Permanen',
  [STATUS_ACTIVITY_MD_23]: 'Outlet Tidak Ditemukan',
  [STATUS_ACTIVITY_MD_3]: 'Sudah Dikunjungi',
  [STATUS_ACTIVITY_SURVEY_12]: 'Approved Survey',
  [STATUS_ACTIVITY_SURVEY_21]: 'Outlet Tidak Setuju',
  [STATUS_ACTIVITY_SURVEY_31]: 'Ditolak PIC',
  [STATUS_ACTIVITY_SURVEY_41]: 'Proses HO',
  [STATUS_ACTIVITY_SURVEY_32]: 'Ditolak HO',
};

export const getStatusLabel = (statusNumber: keyof typeof STATUS_LABELS) => {
  return STATUS_LABELS[statusNumber] || 'Unknown Status';
};
