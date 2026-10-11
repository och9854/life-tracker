# Authentication email templates

These templates are for the personal Life Journal Supabase project. Paste them
into **Authentication → Email Templates**. They deliberately use
`{{ .Token }}` because the product asks the person to enter a six-digit code
inside the app instead of relying on an email link opening in the same browser.

## Confirm signup

- **Subject:** `Life Journal 가입 인증번호`

```html
<h2>Life Journal에 오신 것을 환영해요.</h2>
<p>아래 인증번호를 앱에 입력하면 내 기록을 시작할 수 있어요.</p>
<p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">{{ .Token }}</p>
<p>이 인증번호를 요청하지 않았다면 이 메일을 무시해 주세요.</p>
<p>오늘은 한 줄이면 충분해요.<br />Life Journal</p>
```

## Reset password

- **Subject:** `Life Journal 비밀번호 재설정 인증번호`

```html
<h2>비밀번호를 다시 설정할까요?</h2>
<p>아래 인증번호를 앱에 입력하면 새 비밀번호를 정할 수 있어요.</p>
<p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">{{ .Token }}</p>
<p>비밀번호 재설정을 요청하지 않았다면 이 메일을 무시해 주세요.</p>
<p>Life Journal</p>
```

## Delivery checklist

1. In **Authentication → Providers → Email**, keep email sign-in enabled and
   email confirmation enabled.
2. In **Email Templates**, replace the subjects and bodies for **Confirm
   signup** and **Reset password** with the versions above.
3. Configure a custom SMTP sender before inviting people outside the Supabase
   team. The default sender is only appropriate for limited testing.
