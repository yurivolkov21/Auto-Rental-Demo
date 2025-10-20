export interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: 'new' | 'in_progress' | 'resolved';
    admin_notes: string | null;
    user_id: number | null;
    created_at: string;
    updated_at: string;
}
