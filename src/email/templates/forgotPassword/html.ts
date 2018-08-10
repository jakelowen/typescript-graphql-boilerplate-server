export default (url: string) => `
<html>
  <p>
    Someone has requested a password reset for this email address. If was not you, you can safely ignore this email.
  </p>
  <p>
    You can reset your password by clicking <a href="${url}">here</a>
  </p>
</html>
`;
