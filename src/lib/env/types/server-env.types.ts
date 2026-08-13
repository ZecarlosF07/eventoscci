export interface CertificateServerEnv {
  serviceRoleKey: string;
  siteUrl: string;
  supabaseUrl: string;
}

export interface NotificationServerEnv extends CertificateServerEnv {
  cronSecret: string;
  n8nWebhookSecret?: string;
  n8nWebhookUrl: string;
}
