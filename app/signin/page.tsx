import { SignInForm } from './SignInForm';

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <div className="shell">
      <div className="center">
        <div>
          <div className="lp-mark" aria-hidden>
            <svg viewBox="0 0 24 24"><path d="M9 7.5v9l7-4.5-7-4.5z" fill="#0d1319" /></svg>
          </div>
          <h1>Sign in</h1>
          <p>Enter your email and we&rsquo;ll send a secure link. No password needed.</p>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
