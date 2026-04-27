import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Folder } from 'lucide-react';
import Link from 'next/link';

const emailCategories = [
  {
    name: 'Application Emails',
    path: 'application',
    files: [
      { name: 'Event Registration', file: 'event-registration.html' },
      { name: 'Welcome Email', file: 'welcome.html' },
      { name: 'Coach Training Registration', file: 'coach-training-registration.html' },
      { name: 'Membership Confirmation', file: 'membership-confirmation.html' },
      { name: 'Password Reset', file: 'password-reset.html' },
      { name: 'Supabase Verification', file: 'supabase-verification.html' },
    ],
  },
  {
    name: 'Supabase Auth Emails',
    path: 'supabase',
    files: [
      { name: 'Change Email Confirmation', file: 'change-email.html' },
      { name: 'Confirm Signup', file: 'confirm-signup.html' },
      { name: 'Magic Link', file: 'magic-link.html' },
      { name: 'Reset Password', file: 'reset-password.html' },
    ],
  },
];

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <p className="mt-1 text-muted-foreground">View and manage email templates</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {emailCategories.map((category) => (
          <Card key={category.path}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-primary" />
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.files.map((file) => (
                <Link
                  key={file.file}
                  href={`/admin/emails/${category.path}/${file.file}`}
                  className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {file.name}
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
