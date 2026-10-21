# Supabase email templates

Paste each into Supabase → **Authentication → Emails → Templates**: the subject into *Subject*, the HTML file into *Message body* (Source).

| Supabase template | Subject | File |
|---|---|---|
| Confirm signup | Welcome to RITA. Confirm your email | `confirm-signup.html` |
| Magic link | Your RITA sign-in link | `magic-link.html` |
| Reset password | Reset your RITA password | `reset-password.html` |
| Invite user | You’re invited to RITA | `invite.html` |
| Change email address | Confirm your new email for RITA | `change-email.html` |

The logo loads from `https://rita-woad.vercel.app/brand/rita-logo-email.png`. When the domain changes, replace `rita-woad.vercel.app` in each file.

Supabase’s built-in email sender is limited to a few emails per hour. Before launch, add your own SMTP provider in **Authentication → Emails → SMTP Settings** (e.g. Brevo or Resend) and send from an address such as `hello@rita.africa`.
