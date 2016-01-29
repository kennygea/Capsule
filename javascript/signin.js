$('.menu .item').tab();
$('.ui.form').form({
  fields: {
    name: {
      rules: [
        {type: 'empty', prompt: 'Please enter your name.'}
      ]
    },
    username: {
      rules: [
        {type: 'email', prompt: 'This does not look like a valid email!'}
      ]
    },
    password: {
      identifier: 'password',
      rules: [
        {type: 'minLength[6]', prompt: 'Password must be at least 6 characters'},
      ]
    },
    confpassword: {
      identifier: 'confpassword',
      rules: [
        {type: 'match[password]', prompt: 'Passwords do not match'}
      ]
    }
  }
});
