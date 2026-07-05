export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          id: string
          ip_address: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          date: string
          display_id: string
          id: string
          notes: string | null
          staff_id: string
          status: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string
          display_id?: string
          id?: string
          notes?: string | null
          staff_id: string
          status?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string
          display_id?: string
          id?: string
          notes?: string | null
          staff_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount: number | null
          booking_date: string
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          description: string | null
          display_id: string
          id: string
          notes: string | null
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          service: string | null
          source: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          booking_date?: string
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          description?: string | null
          display_id?: string
          id?: string
          notes?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          service?: string | null
          source?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          booking_date?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          description?: string | null
          display_id?: string
          id?: string
          notes?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          service?: string | null
          source?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      complaint_notes: {
        Row: {
          attachments: string[] | null
          complaint_id: string
          created_at: string | null
          id: string
          note: string
          status: string
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          complaint_id: string
          created_at?: string | null
          id?: string
          note: string
          status: string
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          complaint_id?: string
          created_at?: string | null
          id?: string
          note?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_notes_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string
          email: string
          id: string
          name: string
          phone: string | null
          resolved_at: string | null
          resolved_attachments: string[] | null
          resolved_notes: string | null
          status: string
          subject: string
          tracking_id: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description: string
          email: string
          id?: string
          name: string
          phone?: string | null
          resolved_at?: string | null
          resolved_attachments?: string[] | null
          resolved_notes?: string | null
          status?: string
          subject: string
          tracking_id?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          resolved_at?: string | null
          resolved_attachments?: string[] | null
          resolved_notes?: string | null
          status?: string
          subject?: string
          tracking_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          created_at: string | null
          display_id: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          display_id?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          display_id?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      feedback_calls: {
        Row: {
          call_date: string | null
          called_by: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          display_id: string
          id: string
          notes: string | null
          project_reference: string | null
          q1_rating: number | null
          q1_text: string | null
          q2_rating: number | null
          q2_text: string | null
          q3_rating: number | null
          q3_text: string | null
          q4_rating: number | null
          q4_text: string | null
          q5_rating: number | null
          q5_text: string | null
          total_score: number | null
        }
        Insert: {
          call_date?: string | null
          called_by?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          display_id?: string
          id?: string
          notes?: string | null
          project_reference?: string | null
          q1_rating?: number | null
          q1_text?: string | null
          q2_rating?: number | null
          q2_text?: string | null
          q3_rating?: number | null
          q3_text?: string | null
          q4_rating?: number | null
          q4_text?: string | null
          q5_rating?: number | null
          q5_text?: string | null
          total_score?: number | null
        }
        Update: {
          call_date?: string | null
          called_by?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          display_id?: string
          id?: string
          notes?: string | null
          project_reference?: string | null
          q1_rating?: number | null
          q1_text?: string | null
          q2_rating?: number | null
          q2_text?: string | null
          q3_rating?: number | null
          q3_text?: string | null
          q4_rating?: number | null
          q4_text?: string | null
          q5_rating?: number | null
          q5_text?: string | null
          total_score?: number | null
        }
        Relationships: []
      }
      financials: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          display_id: string
          entry_date: string
          id: string
          notes: string | null
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string | null
          description: string
          display_id?: string
          entry_date?: string
          id?: string
          notes?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          display_id?: string
          entry_date?: string
          id?: string
          notes?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string | null
          display_id: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          phone: string | null
          resolved_at: string | null
          resolved_attachments: string[] | null
          resolved_notes: string | null
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          display_id?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          phone?: string | null
          resolved_at?: string | null
          resolved_attachments?: string[] | null
          resolved_notes?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          display_id?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          phone?: string | null
          resolved_at?: string | null
          resolved_attachments?: string[] | null
          resolved_notes?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_address: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          discount: number | null
          due_date: string | null
          id: string
          invoice_number: string
          items: Json
          notes: string | null
          paid_amount: number | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total: number
          updated_at: string | null
          verification_id: string
        }
        Insert: {
          client_address?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          items?: Json
          notes?: string | null
          paid_amount?: number | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
          verification_id?: string
        }
        Update: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          items?: Json
          notes?: string | null
          paid_amount?: number | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          admin_notes: string | null
          age: number | null
          application_number: string
          bform_number: string | null
          city: string | null
          cnic: string
          cnic_doc: string | null
          created_at: string | null
          date_of_birth: string | null
          district: string | null
          education: string | null
          educational_docs: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_number: string | null
          emergency_contact_relation: string | null
          emergency_contact_whatsapp: string | null
          employee_id: string | null
          experience_letter: string | null
          father_husband_name: string | null
          full_name: string
          id: string
          job_id: string | null
          job_title: string
          nationality: string | null
          other_docs: string | null
          passport_photo: string | null
          permanent_address: string | null
          phone1: string | null
          phone2: string | null
          postal_address: string | null
          province: string | null
          resume_cv: string | null
          status: string
          tehsil: string | null
          updated_at: string | null
          verification_id: string
          whatsapp: string | null
          work_experience: string | null
        }
        Insert: {
          admin_notes?: string | null
          age?: number | null
          application_number?: string
          bform_number?: string | null
          city?: string | null
          cnic: string
          cnic_doc?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          district?: string | null
          education?: string | null
          educational_docs?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          emergency_contact_relation?: string | null
          emergency_contact_whatsapp?: string | null
          employee_id?: string | null
          experience_letter?: string | null
          father_husband_name?: string | null
          full_name: string
          id?: string
          job_id?: string | null
          job_title?: string
          nationality?: string | null
          other_docs?: string | null
          passport_photo?: string | null
          permanent_address?: string | null
          phone1?: string | null
          phone2?: string | null
          postal_address?: string | null
          province?: string | null
          resume_cv?: string | null
          status?: string
          tehsil?: string | null
          updated_at?: string | null
          verification_id?: string
          whatsapp?: string | null
          work_experience?: string | null
        }
        Update: {
          admin_notes?: string | null
          age?: number | null
          application_number?: string
          bform_number?: string | null
          city?: string | null
          cnic?: string
          cnic_doc?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          district?: string | null
          education?: string | null
          educational_docs?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          emergency_contact_relation?: string | null
          emergency_contact_whatsapp?: string | null
          employee_id?: string | null
          experience_letter?: string | null
          father_husband_name?: string | null
          full_name?: string
          id?: string
          job_id?: string | null
          job_title?: string
          nationality?: string | null
          other_docs?: string | null
          passport_photo?: string | null
          permanent_address?: string | null
          phone1?: string | null
          phone2?: string | null
          postal_address?: string | null
          province?: string | null
          resume_cv?: string | null
          status?: string
          tehsil?: string | null
          updated_at?: string | null
          verification_id?: string
          whatsapp?: string | null
          work_experience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          closing_date: string | null
          created_at: string | null
          department: string
          description: string
          id: string
          id_code: string | null
          is_active: boolean | null
          location: string
          requirements: string[] | null
          salary: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          closing_date?: string | null
          created_at?: string | null
          department: string
          description: string
          id?: string
          id_code?: string | null
          is_active?: boolean | null
          location?: string
          requirements?: string[] | null
          salary?: string | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          closing_date?: string | null
          created_at?: string | null
          department?: string
          description?: string
          id?: string
          id_code?: string | null
          is_active?: boolean | null
          location?: string
          requirements?: string[] | null
          salary?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device: string | null
          duration_seconds: number | null
          id: string
          ip_address: string | null
          os: string | null
          page_path: string
          referrer: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          os?: string | null
          page_path: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          os?: string | null
          page_path?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          is_active: boolean | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          display_id: string
          end_date: string | null
          id: string
          invoice_id: string | null
          milestones: Json | null
          notes: string | null
          quotation_id: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          display_id?: string
          end_date?: string | null
          id?: string
          invoice_id?: string | null
          milestones?: Json | null
          notes?: string | null
          quotation_id?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          display_id?: string
          end_date?: string | null
          id?: string
          invoice_id?: string | null
          milestones?: Json | null
          notes?: string | null
          quotation_id?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_address: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          discount: number | null
          id: string
          items: Json
          notes: string | null
          paid_amount: number | null
          quotation_number: string
          status: string | null
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total: number
          updated_at: string | null
          valid_until: string | null
          verification_id: string
        }
        Insert: {
          client_address?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          discount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          paid_amount?: number | null
          quotation_number?: string
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
          valid_until?: string | null
          verification_id?: string
        }
        Update: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          discount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          paid_amount?: number | null
          quotation_number?: string
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
          valid_until?: string | null
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          budget: string | null
          created_at: string | null
          description: string
          display_id: string
          email: string
          id: string
          is_read: boolean | null
          name: string
          phone: string | null
          service: string | null
          status: string
          timeline: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string | null
          description: string
          display_id?: string
          email: string
          id?: string
          is_read?: boolean | null
          name: string
          phone?: string | null
          service?: string | null
          status?: string
          timeline?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string | null
          description?: string
          display_id?: string
          email?: string
          id?: string
          is_read?: boolean | null
          name?: string
          phone?: string | null
          service?: string | null
          status?: string
          timeline?: string | null
        }
        Relationships: []
      }
      salary_slips: {
        Row: {
          allowances: number | null
          basic_salary: number | null
          created_at: string | null
          deductions: number | null
          id: string
          month: string
          net_salary: number | null
          notes: string | null
          staff_id: string
          status: string | null
          verification_id: string
          year: number
        }
        Insert: {
          allowances?: number | null
          basic_salary?: number | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          month: string
          net_salary?: number | null
          notes?: string | null
          staff_id: string
          status?: string | null
          verification_id?: string
          year?: number
        }
        Update: {
          allowances?: number | null
          basic_salary?: number | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          month?: string
          net_salary?: number | null
          notes?: string | null
          staff_id?: string
          status?: string | null
          verification_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "salary_slips_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      service_inquiries: {
        Row: {
          address: string | null
          approved_budget: string | null
          attachments: string[] | null
          city: string | null
          created_at: string | null
          display_id: string
          email: string
          full_name: string
          id: string
          is_read: boolean | null
          phone: string | null
          project_description: string
          project_timeline: string | null
          resolved_at: string | null
          resolved_attachments: string[] | null
          resolved_notes: string | null
          service_title: string | null
          status: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          approved_budget?: string | null
          attachments?: string[] | null
          city?: string | null
          created_at?: string | null
          display_id?: string
          email: string
          full_name: string
          id?: string
          is_read?: boolean | null
          phone?: string | null
          project_description: string
          project_timeline?: string | null
          resolved_at?: string | null
          resolved_attachments?: string[] | null
          resolved_notes?: string | null
          service_title?: string | null
          status?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          approved_budget?: string | null
          attachments?: string[] | null
          city?: string | null
          created_at?: string | null
          display_id?: string
          email?: string
          full_name?: string
          id?: string
          is_read?: boolean | null
          phone?: string | null
          project_description?: string
          project_timeline?: string | null
          resolved_at?: string | null
          resolved_attachments?: string[] | null
          resolved_notes?: string | null
          service_title?: string | null
          status?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          code: string | null
          created_at: string | null
          description: string
          features: string[] | null
          icon: string
          id: string
          is_active: boolean | null
          minimum_charges: number | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description: string
          features?: string[] | null
          icon?: string
          id?: string
          is_active?: boolean | null
          minimum_charges?: number | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description?: string
          features?: string[] | null
          icon?: string
          id?: string
          is_active?: boolean | null
          minimum_charges?: number | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          bank_account: string | null
          cnic: string | null
          created_at: string | null
          department: string | null
          display_id: string
          email: string | null
          id: string
          is_active: boolean | null
          join_date: string | null
          name: string
          phone: string | null
          position: string
          salary: number | null
          staff_type: string
          updated_at: string | null
        }
        Insert: {
          bank_account?: string | null
          cnic?: string | null
          created_at?: string | null
          department?: string | null
          display_id?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          join_date?: string | null
          name: string
          phone?: string | null
          position: string
          salary?: number | null
          staff_type?: string
          updated_at?: string | null
        }
        Update: {
          bank_account?: string | null
          cnic?: string | null
          created_at?: string | null
          department?: string | null
          display_id?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          join_date?: string | null
          name?: string
          phone?: string | null
          position?: string
          salary?: number | null
          staff_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string | null
          created_at: string | null
          display_id: string
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          message: string
          name: string
          rating: number | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          display_id?: string
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          message: string
          name: string
          rating?: number | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          display_id?: string
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          message?: string
          name?: string
          rating?: number | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          display_id: string
          from_name: string | null
          id: string
          notes: string | null
          payment_method: string | null
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          to_name: string | null
          transaction_date: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string | null
          description: string
          display_id?: string
          from_name?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          to_name?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          display_id?: string
          from_name?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          to_name?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device: string | null
          id: string
          ip_address: string | null
          is_online: boolean | null
          last_seen_at: string | null
          os: string | null
          pages_visited: number | null
          session_id: string
          started_at: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device?: string | null
          id?: string
          ip_address?: string | null
          is_online?: boolean | null
          last_seen_at?: string | null
          os?: string | null
          pages_visited?: number | null
          session_id: string
          started_at?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device?: string | null
          id?: string
          ip_address?: string | null
          is_online?: boolean | null
          last_seen_at?: string | null
          os?: string | null
          pages_visited?: number | null
          session_id?: string
          started_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_display_id: { Args: { prefix: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
