export interface LimsYearBaseData {
  id: string;
  product: string;
  labname: string;
  breed_name: string;
  semen_code: string;
  ej_no: string;
  bach_id: string;
  sample_volume: string;
  call_cons: string;
  barcode: string;
  tube_count: string;
  volume_of_raw: string;
  washing_od_reading: string;
  labtech_name: string;
  sop_active_id: string;
  processing_steps: string; // JSON string based on your data output
  qc_status_value: string;
  output_volume: string | null;
  sorted_row: string;
  od_reading: string;
  output_doses: string | null;
  expected_doses: string;
  output_ptm: string | null;
  output_purity: string | null;
  ar_test: string | null;
  incubation_test: string | null;
  output_status: string | null;
  final_pass_doses: string | null;
  datetime: string;
  // Additional name fields from API response
  product_id: string;
  product_name: string;
  lab_id: string;
  lab_name: string;
  breed_id: string;
  breed_names: string;
  semen_id: string;
  semen_codes: string;
}

export interface LimsApiResponse {
  status: boolean;
  data: LimsYearBaseData[];
}
