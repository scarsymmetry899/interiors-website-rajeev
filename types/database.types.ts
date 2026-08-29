export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [key: string]: any; // Stub for now
    }
    Views: {
      [key: string]: any;
    }
    Functions: {
      submit_consultation_lead: {
        Args: {
          p_first_name: string;
          p_last_name: string;
          p_email: string;
          p_phone: string | null;
          p_project_location: string | null;
          p_property_type: string | null;
          p_property_area: string | null;
          p_budget_range: string | null;
          p_project_stage: string | null;
          p_expected_start_date: string | null;
          p_service_interest: string | null;
          p_message: string | null;
          p_touchpoints: Json;
        };
        Returns: string;
      }
    }
    Enums: {
      [key: string]: any;
    }
  }
}
