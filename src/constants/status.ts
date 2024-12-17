export const STATUS_PROCESSING = 100;
export const STATUS_HO_PROCESSING = 101;

export const STATUS_NOT_VISITED = 400;
export const STATUS_TEMP_CLOSED = 401;
export const STATUS_PERM_CLOSED = 402;
export const STATUS_NOT_FOUND = 403;
export const STATUS_REJECTED = 404;
export const STATUS_CANCELLED = 405;
export const STATUS_PIC_REJECTED = 406;
export const STATUS_HO_REJECTED = 407;

export const STATUS_VISITED = 200;
export const STATUS_COMPLETED = 201;
export const STATUS_OUTLET_AGREED = 202;
export const STATUS_APPROVED = 203;

// MD Activity Status Codes
export const EXISTING_SURVEY_STATUS = {
  [STATUS_PROCESSING]: 'Proses Dikunjungi',
  [STATUS_NOT_VISITED]: 'Belum Dikunjungi',
  [STATUS_TEMP_CLOSED]: 'Outlet Tutup Sementara',
  [STATUS_PERM_CLOSED]: 'Outlet Tutup Permanen',
  [STATUS_NOT_FOUND]: 'Outlet Tidak Ditemukan',
  [STATUS_CANCELLED]: 'Schedule Dibatalkan',
  [STATUS_VISITED]: 'Sudah Dikunjungi',
  [STATUS_COMPLETED]: 'Selesai',
};

// Survey Activity Status Codes
export const NEW_SURVEY_STATUS = {
  [STATUS_PROCESSING]: 'Proses Dikunjungi',
  [STATUS_NOT_VISITED]: 'Belum Dikunjungi',
  [STATUS_OUTLET_AGREED]: 'Outlet Setuju',
  [STATUS_TEMP_CLOSED]: 'Outlet Tutup Sementara',
  [STATUS_PERM_CLOSED]: 'Outlet Tutup Permanen',
  [STATUS_NOT_FOUND]: 'Outlet Tidak Ditemukan',
  [STATUS_REJECTED]: 'Outlet Menolak',
  [STATUS_PIC_REJECTED]: 'Ditolak PIC',
  [STATUS_HO_PROCESSING]: 'Proses HO',
  [STATUS_HO_REJECTED]: 'Ditolak HO',
  [STATUS_APPROVED]: 'Disetujui HO',
};

export const getStatusLabel = (statusNumber: keyof typeof EXISTING_SURVEY_STATUS) => {
  return EXISTING_SURVEY_STATUS[statusNumber] || 'Unknown Status';
};

export const getStatusLabelNew = (statusNumber: keyof typeof NEW_SURVEY_STATUS) => {
  return NEW_SURVEY_STATUS[statusNumber] || 'Unknown Status';
};